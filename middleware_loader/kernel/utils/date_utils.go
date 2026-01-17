func GetTodayDateString() string {
	return time.Now().Format("2006-01-02")
}

func ValidateDateFormat(dateStr string) bool {
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}