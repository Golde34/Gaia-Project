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

	databaseHost := os.Getenv("DATABASE_HOST")
	databasePort := os.Getenv("DATABASE_PORT")
	databaseUsername := os.Getenv("DATABASE_USERNAME")
	databasePassword := os.Getenv("DATABASE_PASSWORD")
	databaseName := os.Getenv("DATABASE_NAME")

	return DatabaseConfig{
		Host:     databaseHost,
		Port:     databasePort,
		Username: databaseUsername,
		Password: databasePassword,
		Database: databaseName,
	}, nil
}