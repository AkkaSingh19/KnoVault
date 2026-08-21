import threading
import json
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status 
from .models import Document, ChatMessage, Chunk, Artifact
from .serializers import DocumentSerializer, SignupSerializer
from .ingestion import process_document  
from .embeddings import embed_texts
from .vector_store import search, _index_path
from .generation import generate_answer, generate_summary, generate_keywords, generate_study_notes
from rest_framework_simplejwt.tokens import RefreshToken


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.lower().endswith('.pdf'):
            return Response({'error': 'Only PDF files are supported'}, status=status.HTTP_400_BAD_REQUEST)

        doc = Document.objects.create(
            owner=request.user,
            file=file,
            original_filename=file.name,
            status='processing'
        )

        
        thread = threading.Thread(target=process_document, args=(doc.id,))
        thread.start()

        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        docs = Document.objects.filter(owner=request.user).order_by('-created_at')
        return Response(DocumentSerializer(docs, many=True).data)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND) 
        return Response(DocumentSerializer(doc).data)

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if doc.status != 'ready':
            return Response({'error': 'Document is not ready yet'}, status=status.HTTP_400_BAD_REQUEST)

        question = request.data.get('question', '').strip()
        if not question:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)

        #Embed query
        query_embedding = embed_texts([question])[0]

        #Retrieve chunks
        top_positions = search(doc.id, query_embedding, top_k=4)
        chunks = [
            Chunk.objects.get(document=doc, chunk_index=pos)
            for pos in top_positions
            if pos >= 0 
        ]
        context_chunks = [{'text': c.text, 'page_number': c.page_number} for c in chunks]

        #last 4 messages as conversation memory
        recent_messages = ChatMessage.objects.filter(document=doc).order_by('-created_at')[:4]
        chat_history = [
            {'role': m.role, 'content': m.content} for m in reversed(recent_messages)
        ]

        #Generate an answer
        answer = generate_answer(question, context_chunks, chat_history)
        if answer.startswith("__ERROR__"):
            return Response(
                {'error': 'AI service temporarily unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        #Save both messages
        ChatMessage.objects.create(document=doc, role='user', content=question)
        source_pages = sorted(set(c.page_number for c in chunks))
        ChatMessage.objects.create(
            document=doc, role='assistant', content=answer, source_pages=source_pages
        )

        return Response({
            'answer': answer,
            'source_pages': source_pages
        })


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(document=doc).order_by('created_at')
        data = [
            {'role': m.role, 'content': m.content, 'source_pages': m.source_pages, 'created_at': m.created_at}
            for m in messages
        ]
        return Response(data)


def clean_json_response(text):
    text = text.strip()
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())


class DocumentToolView(APIView):
    permission_classes = [IsAuthenticated]

    GENERATORS = {
        'summary': generate_summary,
        'keywords': generate_keywords,
        'study_notes': generate_study_notes,
    }

    def post(self, request, pk, kind):
        if kind not in self.GENERATORS:
            return Response({'error': 'Invalid tool kind'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doc = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if doc.status != 'ready':
            return Response({'error': 'Document is not ready yet'}, status=status.HTTP_400_BAD_REQUEST)

        # check cache first
        artifact = Artifact.objects.filter(document=doc, kind=kind).first()
        if artifact:
            return Response(artifact.content)

        # build full text from chunks
        chunks = Chunk.objects.filter(document=doc).order_by('chunk_index')
        full_text = "\n".join(c.text for c in chunks)

        raw_output = self.GENERATORS[kind](full_text)

        if raw_output.startswith("__ERROR__"):
            if "RESOURCE_EXHAUSTED" in raw_output or "429" in raw_output:
                return Response(
                    {'error': 'Daily AI usage limit reached. Please try again later.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            return Response(
                {'error': 'AI service temporarily unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            content = clean_json_response(raw_output)
        except json.JSONDecodeError:
            return Response({'error': 'Failed to parse AI response', 'raw': raw_output}, status=status.HTTP_502_BAD_GATEWAY)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # remove FAISS index file
        index_file = _index_path(doc.id)
        if os.path.exists(index_file):
            os.remove(index_file)

        # remove uploaded PDF
        if doc.file and os.path.exists(doc.file.path):
            os.remove(doc.file.path)

        doc.delete()  
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)