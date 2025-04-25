package kafka

import (
	base_dtos "chat_hub/core/domain/dtos/base"
	"context"
	"log"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/google/uuid"
)

func Producer(bootstrapServer, topic string, message *base_dtos.KafkaMessage) {
	config := sarama.NewConfig()

	config.Producer.Return.Errors = true
	config.Producer.Return.Successes = true
	producer, err := sarama.NewAsyncProducer([]string{bootstrapServer}, config)
	if err != nil {
		log.Fatal("Failed to create producer:", err)
	}
	defer producer.AsyncClose()

	var wg sync.WaitGroup
	var enqueued, timeout, successed, errors int

	// Success handler
	wg.Add(1)
	go func() {
		defer wg.Done()
		for range producer.Successes() {
			successed++
		}
	}()

	// Error handler
	wg.Add(1)
	go func() {
		defer wg.Done()
		for err := range producer.Errors() {
			log.Println("Failed to write access log entry:", err)
			errors++
		}
	}()

	// Send message
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(uuid.New().String()),
		Value: sarama.StringEncoder(message.String()),
	}
	log.Printf("Enqueueing message to topic '%s': %s", topic, message)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5) 
	defer cancel()

	select {
	case producer.Input() <- msg:
		enqueued++
	case <-ctx.Done():
		timeout++
		log.Printf("Timeout while enqueueing message to topic '%s': %s", topic, message)
	}
}
