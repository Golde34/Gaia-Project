package main

import (
	"gaia_cron_jobs/config"
	"gaia_cron_jobs/domain"
	// "gaia_cron_jobs/internal/cron"
	"gaia_cron_jobs/internal/kafka"
	"gaia_cron_jobs/ui"
	"log"
)

func main() {
	// Start scheduler
	// log.Println("Dynamic cron job service started...")
	// cron.ExecuteJob()

	// Kafka Initialization
	kafkaConfig := config.KafkaConfig{}
	kafkaCfg, _ := kafkaConfig.LoadEnv()
	log.Println("Kafka configuration loaded: ", kafkaCfg.GroupID)

	handlers := map[string]kafka.MessageHandler{
		domain.FullSyncGithubCommitTopic: &ui.FullSyncGithubCommitHandler{},
	}
	log.Print("======================================================================================")
	consumerGroupHandler := kafka.NewConsumerGroupHandler(kafkaCfg.Name, handlers)

	go func () {
		kafka.ConsumerGroup(kafkaCfg.BootstrapServers, kafkaCfg.Topics, kafkaCfg.GroupID, consumerGroupHandler)
	}()

	log.Print("??======================================================================================")
}
