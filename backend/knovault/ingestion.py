import pymupdf as fitz  
from .models import Document, Chunk
from .embeddings import embed_texts
from .vector_store import build_index

MIN_CHARS_THRESHOLD = 200
CHUNK_WORD_SIZE = 250
CHUNK_OVERLAP = 50
MAX_PAGES = 100

def extract_text_by_page(file_path):
    doc = fitz.open(file_path)
    pages = []
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        pages.append((page_num + 1, text)) 
    doc.close()
    return pages

def chunk_text(pages):
    """Yields (chunk_text, page_number) tuples with word-based overlap."""
    chunks = []
    for page_num, text in pages:
        words = text.split()
        if not words:
            continue
        start = 0
        while start < len(words):
            end = start + CHUNK_WORD_SIZE
            chunk_words = words[start:end]
            chunks.append((' '.join(chunk_words), page_num))
            if end >= len(words):
                break
            start = end - CHUNK_OVERLAP
    return chunks


def process_document(document_id):
    doc = Document.objects.get(id=document_id)
    try:
        pages = extract_text_by_page(doc.file.path)

        if len(pages) > MAX_PAGES:
            doc.status = 'failed'
            doc.failure_reason = f'Document has {len(pages)} pages, exceeding the {MAX_PAGES}-page limit.'
            doc.save()
            return

        total_chars = sum(len(text) for _, text in pages)

        if total_chars < MIN_CHARS_THRESHOLD:
            doc.status = 'failed'
            doc.failure_reason = 'No extractable text found — this may be a scanned PDF without a text layer.'
            doc.save()
            return

        chunks = chunk_text(pages)
        chunk_texts = [text for text, _ in chunks]

        for idx, (text, page_num) in enumerate(chunks):
            Chunk.objects.create(
                document=doc,
                text=text,
                page_number=page_num,
                chunk_index=idx
            )

        
        embeddings = embed_texts(chunk_texts)
        build_index(doc.id, embeddings)

        doc.page_count = len(pages)
        doc.chunk_count = len(chunks)
        doc.status = 'ready'
        doc.save()

    except Exception as e:
        doc.status = 'failed'
        doc.failure_reason = str(e)
        doc.save()