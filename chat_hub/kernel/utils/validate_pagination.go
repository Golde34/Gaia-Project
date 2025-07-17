package utils

func ValidatePagination(size, page int) (int, int) {
	if size <= 0 {
		size = 10 // Default size if not provided or invalid
	}
	if page < 0 {
		page = 0 // Default page if not provided or invalid
	}
	if size > 100 {
		size = 100 // Maximum size limit
	}
	return size, page
}