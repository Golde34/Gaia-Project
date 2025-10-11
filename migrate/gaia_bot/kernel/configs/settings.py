from gaia_bot.kernel.configs.__config__ import __filename__
from gaia_bot.kernel.configs.enums import InputMode


ROOT_LOG_CONFIG = {
    'version': 1,
    'root': {
        'level': 'INFO',
        'handlers': ['file'],
    },
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filename': __filename__,
            'mode': 'log',
            'maxBytes': 10000000,
            'backupCount': 3,
        },
    },
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
    }
}

DEFAULT_GENERAL_SETTINGS = {
    'assistant_name': 'gaia',
    'input_mode': InputMode.TEXT.value,
    'input_language': 'en',
    'response_in_speech': False
}

AI_MODEL_LOCATION = {
    'gpt2': "./gaia_bot/modules/local/models/gpt/model.pt",
    'task_detect': "./gaia_bot/modules/local/models/task_detect/prompt_to_response/TrainData.pth",
}

USER_PROFILE = {
    'username': 'golde',
    'name': 'Nguyen Dong Duc Viet',
    'password': '',
    'email': 'nguyendongducviet2001@gmail.com',
    'email_password': ''
}