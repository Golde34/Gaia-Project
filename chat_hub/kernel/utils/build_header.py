from typing import Dict

from kernel.config.security_config import security_config
from infrastructure.security import security


# Load security configuration
private_token = security_config.private_token

def build_default_headers() -> Dict[str, str]:
    """
    Build the default headers for JSON requests.
    """
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    return headers

def build_authorization_headers(service: str, user_id: str) -> Dict[str, str]:
    """
    Build headers including the encrypted Service-Token.
    """
    headers = build_default_headers()
    headers["Service"] = service
    try:
        token = security.encrypt(f"{service}::{private_token}::{user_id}")
        headers["Service-Token"] = token
    except Exception as e:
        print(f"Error encrypting token: {e}")
    return headers

def generate_sse_token(user_id: int) -> str:
    """
    Generate an SSE token for the given user ID.
    """
    try:
        service = "chat_hub"
        plain_text = f"{service}::{private_token}::{user_id}"
        sse_token = security.encrypt_sse(plain_text)
        return sse_token
    except Exception as e:
        print(f"Error generating SSE token: {e}")
        return None

def decode_sse_token(encrypted_token: str) -> str:
    """
    Decode the given SSE token to retrieve the original plain text.
    """
    try:
        plain_text = security.decrypt_sse(encrypted_token)
        parts = plain_text.split("::")
        if len(parts) < 3:
            raise ValueError("Invalid SSE token format")
        if parts[0] != "chat_hub":
            raise ValueError("Invalid service in SSE token")
        if parts[1] != private_token:
            raise ValueError("Invalid private token in SSE token")
        user_id = parts[2]
        if user_id == "":
            raise ValueError("User ID is empty in SSE token")
        return user_id
    except Exception as e:
        print(f"Error decoding SSE token: {e}")
        return ""