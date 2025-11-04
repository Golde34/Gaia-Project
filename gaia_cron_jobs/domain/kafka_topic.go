package domain

const (
	// KafkaTopicCronJob is the topic for cron job
	FullSyncGithubCommitTopic = "contribution-tracker.full-sync-github-commit.topic"
	SyncGithubCommitTopic = "contribution-tracker.github-commit.topic"

	AIGenerateScheduleCalendar = "ai-core.generate-calendar-schedule.topic"
	AIRegisterScheduleCalendar = "ai-core.register-calendar-schedule.topic"
)

const (
	ProjectSyncGithubCommitCommand = "projectSyncGithubCommit"
	RegisterCalendarSchedule = "registerCalendarSchedule"
)
