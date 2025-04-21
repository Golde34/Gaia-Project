from fastapi import FastAPI, HTTPException 
from dotenv import load_dotenv
import uvicorn
import traceback

from core.domain.request import query_request
from core.service.task_service import task_service



# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

@app.post("/chat")
async def chat(request: query_request.QueryRequest):
    try:
        return task_service(query=request)
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
