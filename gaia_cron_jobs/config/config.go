package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type KafkaServersNameConfig struct {
	Servers string
}

type JobConfig struct {
	BootstrapServers string
	Topic            string
	JobName          string
	JobType          string
	JobTime          int
	JobTimeUnit      string
	JobCron          string
}

func LoadProducerEnv() ([]JobConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	producers := GetProducersConfig()

	configs := make([]JobConfig, len(producers))

	for _, server := range producers {
		prefix := "KAFKA_PRODUCER_"
		kafkaServerConfig := JobConfig{
			BootstrapServers: os.Getenv(prefix + server + "_BOOTSTRAP_SERVERS"),
			Topic:            os.Getenv(prefix + server + "_TOPIC"),
			JobName:          os.Getenv(prefix + server + "_JOB_NAME"),
			JobType:          os.Getenv(prefix + server + "_JOB_TYPE"),
			JobTime:          ConvertInt(os.Getenv(prefix + server + "_JOB_TIME")),
			JobTimeUnit:      os.Getenv(prefix + server + "_JOB_TIME_UNIT"),
			JobCron:          os.Getenv(prefix + server + "_JOB_CRON"),
		}
		configs = append(configs, kafkaServerConfig)
	}

	return configs, nil
}

func GetProducersConfig() []string {
	producers := os.Getenv("PRODUCERS")
	producersName := strings.Split(producers, ",")
	return producersName
}

func ConvertInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		log.Fatal("Failed to convert string to int:", err)
	}
	return i
}
