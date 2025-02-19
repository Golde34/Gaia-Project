package response_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type ProjectResponseDTO struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Status       string   `json:"status"`
	Color        string   `json:"color"`
	ActiveStatus string   `json:"activeStatus"`
	GroupTasks   []string `json:"groupTasks"`
	Owner        float64  `json:"owner"`
	CreatedAt    string   `json:"createdAt"`
	UpdatedAt    string   `json:"updatedAt"`
}

func NewCreateProjectResponseDTO() *ProjectResponseDTO {
	return &ProjectResponseDTO{}
}

// mapper from dto to graphql model
func (in *ProjectResponseDTO) MapperToGraphQLModel(input ProjectResponseDTO) model.Project {
	var out model.Project
	mapper.AutoMapper(&input, &out)
	return out
}

func (in *ProjectResponseDTO) MapperListToGraphQLModel(input []ProjectResponseDTO) []model.Project {
	var out []model.Project
	for _, item := range input {
		out = append(out, in.MapperToGraphQLModel(item))
	}
	return out
}

type GithubRepoResponseDTO struct {
	Name        string `json:"name"`
	HtmlUrl     string `json:"htmlUrl"`
	Description string `json:"description"`
	Owner       string `json:"owner"`
	Language    string `json:"language"`
}

func NewGithubRepoResponseDTO() *GithubRepoResponseDTO {
	return &GithubRepoResponseDTO{}
}

func (in *GithubRepoResponseDTO) MapperToGraphQLModel(input GithubRepoResponseDTO) model.GithubRepo {
	var out model.GithubRepo
	mapper.AutoMapper(&input, &out)
	return out
}

func (in *GithubRepoResponseDTO) MapperListToGraphQLModel(input []GithubRepoResponseDTO) []model.GithubRepo {
	var out []model.GithubRepo
	for _, item := range input {
		out = append(out, in.MapperToGraphQLModel(item))
	}
	return out
}

type ProjectCommitResponseDTO struct {
	Id            string `json:"id"`
	ProjectId     string `json:"projectId"`
	ProjectName   string `json:"projectName"`
	GithubRepo    string `json:"githubRepo"`
	GithubRepoUrl string `json:"githubRepoUrl"`
	UserCommitId  string `json:"userCommitId"`
}

func NewProjectCommitResponseDTO() *ProjectCommitResponseDTO {
	return &ProjectCommitResponseDTO{}
}

func (in *ProjectCommitResponseDTO) MapperToGraphQLModel(input ProjectCommitResponseDTO) model.ProjectCommit {
	var out model.ProjectCommit
	mapper.AutoMapper(&input, &out)
	return out
}

func (in *ProjectCommitResponseDTO) MapperListToGraphQLModel(input []ProjectCommitResponseDTO) []model.ProjectCommit {
	var out []model.ProjectCommit
	for _, item := range input {
		out = append(out, in.MapperToGraphQLModel(item))
	}
	return out
}
