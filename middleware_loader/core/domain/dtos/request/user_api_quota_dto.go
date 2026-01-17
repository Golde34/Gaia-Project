package request_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type UserApiQuotaQueryRequest struct {
	UserId     string `json:"userId"`
	ActionType string `json:"actionType"`
	QuotaDate  string `json:"quotaDate"`
}

func (in *UserApiQuotaQueryRequest) MapperToModel(input model.UpdateUserInput) {
	mapper.AutoMapper(&input, in)
}

func NewUserApiQuotaQueryRequest() *UserApiQuotaQueryRequest {
	return &UserApiQuotaQueryRequest{}
}

type UserApiQuotaInsertRequest struct {
	UserId         string `json:"userId"`
	ActionType     string `json:"actionType"`
	RemainingCount int    `json:"remainingCount"`
}

func (in *UserApiQuotaInsertRequest) MapperToModel(input model.UpdateUserInput) {
	mapper.AutoMapper(&input, in)
}

func NewUserApiQuotaInsertRequest() *UserApiQuotaInsertRequest {
	return &UserApiQuotaInsertRequest{}
}
