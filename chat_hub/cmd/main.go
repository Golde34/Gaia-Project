package main

import (
	"log"
	"net/http"
	services "chat_hub/core/services/websocket"
	"chat_hub/infrastructure/kafka"
	"chat_hub/kernel/configs"
	consumer "chat_hub/ui/kafka"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)



func main() {
	// Kafka Initialization
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka Config: ", kafkaCfg.GroupId)

	handlers := map[string] kafka.MessageHandler {
		"task-manager.chat-hub-result.topic": &consumer.TaskResultHandler{},
	}

	consumerGroupHandler := kafka.NewConsumerGroupHandler(kafkaCfg.Name, handlers)

	go func () {
		kafka.ConsumerGroup(kafkaCfg.BootstrapServers, kafkaCfg.Topics, kafkaCfg.GroupId, consumerGroupHandler)
	}()

	// Server Initialization
	config := configs.Config{}
	cfg, _ := config.LoadEnv()
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Timeout(time.Second * 60))

	// Register WebSocket handler
	http.HandleFunc("/ws", services.NewWebSocketService().HandleChatmessage)
	http.HandleFunc("/ws/onboarding", services.NewWebSocketService().HandleOnboarding)

	// Rest Router
	
	log.Printf("connect to http://localhost:%s/", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
