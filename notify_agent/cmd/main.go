package main

import (
	"log"
	"net/http"
	"notify_agent/cmd/bootstrap"
	"notify_agent/cmd/route"
	services "notify_agent/core/services/websocket"
	"notify_agent/infrastructure/kafka"
	"notify_agent/kernel/configs"
	consumer "notify_agent/ui/kafka"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)



func main() {
	// Database
	app := bootstrap.App()
	databaseEnv := app.Env
	db := app.Mongo.Database(databaseEnv.DBName)
	log.Println("Database connected")
	defer func() {
		log.Println("Closing MongoDB connection")
		app.CloseDBConnection()
		log.Println("Database connection closed")
	}()

	// Kafka Initialization
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka Config: ", kafkaCfg.GroupId)

	handlers := map[string] kafka.MessageHandler {
		"notify-agent.optimize-task-notify.topic": &consumer.OptimizeTaskNotifyHandler{Database: db},
		"chat-hub.task-result.topic": &consumer.TaskResultHandler{Database: db},
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

	route.Setup(r)

	// Register WebSocket handler
	http.HandleFunc("/ws", services.NewWebSocketService().HandleWebSocket)

	// Rest Router
	
	log.Printf("connect to http://localhost:%s/", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
