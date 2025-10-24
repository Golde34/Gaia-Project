import base64
import os
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend


class SecurityConfig:
    def __init__(self):
        self.private_token = os.getenv('PRIVATE_TOKEN', '')
        self.public_key = os.getenv('PUBLIC_KEY', '')
        self.private_key = os.getenv('PRIVATE_KEY', '')
        self.sse_public_key = os.getenv('SSE_PUBLIC_KEY', '')
        self.sse_private_key = os.getenv('SSE_PRIVATE_KEY', '')

    def encrypt(self, plain_text: str):
        public_key_bytes = base64.b64decode(self.public_key)
        public_key_serialization = serialization.load_der_public_key(
            public_key_bytes, backend=default_backend())
        encrypted = public_key_serialization.encrypt(
            plain_text.encode('utf-8'),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode('utf-8')

    def encrypt_sse(self, plain_text: str):
        sse_public_key_bytes = base64.b64decode(self.sse_public_key)
        sse_public_key_serialization = serialization.load_der_public_key(
            sse_public_key_bytes, backend=default_backend())
        encrypted = sse_public_key_serialization.encrypt(
            plain_text.encode('utf-8'),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode('utf-8')
    
    def decrypt_sse(self, encrypted_text: str):
        sse_private_key_bytes = base64.b64decode(self.sse_private_key)
        sse_private_key_serialization = serialization.load_der_private_key(
            sse_private_key_bytes,
            password=None,
            backend=default_backend()
        )
        decrypted = sse_private_key_serialization.decrypt(
            base64.b64decode(encrypted_text),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode('utf-8')


security_config = SecurityConfig()
