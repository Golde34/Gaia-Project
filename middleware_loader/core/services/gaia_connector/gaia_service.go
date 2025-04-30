package services

import (
	"encoding/json"
	"log"

	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type GaiaService struct {}

func NewGaiaService() *GaiaService {
	return &GaiaService{}
}


func (s *GaiaService) GaiaConnect() (interface{}, error) {
	log.Println("GaiaConnect")
	gaiaURL := base.GaiaServiceURL + "/middleware/gaia-connect"
	headers := utils.BuildDefaultHeaders()	
	bodyResult, err := utils.BaseAPI(gaiaURL, "GET", nil, headers)
	if err != nil {
		return "", err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return "", err
	}
	var authToken response_dtos.AuthTokenResponseDTO 
	err = json.Unmarshal(dataBytes, &authToken)
	if err != nil {
		return "", err
	}
	
	return response_dtos.GaiaTokenResponse{
		AccessToken: authToken.AccessToken,
		RefreshToken: authToken.RefreshToken,
	}, nil
}
