from fastapi import FastAPI, HTTPException 
from dotenv import load_dotenv
import uvicorn

from core.domain.request import query_request
from ui.model_handler import handle_query


# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

@app.post("/extract-task")
async def extract_task_info(request: query_request.TaskRequest):
    try:
        label = "Create Task"
        return handle_query(request.query, label)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Task Information Extraction API is running. Use POST /extract-task endpoint to extract task information."}

# Run the API server if the script is executed directly
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
