package client

type IContributionAdapter interface {
	GetUserContribution(userId string) (interface{}, error)
	CompareCommits(userId string) (interface{}, error)
	GetUserProjectContribution(userId, projectId string) (interface{}, error)
}