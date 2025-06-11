from  infrastructure.llm import gemini_generate_content 


MODELS_INTERFACE = {
    "gemini-2.0-flash": gemini_generate_content.generate_content,
    "unsloth": "UNSLOTH" 
}

def get_model_generate_content(model_name: str):
    """
    Get the generate content function for the specified model.
    
    Args:
        model_name (str): The name of the model.
        
    Returns:
        str: The generate content function for the model.
    """
    try:
        if model_name not in MODELS_INTERFACE:
            raise ValueError(f"Model {model_name} is not supported.")
        return MODELS_INTERFACE.get(model_name, "unsloth")
    except Exception as e:
        print(f"Error getting model generate content: {e}")
        raise
