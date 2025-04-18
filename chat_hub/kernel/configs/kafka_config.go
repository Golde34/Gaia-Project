package configs

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type KafkaConfig struct {
	BootstrapServers string
	GroupId          string
	Topics           []string
	Name             string
}

func (in *KafkaConfig) LoadEnv() (KafkaConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	bootstrapServers := os.Getenv("KAFKA_BOOTSTRAP_SERVERS")
	groupId := os.Getenv("KAFKA_GROUP_ID")
	topics := os.Getenv("KAFKA_TOPICS")
	name := os.Getenv("KAFKA_NAME")

	return KafkaConfig{
		BootstrapServers: bootstrapServers,
		GroupId:          groupId,
		Topics:           strings.Split(topics, ","),
		Name:             name,
	}, nil
}
