from infrastructure.llm import system_generate_content


MODEL_INTERFACE = {
    "google": system_generate_content.generate_content,
}


async def get_model_generate_content(organization: str) -> str:
    if organization not in MODEL_INTERFACE:
        raise ValueError(f"Model {organization} not supported")
    return MODEL_INTERFACE.get(organization, "google")