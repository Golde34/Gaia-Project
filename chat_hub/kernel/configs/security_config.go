package configs

import (
	"os"

	"github.com/joho/godotenv"
)

type SecurityConfig struct {
	PublicKey  string
	PrivateKey string
	PrivateToken string
}

func (in *SecurityConfig) LoadSecurityEnv() (SecurityConfig, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return SecurityConfig{}, err
	}

	publicKey := os.Getenv("RSA_SIGNATURE.PUBLIC_KEY")
	privateKey := os.Getenv("RSA_SIGNATURE.PRIVATE_KEY")
	privateToken := os.Getenv("RSA_SIGNATURE.PRIVATE_TOKEN")
	
	securityConfig := SecurityConfig{
		PublicKey:  publicKey,
		PrivateKey: privateKey,
		PrivateToken: privateToken,
	}
	return securityConfig, nil
}
