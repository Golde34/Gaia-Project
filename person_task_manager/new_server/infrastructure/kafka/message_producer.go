package kafka

import (
	"log"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/kernel/configs"
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