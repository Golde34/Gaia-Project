package main

import (
	"log"
	"logging_tracker/cmd/route"
	database_postgresql "logging_tracker/infrastructure/database"
	"logging_tracker/infrastructure/kafka"
	"logging_tracker/kernel/configs"
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
	}

	consumerGroupHandler := kafka.NewConsumerGroupHandler(kafkaCfg.Name, handlers)

	go func () {
		kafka.ConsumerGroup(kafkaCfg.BootstrapServers, kafkaCfg.Topics, kafkaCfg.GroupId, consumerGroupHandler)
	}()
	
	config := configs.Config{}
	cfg, _ := config.LoadEnv()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Timeout(time.Second * 60))

	route.Setup(r)

	log.Printf("Server started at port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}