package kafka

import (
	base_dtos "chat_hub/core/domain/dtos/base"
	"chat_hub/kernel/configs"
	"log"
	"time"
)

func CreateKafkaMessage(cronType, message string) *base_dtos.KafkaMessage {
	return &base_dtos.KafkaMessage{
		Cmd:         cronType,
		ErrorCode:   "00",
		ErrorMessage: "Success",
		DisplayTime: time.Now().UTC().Format(time.RFC3339),
		Data:        message,
	}
}
func CreateKafkaObjectMessage(cronType string, message map[string]interface{}) *base_dtos.KafkaMessage {
	return &base_dtos.KafkaMessage{
		Cmd:         cronType,
		ErrorCode:   "00",
		ErrorMessage: "Success",
		DisplayTime: time.Now().UTC().Format(time.RFC3339),
		Data:        message,
	}
}

func ProduceKafkaMessage(data map[string]interface{}, topic, cmd string) {
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	bootstrapServer := kafkaCfg.ProducerBootstrapServers
	kafkaMessage := CreateKafkaObjectMessage(cmd, data)
	log.Printf("Executing cmd '%s' and sending message to topic '%s'", cmd, topic)
	Producer(bootstrapServer, topic, kafkaMessage)
}