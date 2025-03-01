package services

import (
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
	"middleware_loader/kernel/utils"
)

type ContributionService struct{}

func NewContributionService() *ContributionService {
	return &ContributionService{}
}

func (s *ContributionService) GetUserContribution(userId string) (base_dtos.ErrorResponse, error) {
	contribution, err := client.IContributionAdapter(&adapter.ContributionAdapter{}).GetUserContribution(userId)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot get user contribution from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Get user contribution success", contribution)
	return response, nil
}

func (s *ContributionService) CompareCommits(userId string) (base_dtos.ErrorResponse, error) {
	compoareCommits, err := client.IContributionAdapter(&adapter.ContributionAdapter{}).CompareCommits(userId)
	if err != nil {
		return utils.ReturnErrorResponse(400, "Cannot compare commits from Contribution Tracker"), err
	}

	response := utils.ReturnSuccessResponse("Compare commits success", compoareCommits)
	return response, nil
}
