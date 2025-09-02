package main

import (
	"log"
	"net/http"
	"notify_agent/cmd/route"
	services "notify_agent/core/services/websocket"
	"notify_agent/infrastructure/kafka"
	"notify_agent/kernel/configs"
	database_postgresql "notify_agent/kernel/database/postgresql"
	consumer "notify_agent/ui/kafka"
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
		log.Fatalf("Failed to connect to PostgreSQL database: %v", err);
	}
	log.Println("Database connected, database name: ", dbCfg.Database)

	// Kafka Initialization
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka Config: ", kafkaCfg.GroupId)

	handlers := map[string] kafka.MessageHandler {
		"notify-agent.optimize-task-notify.topic": consumer.NewOptimizeTaskNotifyHandler(dbConnection),
		"chat-hub.task-result.topic": consumer.NewTaskResultHandler(dbConnection),
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
	http.HandleFunc("/ws", services.NewWebSocketService().HandleWebSocket)

	// Rest Router
	route.Setup(r, dbConnection)
	
	log.Printf("connect to http://localhost:%s/", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
