PORTS = {
    ## CLIENT 
    "client_gui": {
        "name": "Client GUI",
        "port": 5173,
        "programming_language": "JavaScript",
        "description": "Client GUI for GAIA",
        "router": None,
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/client_gui.sh"
    },
    "mobile_app": {
        "name": "Mobile App",
        "port": 5002,
        "programming_language": "Dart",
        "description": "Mobile App for GAIA",
        "router": None,
        "database": None,
        "database_name": None,
        "shell_path": ""
    },
    
    ## MIDDLEWARE
    "middleware_loader": {
        "name": "Middleware Loader",
        "port": 4000,
        "programming_language": "Go",
        "description": "Middleware Loader Layer",
        "router": "middleware",
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/middleware_loader.sh"
    },
    "gaia_connector": {
        "name": "GAIA",
        "port": 5000,
        "programming_language": "Python",
        "description": "GAIA Connector to others microservices",
        "router": "gaia",
        "database": "MongoDB",
        "database_name": "gaia",
        "shell_path": "gaia_bot/microservices/bash_shell/gaia_connector.sh"
    }, 
    "notify_agent": {
        "name": "Notify Agent",
        "port": 4003,
        "programming_language": "Golang",
        "description": "Notify Agent API",
        "router": "notify-agent",
        "database": "MongoDB",
        "database_name": "notify_agent",
        "shell_path": "gaia_bot/microservices/bash_shell/notify_agent.sh"
    },
    "chat_hub": {
        "name": "Chat Hub",
        "port": 4002,
        "programming_language": "Python",
        "description": "Chat Hub API",
        "router": "chat-hub",
        "database": "PostgreSQL",
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/chat_hub.sh"
    },

    ## BACKEND MICROSERVICES
    # User Services
    "authentication_service": {
        "name": "Authentication Service",
        "port": 4001,
        "programming_language": "Java",
        "description": "Authentication Service API",
        "router": "auth",
        "database": "MySQL",
        "database_name": "authentication_service",
        "shell_path": "gaia_bot/microservices/bash_shell/auth_service.sh"
    },
    # Task Manager Services
    "task_manager": {
        "name": "Task Manager",
        "port": 3000,
        "programming_language": "TypeScript",
        "description": "Task Manager API",
        "router": "task-manager",
        "database": "MongoDB",
        "database_name": "task_manager",
        "shell_path": "gaia_bot/microservices/bash_shell/task_manager.sh"
    },
    "github_api": {
        "name": "GitHub API",
        "port": 3012,
        "programming_language": "TypeScript",
        "description": "GitHub API",
        "router": "github-api",
        "database": None,
        "database_name": None,
        "shell_path": ""
    },
    "schedule_plan": {
        "name": "Schedule Plan",
        "port": 3002,
        "programming_language": "TypeScript",
        "description": "Schedule API",
        "router": "schedule-plan",
        "database": "MongoDB",
        "database_name": "schedule_plan",
        "shell_path": "gaia_bot/microservices/bash_shell/schedule_plan.sh"
    },
    "work_optimization": {
        "name": "Work Optimization",
        "port": 3001,
        "programming_language": "Java",
        "description": "Work Optimization API",
        "router": "work-optimization",
        "database": "MySQL",
        "database_name": "work_optimization",
        "shell_path": "gaia_bot/microservices/bash_shell/work_optimization.sh"
    },
    "contribution_tracker": {
        "name": "Contribution Tracker",
        "port": 3003,
        "programming_language": "TypeScript",
        "description": "Contribution Tracker API",
        "router": "contribution-tracker",
        "database": "MySQL",
        "database_name": "contribution_tracker",
        "shell_path": "gaia_bot/microservices/bash_shell/contribution_tracker.sh"
    },
    
    ## AI MODELS MICROSERVICES
    "camera_cv": {
        "name": "Camera CV",
        "port": 3003,
        "programming_language": "Python",
        "description": "Camera CV API",
        "router": "camera-cv",
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/camera_cv.sh"
    }, 
    
    ## THIRD PARTY + DATA PIPELINE
    "kafka_server": {
        "name": "Kafka Server",
        "port": None,
        "programming_language": "Java, Golang, TypeScript, Python, C#",
        "description": "Kafka Server",
        "router": None,
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/kafka_server.sh",
        "process_name": "kafka"
    },
     "sor_data_transfer": {
        "name": "Sentence Object Recognizer Data Pipeline",
        "port": None,
        "programming_language": "Python",
        "description": "Sentence Object Recognizer API",
        "router": "sor",
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/sor_data_transfer.sh",
        "process_name": "sor-data-transfer"
    },
    "gaia_cron_job": {
        "name": "GAIA Cron Job",
        "port": None,
        "programming_language": "Golang",
        "description": "GAIA Cron Job",
        "router": None,
        "database": None,
        "database_name": None,
        "shell_path": "gaia_bot/microservices/bash_shell/gaia_cron_job.sh",
        "process_name": "gaia-cron-job"
    }
}



PORT_COMPONENTS = [
    # "gaia_connector",
    "authentication_service",
    "task_manager",
    "client_gui",
    "middleware_loader",
    # "camera_cv",
    "schedule_plan",
    "work_optimization",
    "notify_agent",
    "contribution_tracker",
    # "ai_core",
    "chat_hub",
    # 3rd Party + Pipeline
    "sor_data_transfer",
    "kafka_server",
    "gaia_cron_job",
]

DOMAIN = "localhost"