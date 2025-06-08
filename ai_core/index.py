from fastapi import FastAPI, HTTPException 
from dotenv import load_dotenv
import uvicorn
import traceback

from ui.router import chat_router, onboarding_router
from core.domain.request import query_request

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

app.include_router(chat_router.ChatRouter)
app.include_router(onboarding_router.OnboardingRouter)

@app.get("/")
async def root():
    return {"message": "Task Information Extraction API is running. Use POST /extract-task endpoint to extract task information."}

# Run the API server if the script is executed directly
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
