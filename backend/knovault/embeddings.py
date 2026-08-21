from sentence_transformers import SentenceTransformer

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')  
    return _model

def embed_texts(texts):
    """texts: list of strings -> returns numpy array of shape (n, 384)"""
    model = get_embedding_model()
    return model.encode(texts, convert_to_numpy=True, show_progress_bar=False)