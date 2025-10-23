from typing import Dict

from kernel.config.security_config import security_config


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
        token = security_config.encrypt(f"{service}::{private_token}::{user_id}")
        headers["Service-Token"] = token
    except Exception as e:
        print(f"Error encrypting token: {e}")
    return headers
