package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type RedisConfig struct {
	Host     string `mapstructure:"REDIS_HOST"`
	Port     string `mapstructure:"REDIS_PORT"`
	Password string `mapstructure:"REDIS_PASSWORD"`
}

func (in *RedisConfig) LoadEnv() (RedisConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")
	password := os.Getenv("REDIS_PASSWORD")

	config := RedisConfig{
		Host:     host,
		Port:     port,
		Password: password,
	}
	return config, nil
}
