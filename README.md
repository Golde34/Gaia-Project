# Gaia Project - User Task Management System with AI Assistant

## Overview
Gaia is a comprehensive **User Task Management System** designed to optimize and manage tasks effectively. The system integrates an advanced virtual assistant powered by **Large Language Models (LLM)** and **Named Entity Recognition (NER)** to provide an intelligent, responsive, and personalized task management experience for users.

![image](https://github.com/user-attachments/assets/fe2dc3d9-dd4e-4c70-9dae-254cdc995f94)

## Key Features
### **Core Features**
1. **Virtual AI Assistant**: The system leverages state-of-the-art LLM models to understand user queries, provide insights, and offer seamless task-related assistance in both text and voice formats.
2. **Named Entity Recognition (NER)**: Enhances user input processing by extracting meaningful entities like names, dates, locations, and task-specific details.
<div align="center">
  <img src="https://github.com/user-attachments/assets/5133e1a1-86d8-4a67-a914-c8922a15c635">
</div>

3. **Task Management**: Gaia helps users create, manage, and optimize their tasks efficiently with automation and scheduling capabilities.
<div align="center">
  <img src="https://github.com/user-attachments/assets/689e4e7b-54bb-4dea-89da-c9b3576ac7b1">
</div>

4. **Work Optimization**: Automates task prioritization and schedule planning to ensure maximum productivity.
<div align="center">
  <img src="https://github.com/user-attachments/assets/39ecbf5b-5a05-4dc2-8332-d688b3a2b973">
</div>

5. **Integration & Notifications**: Gaia seamlessly integrates with user calendars, sends timely notifications, and helps manage deadlines.
6. **Logging and Tracking**: Comprehensive logging and tracking ensure transparency and allow users to monitor their tasks and progress.

### **Future Enhancements**
1. **Automatic Task Recognition**: Gaia will automatically identify tasks users need to perform through natural conversations, even when users do not explicitly state their requirements.
2. **Interactive Recommendations**: Gaia will proactively recommend tasks, reminders, and actions to users through notifications and real-time conversations.
3. **Enhanced Chatbot Integrations**: Expanded functionalities to seamlessly integrate the chatbot with other systems, enabling smoother workflows and enhanced productivity.

## How Gaia Works
Gaia operates as an interconnected microservices system, combining AI-powered insights with effective task management workflows:
1. **User Interaction**: Users interact with Gaia via System CLI or Client GUI.
2. **Input Processing**: The AI assistant processes user queries using LLM and NER models to understand intent and extract key entities.
3. **Task Management**: The backend services manage tasks, schedules, and workflows, providing optimized solutions.
4. **Notifications & Recommendations**: Gaia ensures users receive timely updates, actionable suggestions, and reminders to boost productivity.
5. **Work Optimization**: Gaia prioritizes and organizes tasks for optimal productivity based on user data and preferences.
6. **Logging**: All actions and system activities are logged for monitoring and auditing.

## System Architecture
The Gaia system is built as a collection of interconnected microservices:
- **[Gaia - System CLI](https://github.com/Golde34/Gaia-Project/tree/main/GAIA)**: Allows users to interact with Gaia directly through a local console using text or voice commands.  
- **[Gaia Connector](https://github.com/Golde34/Gaia-Project/tree/main/gaia_connector)**: A service enabling Gaia to interact with backend systems.  
- **[Client GUI](https://github.com/Golde34/Gaia-Project/tree/main/client_gui)**: A user-friendly web interface for task management.  
- **[Middleware Loader](https://github.com/Golde34/Gaia-Project/tree/main/middleware_loader)**: A public-facing service that bridges the Client GUI with the backend systems.  
- **[Authentication Service](https://github.com/Golde34/Gaia-Project/tree/main/authentication_manager/auth_service)**: Manages user authorization and authentication securely.  
- **[Personal Task Manager](https://github.com/Golde34/Gaia-Project/tree/main/person_task_manager)**: Core service responsible for task creation, updates, and management.  
- **[Schedule Plan](https://github.com/Golde34/Gaia-Project/tree/main/schedule_plan)**: Handles calendar integrations and automated scheduling.  
- **[Work Optimization](https://github.com/Golde34/Gaia-Project/tree/main/work_optimization)**: Optimizes tasks and schedules based on user priorities.  
- **[Notify Agent](https://github.com/Golde34/Gaia-Project/tree/main/notify_agent)**: Sends timely notifications and reminders for tasks.  
- **[Logging Tracker](https://github.com/Golde34/Gaia-Project/tree/main/logging_tracker)**: Manages logs and ensures the system's backend processes are transparent and auditable. 


<div align="center">
  <img src="https://github.com/user-attachments/assets/77bc3dfd-dbd1-49c1-95b4-5d4567e3cdaa" alt="image">
</div>

## Getting Started

## New feature available
- **Contribution Calendar**: Count user commits each projects or total commits.

## Future Roadmap
- **Automatic Task Recognition**: Proactively identify user tasks during natural conversations.
- **Interactive Recommendations**: Enhance engagement with notifications and real-time task suggestions.
- **Advanced Chatbot Integrations**: Enable seamless integration with external systems.
- **Global Language Support**: Expand support for additional languages for a broader user base.
- **Third-Party Tool Integration**: Integrate with tools like Google Calendar, Trello, and others.

## Contributions
Contributions are welcome! Please open an issue or submit a pull request to improve Gaia.

## License
This project is licensed under the MIT License.

---
Gaia is your smart virtual assistant for streamlined task management and work optimization.


