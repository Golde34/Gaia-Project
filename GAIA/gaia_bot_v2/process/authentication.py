import asyncio

from gaia_bot_v2.abilities.microservice_connections import MicroserviceConnection
from gaia_bot_v2.domain.enums import InputMode, AuthenType, MicroserviceAcronymsEnum
from gaia_bot_v2.kernel.configs.auth_config import USER_PROFILE
from gaia_bot_v2.kernel.configs.settings import DEFAULT_GENERAL_SETTINGS
import sys
from gaia_bot_v2.microservices.connection.authen_command import AuthenticationConnector

class AuthenticationCommand():
    
    def __init__(self, auth_service_status):
        self.token = None
        self.auth_service_status = auth_service_status
        self.input_mode = DEFAULT_GENERAL_SETTINGS['input_mode']

    async def process(self):
        try:
            username = USER_PROFILE.get("username")
            password = USER_PROFILE.get("password")
            method, status = await self.select_authentication_method()
            if method is not None and status:
                if self.auth_service_status:
                    self.login_to_get_token(username, password)
                    self.token = self.save_token()
                    return self.token, username, True
                else:
                    raise Exception("Authentication service is not available")
            raise Exception("Authentication failed")
        except Exception as e:
            print(f"Error: {e}")
            return None, username, False

    async def select_authentication_method(self):
        if self.input_mode == InputMode.VOICE.value:
            result = await self.authentication_task(self.voice_recognition_method)
            if result:
                print("Voice authentication successful")
                return AuthenType.VOICE._value_, True
            else:
                print("Voice authentication failed")

        # If input_mode is text, or voice authentication failed
        face_task = asyncio.create_task(self.authentication_task(self.face_recognition_method))
        done, pending = await asyncio.wait([face_task], timeout=15)

        if face_task in done:
            if await face_task:
                print("Face authentication successful")
                return AuthenType.FACE._value_, True
            else:
                print("Face authentication failed")
        else:
            print("Face authentication timeout")
            face_task.cancel()

        username_password_authen_result = await self.authentication_task(self.username_password_method)
        if username_password_authen_result:
            return AuthenType.TOKEN._value_, True
        
        return None, False

    async def authentication_task(self, method):
        result = await asyncio.get_running_loop().run_in_executor(None, method)
        return result

    def face_recognition_method(self):
        pass

    def voice_recognition_method(self):
        pass

    def username_password_method(self):
        return "Golde", "483777"

    def check_auth_service_status(self):
        auth_service_status = MicroserviceConnection().check_microservice_state_by_name(MicroserviceAcronymsEnum.AS.value())
        return auth_service_status
    
    def login_to_get_token(self, username, password):
        authenticationConnector = AuthenticationConnector(username, password)
        return authenticationConnector.call_login_api()
    
    def save_token(self):
        pass