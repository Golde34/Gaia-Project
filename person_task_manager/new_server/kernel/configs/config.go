package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Url                    string
	Port                   string
	AuthServiceURL         string
	SchedulePlanServiceURL string
}

func (in *Config) LoadEnv() (Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	url := os.Getenv("URL")
	port := os.Getenv("PORT")

	authServiceURL := os.Getenv("AUTH_SERVICE_URL")
	schedulePlanServiceUrl := os.Getenv("SCHEDULE_PLAN_SERVICE_URL")

	return Config{
		Url:                    url,
		Port:                   port,
		AuthServiceURL:         authServiceURL,
		SchedulePlanServiceURL: schedulePlanServiceUrl,
	}, nil
}
