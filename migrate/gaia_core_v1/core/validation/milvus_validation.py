def validate_milvus_insert(
    embeddings_tensor: any, 
) -> None:
    if hasattr(embeddings_tensor, "tolist"):
        embeddings = embeddings_tensor.tolist()
    elif isinstance(embeddings_tensor, list):
        embeddings = embeddings_tensor
    else:
        raise ValueError("Unexpected type for embeddings_tensor: {}".format(
            type(embeddings_tensor)))
    
    return embeddings

def validate_milvus_search_top_n(
    query_embeddings: any, 
) -> None:
    if hasattr(query_embeddings, "tolist"):
        query_embeddings = query_embeddings.tolist()
    elif isinstance(query_embeddings, list) and hasattr(query_embeddings[0], "tolist"):
        query_embeddings = [emb.tolist() for emb in query_embeddings]
    
    if isinstance(query_embeddings, list) and isinstance(query_embeddings[0], float):
        query_embeddings = [query_embeddings]
    
    if not isinstance(query_embeddings, list) or not all(isinstance(emb, list) for emb in query_embeddings):
        raise ValueError("query_embeddings must be a list of lists.")

    return query_embeddings