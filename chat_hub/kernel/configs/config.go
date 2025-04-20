package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Url  string
	Port string
	AuthServicePort string
	LLMCoreServicePort string
}

func (in *Config) LoadEnv() (Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	url := os.Getenv("URL")
	port := os.Getenv("PORT")
	
	authServicePort := os.Getenv("AUTH_SERVICE_PORT")
	llmCoreServicePort := os.Getenv("LLM_CORE_SERVICE_PORT")

	return Config{
		Url:  url,
		Port: port,
		AuthServicePort: authServicePort,
		LLMCoreServicePort: llmCoreServicePort,	
	}, nil
}
