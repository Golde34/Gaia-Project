import datetime
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
import traceback

from core.service.rag_service import upload_context_to_vectordb, query_context 


RagRouter = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)

@RagRouter.post("/upload-context")
async def upload_context(file: UploadFile = File(...)):
    try:
        content = await file.read()
        context_str = content.decode('utf-8')
        metadata = {
            "file_name": file.filename,
            "file_type": file.content_type,
            "upload_time": datetime.datetime.now().isoformat(), 
        }

        return await upload_context_to_vectordb(context_str, metadata)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))


@RagRouter.get("/search-context")
async def search_similar_contexts(query: str = Query(..., description="Input text to find similar context"),
                                  top_k: int = Query(5, ge=1, le=100, description="Number of similar contexts to return"),
                                  partition_name: str = Query("default_context", description="Partition name to search in")):
    try:
        return await query_context(query, top_k, partition_name) 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

