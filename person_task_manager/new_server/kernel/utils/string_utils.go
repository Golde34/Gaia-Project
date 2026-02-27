package utils

func Join(strArray []string) string {
	result := ""
	for i, str := range strArray {
		result += str
		if i != len(strArray)-1 {
			result += ", "
		}
	}
	return result
}
