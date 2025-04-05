package domain

const (
	// TimeUnit represents a time-based scheduling type.
	// It can be used to schedule jobs based on time intervals such as seconds, minutes, hours, or days.
	TimeUnit = "TimeUnit"
	// Cron represents a cron-based scheduling type.
	// It can be used to schedule jobs based on cron expressions.
	Cron = "Cron"
)

const (
	// TimeUnitSeconds represents the time unit of seconds.
	TimeUnitSeconds = "SECONDS"
	// TimeUnitMinutes represents the time unit of minutes.
	TimeUnitMinutes = "MINUTES"
	// TimeUnitHours represents the time unit of hours.
	TimeUnitHours = "HOURS"
	// TimeUnitDays represents the time unit of days.
	TimeUnitDays = "DAYS"
)