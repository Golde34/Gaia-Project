package constants

// Kafka Topic
const (
	AICreateTaskTopic = "chat-hub.create-task.topic"
	TaskResultTopic = "task-manager.chat-hub-result.topic" 
	AIRegisterCalendarTopic = "ai-core.generate-calendar-schedule.topic"
)

// Kafka Command
const (
	TaskResultCmd = "taskResult"
	CreateTaskCmd = "gaiaCreateTask"
	RegisterCalendarCmd = "gaiaRegisterCalendar"
)

const (
	RedisPrefix = "chat_hub::"
	ValidateServiceJwt = "validate_jwt::"
	SSEToken = "sse_token::"
)