from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from google import genai
from dotenv import load_dotenv
import os
import uvicorn
import json

# Load environment variables
load_dotenv()

# Initialize Google Generative AI client
client = genai.Client(api_key=os.getenv('API_KEY'))

# Define the output format model
class OutputFormat(BaseModel):
    Project: str
    GroupTask: str
    Title: str
    Priority: str
    Status: str
    StartDate: Optional[str] = None
    Deadline: Optional[str] = None
    Duration: Optional[str] = None

# Define the input request model
class TaskRequest(BaseModel):
    query: str

# Create FastAPI app
app = FastAPI(title="Task Information Extraction API")

# Define the extraction prompt
def create_prompt(query: str) -> str:
    return f"""# Task Information Extraction Prompt

You are an AI assistant specialized in extracting structured information from natural language queries about tasks. Your job is to analyze user queries and convert them into a standardized JSON format with specific fields.

## Instructions:

1. Carefully read the user's query about creating or modifying a task.
2. Extract all relevant information that fits into the predefined fields.
3. Return a valid JSON object with the extracted information.
4. If a field's information is not present in the query, use `null` as the value.
5. Do not add any explanations or text outside the JSON object.

## JSON Fields to Extract:

- `Project`: The project name the task belongs to (e.g., "Gaia", "Artemis", "Default" if not specified)
- `GroupTask`: The group or team the task is assigned to (e.g., "AI Models", "Client GUI", "Default" if not specified)
- `Title`: The title or short description of the task (required)
- `Priority`: The priority level of the task ("Low", "Medium", "High", "Star")
- `Status`: The current status of the task ("Pending", "To Do", "In Progress", etc.)
- `StartDate`: When the task should start ("now", specific date, or null)
- `Deadline`: When the task should be completed (e.g., "end of the week", "next month", null)
- `Duration`: How long the task is expected to take (e.g., "2 hours", "3 days", null)

## Priority Mapping Guidelines:
- "urgent", "crucial", "essential", "top priority", "as soon as possible" → "Star" or "High"
- "important" → "High"
- "medium", no explicit priority → "Medium"
- "low priority", "no rush", "not urgent", "keep on radar" → "Low"

## Status Mapping Guidelines:
- Default to "To Do" if no status is specified
- "start now", "currently working" → "In Progress"
- "waiting", "on hold" → "Pending"

## Examples:

Input: "Please set a task in the Artemis project, about creating a user feedback system. This is an important task but not urgent."

Output:
{{
  "Project": "Artemis",
  "GroupTask": "User service",
  "Title": "creating a user feedback system",
  "Priority": "Medium",
  "Status": "Pending",
  "StartDate": null,
  "Deadline": null,
  "Duration": null
}}

Input: "Add task to optimize the AI model training process in Project Gaia. This is a medium priority and should be done by the end of the month."

Output:
{{
  "Project": "Gaia",
  "GroupTask": "AI Models",
  "Title": "optimizing the AI model training process",
  "Priority": "Medium",
  "Status": "To Do",
  "StartDate": "now",
  "Deadline": "end of the month",
  "Duration": null
}}

Input: "I need a task created for the Hermes project, involving the optimization of our database queries. No rush, but it should be monitored."

Output:
{{
  "Project": "Hermes",
  "GroupTask": "Data Processing",
  "Title": "optimization of our database queries",
  "Priority": "Low",
  "Status": "In Progress",
  "StartDate": null,
  "Deadline": null,
  "Duration": null
}}

Now, analyze the user's query and extract the requested information into the JSON format.
User's query: {query}"""

@app.post("/extract-task", response_model=OutputFormat)
async def extract_task_info(request: TaskRequest):
    try:
        # Generate the prompt with the user's query
        prompt = create_prompt(request.query)
        
        # Call the Gemini API
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=[prompt],
            config={
                'response_mime_type': 'application/json',
                'response_schema': OutputFormat,
            },
        )
        
        # Return the extracted information
        print(response)
        return json.loads(response.text)
    except Exception as e:
        # Handle errors
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Task Information Extraction API is running. Use POST /extract-task endpoint to extract task information."}

# Run the API server if the script is executed directly
if __name__ == "__main__":
    uvicorn.run("test_task_create:app", host="0.0.0.0", port=8000, reload=True)