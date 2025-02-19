package mapper

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/kernel/utils"
)

func ReturnProjectObjectMapper(body map[string]interface{}) *response_dtos.ProjectResponseDTO {
	var input response_dtos.ProjectResponseDTO
	input.ID = body["_id"].(string)
	input.Name = body["name"].(string)
	input.Description = body["description"].(string)
	input.Status = body["status"].(string)
	input.Color = body["color"].(string)
	input.Owner = body["ownerId"].(float64)
	input.ActiveStatus = body["activeStatus"].(string)
	input.GroupTasks = utils.ConvertStringToStringArray(body["groupTasks"].([]interface{}))
	input.CreatedAt = body["createdAt"].(string)
	input.UpdatedAt = body["updatedAt"].(string)
	return &input
}

func ReturnGithubRepoObjectMapper(body map[string]interface{}) *response_dtos.GithubRepoResponseDTO {
	var input response_dtos.GithubRepoResponseDTO
	input.Name = body["name"].(string)
	input.HtmlUrl = body["htmlUrl"].(string)
	if body["description"] != nil {
		input.Description = body["description"].(string)
	} else {
		input.Description = ""
	}
	input.Owner = body["owner"].(string)
	if body["language"] != nil {
		input.Language = body["language"].(string)
	} else {
		input.Language = ""
	}
	return &input
}

func ReturnProjectCommitObjectMapper(body map[string]interface{}) *response_dtos.ProjectCommitResponseDTO {
	var input response_dtos.ProjectCommitResponseDTO
	input.Id = body["id"].(string)
	input.ProjectId = body["projectId"].(string)
	if body["projectName"] != nil {
		input.ProjectName = body["projectName"].(string)
	}
	input.GithubRepo = body["githubRepo"].(string)
	input.GithubRepoUrl = body["githubRepoUrl"].(string)
	if body["userCommitId"] != nil {
		input.UserCommitId = body["userCommitId"].(string)
	}
	return &input
}