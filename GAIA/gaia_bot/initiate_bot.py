import asyncio
import colorama

from gaia_bot.abilities.microservice_connections import MicroserviceConnection
from gaia_bot.abilities.response import AlpacaResponse
from gaia_bot.abilities import user_authentication
from gaia_bot.kernel.configs import settings
from gaia_bot.process.console_manager import ConsoleManager
from gaia_bot.process.assistant_skill import AssistantSkill
from gaia_bot.process.processor import Processor
from gaia_bot.models import load_models
from gaia_bot.process.skill_registry import SkillRegistry
from gaia_bot.domain.enums import Mode, MicroserviceStatusEnum, AcronymsEnum, AIModel


async def process_bot(mode=Mode.RUN):
    try:
        # Initiate bot console
        colorama.init()
        print(f"Gaia version: 2.0.0")
        
        # Startup
        loop = asyncio.get_event_loop()
        register_models = await loop.run_in_executor(None, _register_ai_models) 
        services = await _start_satellite_services()
        console_manager, assistant = await loop.run_in_executor(None, _startup, services, register_models)
        
        # Authentication
        authentication_service = [item for item in services if AcronymsEnum.AS.value in item.keys()]
        auth_status = authentication_service[0].get(AcronymsEnum.AS.value) == MicroserviceStatusEnum.ACTIVE.value
        token = await _authentication_process(console_manager=console_manager, auth_service_status=auth_status)

        await _initiate_gaia(
            mode=mode,
            console_manager=console_manager,
            assistant=assistant,
            settings=settings,
            token=token,
            services=services,
            register_models=register_models,
        )
    except Exception as e:
        print(f"Error in process_bot: {e}")
        pass


def _startup(services, register_models):
    console_manager = ConsoleManager()
    assistant = AssistantSkill()
    generate_model, generate_tokenizer = register_models[AIModel.ResponseModel]
    wakeup_text = AlpacaResponse.generate_greeting(generate_model, generate_tokenizer)
    console_manager.wakeup(
        text=wakeup_text,   
        info_log="Bot wakeup...",
        refresh_console=True,
        services=services
    )
    return console_manager, assistant


def _register_ai_models():
    return load_models.run_model_in_parallel()


async def _start_satellite_services():
    microservice_connection = MicroserviceConnection()
    return await microservice_connection.activate_microservice()
        

async def _authentication_process(console_manager, auth_service_status):
    token = ""
    token, username, auth_status = await user_authentication.AuthenticationCommand(console_manager, auth_service_status).process()
    if auth_status is False or token is None:
        print(f"Authentication failed, process user {username} to guess mode.")
        token = _process_guess_mode()

    console_manager.authentication(username, token, info_log="Authentication success.")        
    return token


def _process_guess_mode():
    # Create temporary user profile
    # Store in database
    # Crons job to delete temporary profile after 30 days
    # Delete all actions like tasks, schedules, etc.
    # Crons job check, if last access - created_at > 90 days, suggest user to create new account, or delete all data
    return "token"
    pass


async def _initiate_gaia(
    mode, console_manager, assistant, settings, token, services, register_models
):
    boolean_loop = True
    user_skills = SkillRegistry(services, token).generate_user_skill()
    process = Processor(
        console_manager=console_manager,
        assistant=assistant,
        settings=settings,
        register_models=register_models,
        user_skills=user_skills,
    )
    
    while boolean_loop:
        console_manager.console_output(
            text="Listen your command", info_log="Listen command"
        )
        response_transcript, skill = await process.run(mode=mode)
        console_manager.gaia_output(
            text="~~> " + response_transcript,
            info_log="Response transcript with skill: " + skill,
        )
