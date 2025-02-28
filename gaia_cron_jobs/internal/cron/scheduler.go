package cron

import (
	"log"
	"time"

	"gaia_cron_jobs/config"
	"gaia_cron_jobs/internal/kafka"

	"github.com/go-co-op/gocron"
	"github.com/google/uuid"
)

func ExecuteJob() {
	kafkaConfig, err := config.LoadProducerEnv()
	if err != nil {
		log.Fatal("Failed to load producer config:", err)
	}
	log.Println("Kafka producer initialized")

	scheduler := gocron.NewScheduler(time.UTC)

	for _, job := range kafkaConfig {
		if job.JobTime <= 0 {
			log.Printf("Invalid job time for '%s'. Skipping...", job.JobName)
			continue
		}

		runJobByTimeUnit(scheduler, job, uuid.New().String())
	}

	scheduler.StartBlocking()
}

func runJobByTimeUnit(scheduler *gocron.Scheduler, job config.JobConfig, message string) {
	switch job.JobTimeUnit {
		case "SECONDS":
			scheduler.Every(job.JobTime).Seconds().Do(func(name, topic, bootstrapServers string) {
				executeKafkaJob(message, name, topic, bootstrapServers)
			}, job.JobName, job.Topic, job.BootstrapServers)
		case "MINUTES":
			scheduler.Every(job.JobTime).Minutes().Do(func(name, topic, bootstrapServers string) {
				executeKafkaJob(message, name, topic, bootstrapServers)
			}, job.JobName, job.Topic, job.BootstrapServers)
		case "HOURS":
			scheduler.Every(job.JobTime).Hours().Do(func(name, topic, bootstrapServers string) {
				executeKafkaJob(message, name, topic, bootstrapServers)
			}, job.JobName, job.Topic, job.BootstrapServers)
		case "DAYS":
			scheduler.Every(job.JobTime).Days().Do(func(name, topic, bootstrapServers string) {
				executeKafkaJob(message, name, topic, bootstrapServers)
			}, job.JobName, job.Topic, job.BootstrapServers)
		default:
			log.Printf("Invalid time unit '%s' for job '%s'. Skipping...", job.JobTimeUnit, job.JobName)
		}
}

func executeKafkaJob(message, name, topic, bootstrapServers string) {
	kafkaMessage := kafka.CreateKafkaMessage(name, message)
	log.Printf("Executing job '%s' and sending message to topic '%s'", name, topic)
	kafka.Producer(bootstrapServers, topic, kafkaMessage)
}
