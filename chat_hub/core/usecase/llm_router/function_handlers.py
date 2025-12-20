from typing import Callable, Dict, Any


# Function registry to store decorated functions
_FUNCTION_REGISTRY: Dict[str, Dict[str, Any]] = {}


def function_handler(label: str, is_sequential: bool = False):
    """
    Decorator to register a function handler for LLM routing.
    
    Apply this decorator directly to service methods to register them
    as callable functions for LLM function calling.
    
    Args:
        label (str): The label/identifier for this function (e.g., enum value)
        is_sequential (bool): Whether the function should be executed sequentially
        
    Usage in service file:
        @function_handler(label=enum.GaiaAbilities.CREATE_TASK.value, is_sequential=True)
        async def create_personal_task(self, query):
            # implementation
            pass
    """
    def decorator(func: Callable):
        _FUNCTION_REGISTRY[label] = {
            'handler': func,
            'is_sequential': is_sequential,
        }
        return func
    return decorator


def get_functions():
    """Get all registered function handlers."""
    return _FUNCTION_REGISTRY

FUNCTIONS = _FUNCTION_REGISTRY
