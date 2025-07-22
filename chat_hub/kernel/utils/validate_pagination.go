package utils

func ValidatePagination(size int) int {
	if size <= 0 {
		size = 10 // Default size if not provided or invalid
	}
	if size > 100 {
		size = 100 // Maximum size limit
	}
	return size
}