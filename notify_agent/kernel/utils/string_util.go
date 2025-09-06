package utils

import "fmt"

func ToStringUUID(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	case []byte:
		if len(v) == 16 {
			return fmt.Sprintf("%x-%x-%x-%x-%x", v[0:4], v[4:6], v[6:8], v[8:10], v[10:])
		}
		return string(v)
	default:
		return fmt.Sprintf("%v", v)
	}
}