package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type DatabaseConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
}

func (in *DatabaseConfig) LoadEnv() (DatabaseConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	databaseHost := os.Getenv("DB_HOST")
	databasePort := os.Getenv("DB_PORT")
	databaseUsername := os.Getenv("DB_USER")
	databasePassword := os.Getenv("DB_PASSWORD")
	databaseName := os.Getenv("DB_NAME")

	return DatabaseConfig{
		Host:     databaseHost,
		Port:     databasePort,
		Username: databaseUsername,
		Password: databasePassword,
		Database: databaseName,
	}, nil
}
