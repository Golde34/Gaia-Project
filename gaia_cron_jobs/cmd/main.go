package main

import (
	"gaia_cron_jobs/config"
	"gaia_cron_jobs/domain"
	"gaia_cron_jobs/internal/cron"
	"gaia_cron_jobs/internal/kafka"
	"gaia_cron_jobs/ui"
	"log"
	"sync"
)

func main() {

	// Kafka Initialization
	kafkaConfig := config.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka configuration loaded: ", kafkaCfg.GroupID)

	handlers := map[string]kafka.MessageHandler{
		domain.FullSyncGithubCommitTopic: &ui.FullSyncGithubCommitHandler{},
	}
	consumerGroupHandler := kafka.NewConsumerGroupHandler(kafkaCfg.Name, handlers)

	// Use WaitGroup to handle goroutines
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		log.Println("Starting Kafka consumer...")
		kafka.ConsumerGroup(kafkaCfg.BootstrapServers, kafkaCfg.Topics, kafkaCfg.GroupID, consumerGroupHandler)
	}()

	// Start scheduler
	go func() {
		defer wg.Done()
		log.Println("Dynamic cron job service started...")
		cron.ExecuteJob()
	}()

	wg.Wait()
}
