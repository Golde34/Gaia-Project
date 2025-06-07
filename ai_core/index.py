from fastapi import FastAPI, HTTPException 
from dotenv import load_dotenv
import uvicorn
import traceback

from core.domain.request import query_request
from ui.chat_controller import handle_user_prompt 
from ui.onboarding_controller import handle_onboarding
from ui.rag_controller import insert_rag_data 

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

@app.post("/chat")
async def chat(request: query_request.QueryRequest):
    try:
        print("Received request:", request)
        return handle_user_prompt(query=request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/onboarding")
async def task_register(request: query_request.SystemRequest):
    try:
        print("Received task config register request:", request)
        return handle_onboarding(request) 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-context")
async def upload_context(request: query_request.RAGRequest):
    try:
        print("Received RAG insert request:", request)
        return await insert_rag_data(request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Task Information Extraction API is running. Use POST /extract-task endpoint to extract task information."}

# Run the API server if the script is executed directly
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
