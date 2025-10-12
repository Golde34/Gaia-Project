from infrastructure.llm import system_generate_content


MODEL_INTERFACE = {
    "gemini-2.0-flash": system_generate_content.generate_content,
}


async def get_model_generate_content(model_name: str) -> str:
    if model_name not in MODEL_INTERFACE:
        raise ValueError(f"Model {model_name} not supported")
    return MODEL_INTERFACE.get(model_name, "gemini-2.0-flash")
