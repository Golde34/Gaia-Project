import datetime
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
import traceback
import pandas as pd

from core.usecase.rag_usecase import upload_context_to_vectordb, query_context 


RagRouter = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)

@RagRouter.post("/upload-context")
async def upload_context(file: UploadFile = File(...)):
    try:
        content = await file.read()
        context_string = content.decode('utf-8')
        metadata = {
            "file_name": file.filename,
            "file_type": file.content_type,
            "upload_time": datetime.datetime.now().isoformat(), 
        }

        # context_list = [line.strip()
        #             for line in content.decode('utf-8').splitlines() if line.strip()]
        return await upload_context_to_vectordb([context_string], metadata)
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

@RagRouter.post("/upload-csv-context")
async def upload_context(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        df = pd.read_csv(file)
        row_strings = df.apply(lambda row: ' | '.join(f"{col}: {row[col]}" for col in df.columns), axis=1)
        context_list = row_strings.tolist()
        metadata = {
            "file_name": file.filename,
            "file_type": file.content_type,
            "upload_time": datetime.datetime.now().isoformat(),
        }

        return await upload_context_to_vectordb(context_list, metadata)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
