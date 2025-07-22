package constants

// Kafka Topic
const (
	AICreateTaskTopic = "chat-hub.create-task.topic"
	AIRegisterCalendarTopic = "chat-hub.register-calendar.topic"
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