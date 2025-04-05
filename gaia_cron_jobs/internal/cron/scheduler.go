package cron

import (
	"log"
	"time"

	"gaia_cron_jobs/config"
	"gaia_cron_jobs/domain"
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

		cronOptions(job, scheduler, job.JobType)
	}

	scheduler.StartBlocking()
}

func cronOptions(job config.JobConfig, scheduler *gocron.Scheduler, cronType string) {
	switch cronType {
	case domain.TimeUnit:
		runJobByTimeUnit(scheduler, job, uuid.New().String())
	case domain.Cron: 
		runJobByCron(scheduler, job, uuid.New().String())
	default:
		log.Printf("Invalid cron type '%s' for job '%s'. Skipping...", cronType, job.JobName)
	}
}

func runJobByTimeUnit(scheduler *gocron.Scheduler, job config.JobConfig, message string) {
	switch job.JobTimeUnit {
	case domain.TimeUnitSeconds:
		scheduler.Every(job.JobTime).Seconds().Do(func(name, topic, bootstrapServers string) {
			executeKafkaJob(message, name, topic, bootstrapServers)
		}, job.JobName, job.Topic, job.BootstrapServers)
	case domain.TimeUnitMinutes:
		scheduler.Every(job.JobTime).Minutes().Do(func(name, topic, bootstrapServers string) {
			executeKafkaJob(message, name, topic, bootstrapServers)
		}, job.JobName, job.Topic, job.BootstrapServers)
	case domain.TimeUnitHours:
		scheduler.Every(job.JobTime).Hours().Do(func(name, topic, bootstrapServers string) {
			executeKafkaJob(message, name, topic, bootstrapServers)
		}, job.JobName, job.Topic, job.BootstrapServers)
	case domain.TimeUnitDays:
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

func runJobByCron(scheduler *gocron.Scheduler, job config.JobConfig, message string) {
	scheduler.Cron(job.JobCron).Do(func(name, topic, bootstrapServers string) {
		executeKafkaJob(message, name, topic, bootstrapServers)
	}, job.JobName, job.Topic, job.BootstrapServers)
}