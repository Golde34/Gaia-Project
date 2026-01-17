package store_adapter

import (
	"context"
	request_dtos "middleware_loader/core/domain/dtos/request"
	database_mongo "middleware_loader/kernel/database/mongo"
)

type IUserApiQuotaRepository interface {
	GetUserApiQuota(ctx context.Context, userQuotaQuery request_dtos.UserApiQuotaQueryRequest) database_mongo.SingleResult
	InsertUserApiQuota(ctx context.Context, userQuota request_dtos.UserApiQuotaInsertRequest) (interface{}, error)
	DecreaseUserApiQuota(ctx context.Context, userId string, actionType string) error
}
