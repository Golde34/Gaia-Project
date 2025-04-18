package bootstrap

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Env struct {
	AppEnv         string `mapstructure:"APP_ENV"`
	ServerAddress  string `mapstructure:"SERVER_ADDRESS"`
	ContextTimeout int    `mapstructure:"CONTEXT_TIMEOUT"`
	DBHost         string `mapstructure:"DB_HOST"`
	DBPort         string `mapstructure:"DB_PORT"`
	DBUser         string `mapstructure:"DB_USER"`
	DBPass         string `mapstructure:"DB_PASSWORD"`
	DBName         string `mapstructure:"DB_NAME"`
}

func NewEnv() *Env {
	env := godotenv.Load(".env")
	if env != nil {
		fmt.Println("Error loading .env file")
	}

	contextTimeout, _ := strconv.Atoi(os.Getenv("CONTEXT_TIMEOUT"))

	return &Env{
		AppEnv:         os.Getenv("APP_ENV"),
		ServerAddress:  os.Getenv("SERVER_ADDRESS"),
		ContextTimeout: contextTimeout,
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         os.Getenv("DB_PORT"),
		DBUser:         os.Getenv("DB_USER"),
		DBPass:         os.Getenv("DB_PASSWORD"),
		DBName:         os.Getenv("DB_NAME"),
	}
}
