package main

import (
	services "chat_hub/core/services/websocket"
	"chat_hub/infrastructure/kafka"
	"chat_hub/kernel/configs"
	database_postgresql "chat_hub/kernel/database/postgresql"
	consumer "chat_hub/ui/kafka"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

func main() {
	// Database
	databaseConfig := configs.DatabaseConfig{}
	dbCfg, _ := databaseConfig.LoadEnv()
	dbConnection, err := database_postgresql.ConnectDB(dbCfg.Host, dbCfg.Port, dbCfg.Username, dbCfg.Password, dbCfg.Database)	
	if err != nil {
		defer dbConnection.Close()
		log.Fatalf("Failed to connect to PostgreSQL database: %v", err)
	}
	log.Println("Database connected, database name: ", dbCfg.Database)

	// Kafka Initialization
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka Config: ", kafkaCfg.GroupId)

	handlers := map[string] kafka.MessageHandler {
		"task-manager.chat-hub-result.topic": consumer.NewTaskResultHandler(dbConnection),
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
	http.HandleFunc("/ws", services.NewWebSocketService(dbConnection).HandleChatmessage)

	// Rest Router
	
	log.Printf("connect to http://localhost:%s/", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
