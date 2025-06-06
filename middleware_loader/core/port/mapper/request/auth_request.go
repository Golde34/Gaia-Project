package mapper

import request_dtos "middleware_loader/core/domain/dtos/request"

func SigninRequestDTOMapper(body map[string]interface{}) request_dtos.AuthDTO {
	var input request_dtos.AuthDTO
	input.Username = body["username"].(string)
	input.Password = body["password"].(string)
	return input
}

func GetToken(body map[string]interface{}) request_dtos.TokenInputDTO {
	var input request_dtos.TokenInputDTO
	input.Token = body["accessToken"].(string)
	return input
}

func SignupRequestDTOMapper(body map[string]interface{}) request_dtos.SignupDTO {
	var input request_dtos.SignupDTO
	input.Username = body["username"].(string)
	input.Name = body["name"].(string)
	input.Password = body["password"].(string)
	input.Email = body["email"].(string)
	input.MatchingPassword = body["matchingPassword"].(string)
	return input
}
