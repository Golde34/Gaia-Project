package services

import (
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
	"middleware_loader/kernel/utils"
)

type UserGithubService struct {}

func NewUserGithubService() *UserGithubService {
	return &UserGithubService{}
}

func (s *UserGithubService) GetUserGithubInfo(userId string) (base_dtos.ErrorResponse, error) {
	userGithubInfo, err := client.IUserGithubAdapter(&adapter.UserGithubAdapter{}).GetUserGithubInfo(userId)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot get user github info from Contribution Tracker"), err 
	}

	response := utils.ReturnSuccessResponse("Get user github info success", userGithubInfo)
	return response, nil
}

func (s *UserGithubService) GithubAuthorize(code string, state string) (base_dtos.ErrorResponse, error) {
	userGithubInfo, err := client.IUserGithubAdapter(&adapter.UserGithubAdapter{}).GithubAuthorize(code, state)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot authorize github from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Authorize github success", userGithubInfo)
	return response, nil
}

func (s *UserGithubService) SynchronizeUserGithub(userId string) (base_dtos.ErrorResponse, error) {
	userGithubInfo, err := client.IUserGithubAdapter(&adapter.UserGithubAdapter{}).SynchronizeUserGithub(userId)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot synchronize user github from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Synchronize user github success", userGithubInfo)
	return response, nil
}

func (s *UserGithubService) SyncProjectRepo(userId string, project, repo map[string]interface{}) (base_dtos.ErrorResponse, error) {
	syncResult, err := client.IUserGithubAdapter(&adapter.UserGithubAdapter{}).SyncProjectRepo(userId, project, repo)	
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot sync project repo from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Sync project repo success", syncResult)
	return response, nil
}

func (s *UserGithubService) DeleteProjectRepo(userId, projectId string) (base_dtos.ErrorResponse, error) {
	deleteResult, err := client.IUserGithubAdapter(&adapter.UserGithubAdapter{}).DeleteProjectRepo(userId, projectId)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot delete project repo from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Delete project repo success", deleteResult)
	return response, nil
}