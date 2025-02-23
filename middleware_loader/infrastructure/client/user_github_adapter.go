package client_adapter

import (
	"encoding/json"
	base_dtos "middleware_loader/core/domain/dtos/base"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type UserGithubAdapter struct{}

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
	body := map[string]interface{}{
		"code":  code,
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
	synchronizeUserGithubURL := base.ContributionTrackerURL + "/contribution-tracker/user-commit/synchronize/" + userId
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

func (adapter *UserGithubAdapter) SyncProjectRepo(userId string, project, repo map[string]interface{}) (base_dtos.ErrorResponse, error) {
	syncProjectRepoURL := base.ContributionTrackerURL + "/contribution-tracker/project-commit/synchronize-project-repo"
	var syncResult string
	headers := utils.BuildDefaultHeaders()
	body := map[string]interface{}{
		"userId":  userId,
		"project": project,
		"repo":    repo,
	}
	_, err := utils.BaseAPIV2(syncProjectRepoURL, "POST", body, &syncResult, headers)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot sync project repo from Contribution Tracker"), err
	}

	return base_dtos.ErrorResponse{
		Status: 	  "success",
		StatusMessage: "Sync project repo success",
		ErrorCode:    200,
		ErrorMessage: syncResult,
	}, nil
}


func (adapter *UserGithubAdapter) DeleteProjectRepo(userId, projectId string) (response_dtos.ProjectCommitResponseDTO, error) {
	deleteProjectRepoURL := base.ContributionTrackerURL + "/contribution-tracker/project-commit/delete-project-commit"
	var deleteResult response_dtos.ProjectCommitResponseDTO
	request := map[string]interface{}{
		"userId":    userId,
		"projectId": projectId,
	}
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(deleteProjectRepoURL, "DELETE", request, &deleteResult, headers)
	if err != nil {
		return response_dtos.ProjectCommitResponseDTO{}, err
	}

	return deleteResult, nil
}