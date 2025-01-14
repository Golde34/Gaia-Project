package client_adapter

import (
	"encoding/json"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type UserGithubAdapter struct { }

func NewUserGithubAdapter() *UserGithubAdapter {
	return &UserGithubAdapter{}
}

func (adapter *UserGithubAdapter) GetUserGithubInfo(userId string) (response_dtos.UserGithubDTO, error) {
	userGithubInfoURL := base.ContributionTrackerURL + "/contribution-tracker/user-commit/get-user-github-info/" + userId
	var userGithubInfo response_dtos.UserGithubDTO 
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userGithubInfoURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	err = json.Unmarshal(data, &userGithubInfo)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	return userGithubInfo, nil
}

func (adapter *UserGithubAdapter) GithubAuthorize(code string, state string) (response_dtos.UserGithubDTO, error) {
	githubAuthorizeURL := base.ContributionTrackerURL + "/contribution-tracker/user-commit/authorize"

	headers := utils.BuildDefaultHeaders()
	body := map[string]interface{} {
		"code": code,
		"state": state,
	}
	
	bodyResult, err := utils.BaseAPI(githubAuthorizeURL, "POST", body, headers)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	var userGithubInfo response_dtos.UserGithubDTO
	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	err = json.Unmarshal(data, &userGithubInfo)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	return userGithubInfo, nil
}

func (adapter *UserGithubAdapter) SynchronizeUserGithub(userId string) (response_dtos.UserGithubDTO, error) {
	synchronizeUserGithubURL := base.ContributionTrackerURL + "/contribution-tracker/user-commit/synchronize-user-github/" + userId
	var userGithubInfo response_dtos.UserGithubDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(synchronizeUserGithubURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	err = json.Unmarshal(data, &userGithubInfo)
	if err != nil {
		return response_dtos.UserGithubDTO{}, err
	}

	return userGithubInfo, nil
}
