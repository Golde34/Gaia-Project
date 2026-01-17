package configs

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Url                            string
	Port                           string
	GaiaPort                       string
	AuthServicePort                string
	TaskManagerPort                string
	ClientCORSAllowedUrl           string
	WorkOptimServicePort           string
	SchedulePlanServicePort        string
	ContributionTrackerServicePort string
	NotifyAgentServicePort 		   string

	FileDisplayWord string
	Datalake        string

	SyncProjectQuota string
}

func (in *Config) LoadEnv() (Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	url := os.Getenv("URL")
	port := os.Getenv("PORT")
	gaiaPort := os.Getenv("GAIA_PORT")
	authServicePort := os.Getenv("AUTH_SERVICE_PORT")
	taskManagerPort := os.Getenv("TASK_MANAGER_PORT")
	clientCORSAllowedUrl := os.Getenv("CLIENT_CORS_ALLOWED_URL")
	workOptimServicePort := os.Getenv("WORK_OPTIM_SERVICE_PORT")
	schedulePlanServicePort := os.Getenv("SCHEDULE_PLAN_SERVICE_PORT")
	contributionTrackerServicePort := os.Getenv("CONTRIBUTION_TRACKER_SERVICE_PORT")
	notifyAgentServicePort := os.Getenv("NOTIFY_AGENT_SERVICE_PORT")

	fileDisplayWord := os.Getenv("FILE_DISPLAY_WORD")
	dataLake := os.Getenv("DATALAKE")

	syncProjectQuota := os.Getenv("SYNC_PROJECT_QUOTA")

	config := Config{
		Url:                            url,
		Port:                           port,
		GaiaPort:                       gaiaPort,
		AuthServicePort:                authServicePort,
		TaskManagerPort:                taskManagerPort,
		ClientCORSAllowedUrl:           clientCORSAllowedUrl,
		WorkOptimServicePort:           workOptimServicePort,
		SchedulePlanServicePort:        schedulePlanServicePort,
		ContributionTrackerServicePort: contributionTrackerServicePort,
		NotifyAgentServicePort: 		notifyAgentServicePort,
		FileDisplayWord:                fileDisplayWord,
		Datalake:                       dataLake,
		SyncProjectQuota:               syncProjectQuota,
	}
	return config, nil
}
