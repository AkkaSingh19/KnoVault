import faiss
import numpy as np
import os
from django.conf import settings

INDEX_DIR = os.path.join(settings.MEDIA_ROOT, 'faiss_indexes')
os.makedirs(INDEX_DIR, exist_ok=True)

def _index_path(document_id):
    return os.path.join(INDEX_DIR, f'{document_id}.index')

def build_index(document_id, embeddings):
    """embeddings: numpy array (n, 384). Chunk order must match Chunk.chunk_index order."""
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype('float32'))
    faiss.write_index(index, _index_path(document_id))

def load_index(document_id):
    path = _index_path(document_id)
    if not os.path.exists(path):
        return None
    return faiss.read_index(path)

def search(document_id, query_embedding, top_k=4):
    """Returns list of chunk_index positions (matches Chunk.chunk_index) ranked by relevance."""
    index = load_index(document_id)
    if index is None:
        return []
    query = np.array([query_embedding]).astype('float32')
    distances, indices = index.search(query, top_k)
    return indices[0].tolist()  