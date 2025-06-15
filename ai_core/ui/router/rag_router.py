from fastapi import APIRouter, HTTPException
import traceback

from core.domain.request import query_request


RagRouter = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)

@RagRouter.post("/upload-context")
async def upload_context(request: query_request.RAGRequest):
    try:
        content = await request.file.read()
        context_str = content.decode('utf-8')
        metadata = {
            "file_name": request.file.filename,
            "file_type": request.file.content_type,
            "upload_time": request.upload_time,
        }

        # embedder = BaseEmbedding()
        # embeddings = await embedder.get_embeddings(context_str)

        # milvus_db.insert_data(
        #     vectors=embeddings,
        #     contents=context_str,
        #     metadata_list=[metadata] 
        # )

        print("RAG data inserted successfully.")

        return None 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))