package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Url                     string
	Port                    string
	AuthServicePort         string
	LLMCoreServicePort      string
	SchedulePlanServicePort string

	ClientCORSAllowedUrl string

	WebSocketTimeout string // in seconds
}

func (in *Config) LoadEnv() (Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	url := os.Getenv("URL")
	port := os.Getenv("PORT")
	clientCORSAllowedUrl := os.Getenv("CLIENT_CORS_ALLOWED_URL")

	authServicePort := os.Getenv("AUTH_SERVICE_PORT")
	llmCoreServicePort := os.Getenv("LLM_CORE_SERVICE_PORT")
	schedulePlanServicePort := os.Getenv("SCHEDULE_PLAN_SERVICE_PORT")
	webSocketTimeout := os.Getenv("WEBSOCKET_TIMEOUT")

	return Config{
		Url:                     url,
		Port:                    port,
		ClientCORSAllowedUrl:    clientCORSAllowedUrl,
		AuthServicePort:         authServicePort,
		LLMCoreServicePort:      llmCoreServicePort,
		WebSocketTimeout:        webSocketTimeout,
		SchedulePlanServicePort: schedulePlanServicePort,
	}, nil
}
