package constants

// Kafka Topic
const ()

// Kafka Command
const ()

const (
	RedisPrefix = "personal_task_manager::"
)

var LevenshteinConfig = struct {
	NumberOfWorker int
	MaxDistance    int
	TopKResult     int
}{
	NumberOfWorker: 5,
	MaxDistance:    5,
	TopKResult:     10,
}
