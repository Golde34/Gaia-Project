import base64

from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend

from kernel.config.security_config import security_config


class SecurityManager:
    def __init__(self):
        self.private_token = security_config.private_token
        self.public_key = security_config.public_key
        self.private_key = security_config.private_key
        self.sse_public_key = security_config.sse_public_key
        self.sse_private_key = security_config.sse_private_key

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

    def validate_token(self, encrypted_text: str, service: str, user_id: str) -> bool:
        decrypted_text = self.decrypt(encrypted_text)
        return decrypted_text == f"{service}::{self.private_token}::{user_id}" 

    def decrypt(self, encrypted_text):
        private_key_bytes = base64.b64decode(self.private_key)
        private_key = serialization.load_der_private_key(private_key_bytes, password=None, backend=default_backend())
        encrypted_bytes = base64.b64decode(encrypted_text)
        decrypted = private_key.decrypt(
            encrypted_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode('utf-8')

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

security = SecurityManager()
