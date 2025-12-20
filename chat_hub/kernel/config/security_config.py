import os


class SecurityConfig:
    def __init__(self):
        self.private_token = os.getenv('PRIVATE_TOKEN', '')
        self.public_key = os.getenv('PUBLIC_KEY', '')
        self.private_key = os.getenv('PRIVATE_KEY', '')
        self.sse_public_key = os.getenv('SSE_PUBLIC_KEY', '')
        self.sse_private_key = os.getenv('SSE_PRIVATE_KEY', '')


security_config = SecurityConfig()
