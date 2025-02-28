package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type KafkaConfig struct {
	BootstrapServers string
	GroupID          string
	Topics           []string
	Name             string

	ProducerBootstrapServers string
}

func (in *KafkaConfig) LoadEnv() (KafkaConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	bootstrapServers := os.Getenv("KAFKA_BOOTSTRAP_SERVERS")
	groupID := os.Getenv("KAFKA_GROUP_ID")
	topics := os.Getenv("KAFKA_TOPICS")
	name := os.Getenv("KAFKA_NAME")
	producerBootstrapServers := os.Getenv("KAFKA_PRODUCER_BOOTSTRAP_SERVERS")

	config := KafkaConfig{
		BootstrapServers:         bootstrapServers,
		GroupID:                  groupID,
		Topics:                   strings.Split(topics, ","),
		Name:                     name,
		ProducerBootstrapServers: producerBootstrapServers,
	}
	return config, nil
}
