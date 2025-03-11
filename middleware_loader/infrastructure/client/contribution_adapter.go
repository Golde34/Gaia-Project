package client_adapter

import (
	"encoding/json"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type ContributionAdapter struct {}

func NewContributionAdapter() *ContributionAdapter {
	return &ContributionAdapter{}
}

func (adapter *ContributionAdapter) GetUserContribution(userId string) (interface{}, error) {
	contributionURL := base.ContributionTrackerURL + "/contribution-tracker/contribution/" + userId
	var contribution interface{}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(contributionURL, "GET", nil, headers)
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &contribution)
	if err != nil {
		return nil, err
	}

	return contribution, nil
}

func (adapter *ContributionAdapter) CompareCommits(userId string) (interface{}, error) {
	compareCommitsURL := base.ContributionTrackerURL + "/contribution-tracker/contribution/compare-commits/" + userId
	var compareCommits interface{}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(compareCommitsURL, "GET", nil, headers)
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &compareCommits)
	if err != nil {
		return nil, err
	}

	return compareCommits, nil
}

func (adapter *ContributionAdapter) GetUserProjectContribution(userId, projectId string) (interface{}, error) {
	contributionURL := base.ContributionTrackerURL + "/contribution-tracker/contribution/" + userId + "/" + projectId
	var contribution interface{}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(contributionURL, "GET", nil, headers)
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &contribution)
	if err != nil {
		return nil, err
	}

	return contribution, nil
}