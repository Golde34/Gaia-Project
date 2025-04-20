package security

import (
	"chat_hub/kernel/configs"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"log"
)

func ReadKeyPair() (string, string, error) {
	var secConfig = configs.SecurityConfig{}
	var securityConfig, err = secConfig.LoadSecurityEnv()
	if err != nil {
		return "", "", err
	}

	var PUBLIC_KEY_STRING = securityConfig.PublicKey
	var PRIVATE_KEY_STRING = securityConfig.PrivateKey
	return PUBLIC_KEY_STRING, PRIVATE_KEY_STRING, nil
}

func Encrypt(plainText string) (string, error) {
	log.Println("Encrypting: ", plainText)
	publicKeyString, _, err := ReadKeyPair()
	if err != nil {
		return "", err
	}
	pubKeyBytes, err := base64.StdEncoding.DecodeString(publicKeyString)
	if err != nil {
		return "", err
	}

	pubKey, err := x509.ParsePKIXPublicKey(pubKeyBytes)
	if err != nil {
		return "", err
	}

	encryptedBytes, err := rsa.EncryptOAEP(
		sha256.New(),
		rand.Reader,
		pubKey.(*rsa.PublicKey),
		[]byte(plainText),
		nil,
	)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(encryptedBytes), nil
}

// func decrypt(encryptedText string) (string, error) {
	// _, privateKeyString, err := ReadKeyPair()
	// if err != nil {
		// return "", err
	// }
	// privKeyBytes, err := base64.StdEncoding.DecodeString(privateKeyString)
	// if err != nil {
		// return "", err
	// }
// 
	// privKey, err := x509.ParsePKCS8PrivateKey(privKeyBytes)
	// if err != nil {
		// return "", err
	// }
// 
	// decodedBytes, err := base64.StdEncoding.DecodeString(encryptedText)
	// if err != nil {
		// return "", err
	// }
	// 
	// decryptedBytes, err := rsa.DecryptOAEP(
		// sha256.New(),
		// rand.Reader,
		// privKey.(*rsa.PrivateKey),
		// decodedBytes,
		// nil,
	// )
	// if err != nil {
		// return "", err
	// }
// 
	// return string(decryptedBytes), nil
// }
// 