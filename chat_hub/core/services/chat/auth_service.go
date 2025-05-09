package services

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) ValidateJwt(jwt string) (string, error) {
	// get jwt from redis
	// if not exists call auth service to validate
	// store jwt in redis
	return "", nil
}