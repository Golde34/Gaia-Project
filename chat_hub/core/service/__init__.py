"""
Service layer initialization.
Import all service modules here to ensure decorators are executed.
"""

# Import services with @llm_route decorator
from core.service import orchestrator_service, onboarding_service

# Import services with @function_handler decorator
from core.service.abilities import search, task_service  # noqa: F401

# Add more service imports here as needed
