package utils

import (
	"crypto/rand"
	"encoding/base64"
)

func GenerateSSEToken(userId string) (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}