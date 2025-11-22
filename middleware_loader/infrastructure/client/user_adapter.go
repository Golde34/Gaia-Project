package client_adapter

import (
	"encoding/json"
	"fmt"
	"log"
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/domain/enums"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

type UserAdapter struct {
	adapter *UserAdapter
}

func NewUserAdapter(adapter *UserAdapter) *UserAdapter {
	return &UserAdapter{adapter: adapter}
}

func (adapter *UserAdapter) ListAllUsers() ([]response_dtos.UserDTO, error) {
	listAllUsersURL := base.AuthServiceURL + "/user/get-all-users"
	var users []response_dtos.UserDTO
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPI(listAllUsersURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.UserDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.UserDTO{}, fmt.Errorf("unexpected response format")
	}
	for _, userElement := range bodyResultMap["message"].([]interface{}) {
		user := mapper_response.ReturnListAllUsersObjectMapper(userElement.(map[string]interface{}))
		users = append(users, *user)
	}

	return users, nil
}

func (adapter *UserAdapter) UpdateUser(input model.UpdateUserInput) (response_dtos.UserDTO, error) {
	updateUserURL := base.AuthServiceURL + "/user/update-user"
	var user response_dtos.UserDTO
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPI(updateUserURL, "PUT", input, headers)
	if err != nil {
		return response_dtos.UserDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.UserDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &user)
	if err != nil {
		return response_dtos.UserDTO{}, err
	}

	return user, nil
}

func (adapter *UserAdapter) GetUserDetail(input model.IDInput) (response_dtos.UserDetailDTO, error) {
	getUserDetailURL := base.AuthServiceURL + "/user/get-user-by-id?id=" + input.ID
	var user response_dtos.UserDetailDTO
	headers := utils.BuildAuthorizationHeaders(enums.AS, input.ID)
	bodyResult, err := utils.BaseAPIV2(getUserDetailURL, "GET", input, user, headers)
	if err != nil {
		return response_dtos.UserDetailDTO{}, err
	}
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return *response_dtos.NewUserDetailDTO(), nil
	}
	userResponse := mapper_response.ReturnUserObjectMapper(bodyResultMap["message"].(map[string]interface{}))
	log.Println("userResponse", userResponse)
	return *userResponse, nil
}

func (adapter *UserAdapter) UpdateUserSetting(input model.UpdateUserSettingInput) (response_dtos.UserSettingDTO, error) {
	updateUserSettingURL := base.AuthServiceURL + "/user-setting/update"
	var userSetting response_dtos.UserSettingDTO
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPIV2(updateUserSettingURL, "PUT", input, userSetting, headers)
	if err != nil {
		return response_dtos.UserSettingDTO{}, err
	}
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return *response_dtos.NewUserSettingDTO(), nil
	}
	userSettingResponse := mapper_response.ReturnUserSettingObjectMapper(bodyResultMap["message"].(map[string]interface{}))
	return *userSettingResponse, nil
}

func (adapter *UserAdapter) GetAllModels() ([]response_dtos.LLMModel, error) {
	getAllModelsURL := base.AuthServiceURL + "/user-model-setting/get-models"
	var models []response_dtos.LLMModel
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPI(getAllModelsURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.LLMModel{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.LLMModel{}, fmt.Errorf("unexpected response format")
	}
	for _, modelElement := range bodyResultMap["message"].([]interface{}) {
		model := mapper_response.ReturnLLMModelObjectMapper(modelElement.(map[string]interface{}))
		models = append(models, *model)
	}

	return models, nil
}

func (adapter *UserAdapter) UpdateUserModel(input request_dtos.UpdateUserModelRequestDTO) (string, error) {
	updateUserModelURL := base.AuthServiceURL + "/user-model-setting/update"
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPI(updateUserModelURL, "POST", input, headers)
	if err != nil {
		return "", err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected response format")
	}
	message := bodyResultMap["message"].(string)
	return message, nil
}

func (adapter *UserAdapter) GetUserModels(userId string) ([]response_dtos.UserLLMModel, error) {
	getUserModelsURL := base.AuthServiceURL + "/user/llm-models?userId=" + userId
	var userModels []response_dtos.UserLLMModel
	headers := utils.BuildAuthorizationHeaders(enums.AS, userId)
	bodyResult, err := utils.BaseAPI(getUserModelsURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.UserLLMModel{}, err
	}
	
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.UserLLMModel{}, fmt.Errorf("unexpected response format")
	}
	for _, userModelElement := range bodyResultMap["message"].([]interface{}) {
		userModel := mapper_response.ReturnUserLLMModelObjectMapper(userModelElement.(map[string]interface{}))
		userModels = append(userModels, *userModel)
	}
	
	return userModels, nil
}

func (adapter *UserAdapter) UpsertUserLLMModel(input request_dtos.UpsertUserLLMModelRequestDTO) (string, error) {
	upsertUserModelURL := base.AuthServiceURL + "/user/llm-models/upsert"
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	bodyResult, err := utils.BaseAPI(upsertUserModelURL, "POST", input, headers)
	if err != nil {
		return "", err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected response format")
	}
	message := bodyResultMap["message"].(string)
	return message, nil
}

func (adapter *UserAdapter) DeleteUserModel(id string) error {
	deleteUserModelURL := base.AuthServiceURL + "/user/llm-models/" + id
	headers := utils.BuildAuthorizationHeaders(enums.AS, "1")
	_, err := utils.BaseAPI(deleteUserModelURL, "DELETE", nil, headers)
	if err != nil {
		return err
	}
	return nil
}
