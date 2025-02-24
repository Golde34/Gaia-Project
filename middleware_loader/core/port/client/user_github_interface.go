package client

import response_dtos "middleware_loader/core/domain/dtos/response"

type IUserGithubAdapter interface {
	GetUserGithubInfo(userId string) (response_dtos.UserGithubDTO, error)
	GithubAuthorize(code string, state string) (response_dtos.UserGithubDTO, error)
	SynchronizeUserGithub(userId string) (response_dtos.UserGithubDTO, error) 
	SyncProjectRepo(userId string, project, repo map[string]interface{}) (interface{}, error)
	DeleteProjectRepo(userId, projectId string) (response_dtos.ProjectCommitResponseDTO, error)
}