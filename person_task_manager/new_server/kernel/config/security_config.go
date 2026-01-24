package configs

import (
	"os"

	"github.com/joho/godotenv"
)

type SecurityConfig struct {
	PublicKey     string
	PrivateKey    string
	PrivateToken  string
	SSEPublicKey  string
	SSEPrivateKey string
}

func (in *SecurityConfig) LoadSecurityEnv() (SecurityConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return SecurityConfig{}, err
	}

	publicKey := os.Getenv("RSA_SIGNATURE.PUBLIC_KEY")
	privateKey := os.Getenv("RSA_SIGNATURE.PRIVATE_KEY")
	privateToken := os.Getenv("RSA_SIGNATURE.PRIVATE_TOKEN")
	ssePublicKey := os.Getenv("RSA_SIGNATURE.SSE_PUBLIC_KEY")
	ssePrivateKey := os.Getenv("RSA_SIGNATURE.SSE_PRIVATE_KEY")

	securityConfig := SecurityConfig{
		PublicKey:     publicKey,
		PrivateKey:    privateKey,
		PrivateToken:  privateToken,
		SSEPublicKey:  ssePublicKey,
		SSEPrivateKey: ssePrivateKey,
	}
	return securityConfig, nil
}