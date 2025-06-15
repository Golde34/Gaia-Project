import datetime
from fastapi import APIRouter, File, HTTPException, UploadFile
import traceback

from core.domain.request import query_request
from core.service.rag_service import upload_context_to_vectordb 


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