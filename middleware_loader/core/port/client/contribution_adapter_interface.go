package client

type IContributionAdapter interface {
	GetUserContribution(userId string) (interface{}, error)
}