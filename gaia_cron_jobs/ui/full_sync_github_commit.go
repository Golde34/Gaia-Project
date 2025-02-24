package ui

import (
	"encoding/json"
	"fmt"
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

	executeKafka(data, "fullSyncGithubCommit", topic, "localhost:9094")
}

func executeKafka(data map[string]interface{}, name, topic, bootstrapServers string) {
	kafkaMessage := kafka.CreateKafkaObjectMessage(name, data)
	log.Printf("Executing job '%s' and sending message to topic '%s'", name, topic)
	kafka.Producer(bootstrapServers, topic, kafkaMessage, 100_000)
}