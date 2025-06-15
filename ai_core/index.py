from fastapi import FastAPI 
from dotenv import load_dotenv
import uvicorn

from ui import chat_router, onboarding_router, rag_router


load_dotenv()

app = FastAPI(title="Task Information Extraction API")

app.include_router(chat_router.ChatRouter)
app.include_router(onboarding_router.OnboardingRouter)
app.include_router(rag_router.RagRouter)

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
