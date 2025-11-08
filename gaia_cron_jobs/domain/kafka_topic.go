package domain

const (
	// KafkaTopicCronJob is the topic for cron job
	FullSyncGithubCommitTopic = "contribution-tracker.full-sync-github-commit.topic"
	SyncGithubCommitTopic = "contribution-tracker.github-commit.topic"
)

const (
	ProjectSyncGithubCommitCommand = "projectSyncGithubCommit"
	RegisterCalendarSchedule = "registerCalendarSchedule"
)
