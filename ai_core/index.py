from fastapi import FastAPI 
from dotenv import load_dotenv
import uvicorn

from ui.router import chat_router, onboarding_router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

app.include_router(chat_router.ChatRouter)
app.include_router(onboarding_router.OnboardingRouter)

# Run the API server if the script is executed directly
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
