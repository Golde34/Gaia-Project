from google import genai
from fastapi import HTTPException


client = genai.Client(api_key='')


def generate_content(prompt: str) -> str:
    """
    Generate content using the Gemini API.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated content.
    """
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[prompt],
    )

    # print(response)
    return response.text

if __name__ == "__main__":
    test_prompt = "Write a short poem about the sea."
    try:
        result = generate_content(test_prompt)
        print("Generated Content:\n", result)
    except HTTPException as e:
        print(f"Error generating content: {e.detail}")