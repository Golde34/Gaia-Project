package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"

	"middleware_loader/cmd/bootstrap"
	"middleware_loader/cmd/route"
	middleware_services "middleware_loader/core/middleware"
	"middleware_loader/infrastructure/kafka"
	"middleware_loader/kernel/configs"
	consumer "middleware_loader/ui/kafka"
)

func main() {
	// Kafka Initialization
	kafkaConfig := configs.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka configuration loaded: ", kafkaCfg.GroupID)

	handlers := map[string]kafka.MessageHandler{
		"task-manager.upload-note-file.topic": &consumer.UploadNoteFileHandler{},
	}

	consumerGroupHandler := kafka.NewConsumerGroupHandler(kafkaCfg.Name, handlers)

	go func() {
		kafka.ConsumerGroup(kafkaCfg.BootstrapServers, kafkaCfg.Topics, kafkaCfg.GroupID, consumerGroupHandler)
	}()

	// Server Initialization
	config := configs.Config{}
	cfg, _ := config.LoadEnv()
	clientUrl := cfg.ClientCORSAllowedUrl
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Timeout(time.Second * 60))

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.RequestURI == "/graphql" {
				w.WriteHeader(http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	corsHandler := cors.New(
		cors.Options{
			AllowedOrigins: []string{"http://localhost:5173", clientUrl},
			AllowedMethods: []string{
				http.MethodHead,
				http.MethodGet,
				http.MethodPost,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
			},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
		})
	r.Use(corsHandler.Handler)

	// DATABASE
	app := bootstrap.App()
	databaseEnv := app.Env
	db := app.Mongo.Database(databaseEnv.DBName)
	log.Println("Connected to MongoDB")
	defer func() {
		log.Println("Closing MongoDB connection")
		app.CloseDBConnection()
		log.Println("MongoDB connection closed")
	}()

	// Defines system routers and middlewares

	r.Use(middleware_services.ValidateAccessToken())
	route.Setup(r, db)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
