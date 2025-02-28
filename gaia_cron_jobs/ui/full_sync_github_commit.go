package ui

import (
	"encoding/json"
	"fmt"
	"gaia_cron_jobs/config"
	"gaia_cron_jobs/domain"
	"gaia_cron_jobs/internal/kafka"
	"log"
)

type FullSyncGithubCommitHandler struct{}

func (h *FullSyncGithubCommitHandler) HandleMessage(topic string, key, value []byte) {
	fmt.Printf("Handling message for topic %s: %s\n", topic, string(value))

	var message domain.KafkaMessage
	if err := json.Unmarshal(value, &message); err != nil {
		fmt.Printf("Error unmarshalling message: %v\n", err)
		return
	}
	data, ok := message.Data.(map[string]interface{})
	if !ok {
		fmt.Printf("Error: message data is not of expected type\n")
		return
	}

	producerTopic := domain.SyncGithubCommitTopic
	cmd := domain.ProjectSyncGithubCommitCommand
	executeKafka(data, producerTopic, cmd)
}

func executeKafka(data map[string]interface{}, topic, cmd string) {
	kafkaConfig := config.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	bootstrapServer := kafkaCfg.ProducerBootstrapServers
	kafkaMessage := kafka.CreateKafkaObjectMessage(cmd, data)
	log.Printf("Executing cmd '%s' and sending message to topic '%s'", cmd, topic)
	kafka.Producer(bootstrapServer, topic, kafkaMessage)
}
