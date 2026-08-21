import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a helpful assistant answering questions about a specific document.

Rules you must follow:
1. Use ONLY the information in the provided context. Never use outside knowledge.
2. If the answer isn't in the context, say clearly: "I couldn't find that in this document." Do not guess or make anything up.
3. Keep answers concise — 2-4 sentences unless the question asks for detail or a list.
4. Every factual claim must end with a page citation in this exact format: [Page X] for a single page, or [Page X, Page Y] for multiple pages. Only cite pages that were actually used for that specific claim — do not list every page in the context if only one page was relevant.
5. Do not repeat the question back. Answer directly.
6. Do not mention "the context" or "the provided text" — write as if you've simply read the document."""


def generate_answer(question, context_chunks, chat_history=None):
    try:
        context_text = "\n\n".join(
            f"[Page {c['page_number']}]\n{c['text']}" for c in context_chunks
        )

        history_text = ""
        if chat_history:
            history_text = "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in chat_history)
            history_text = f"\n\nRecent conversation (for context only, do not re-answer these):\n{history_text}"

        prompt = f"""{SYSTEM_PROMPT}

--- DOCUMENT CONTEXT ---
{context_text}
--- END CONTEXT ---
{history_text}

Question: {question}

Answer (remember: cite only the pages actually used, in [Page X] format):"""

        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"__ERROR__: {str(e)}"

#summary, keywords, study notes generation functions
def generate_summary(full_text):
    try:
        prompt = f"""Summarize the following document in a structured format with three sections:
1. Overview (2-3 sentences)
2. Key Points (5-10 bullet points)
3. Conclusion (1-2 sentences)

Return ONLY valid JSON in this exact format:
{{"overview": "...", "key_points": ["...", "..."], "conclusion": "..."}}

Document text:
{full_text}"""

        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"__ERROR__: {str(e)}"


def generate_keywords(full_text):
    try:
        prompt = f"""Extract 8-12 key terms from this document. For each, give a one-line definition based on how it's used in the document.

Return ONLY valid JSON in this exact format:
{{"keywords": [{{"term": "...", "definition": "..."}}]}}

Document text:
{full_text}"""

        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"__ERROR__: {str(e)}"


def generate_study_notes(full_text):
    try:
        prompt = f"""Create concise study notes from this document, organized by topic, suitable for exam revision.

Return ONLY valid JSON in this exact format:
{{"sections": [{{"heading": "...", "points": ["...", "..."]}}]}}

Document text:
{full_text}"""

        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"__ERROR__: {str(e)}"