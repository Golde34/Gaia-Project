package repository

import (
	"context"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/entity"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/kernel/utils"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserApiQuotaRepository struct {
	Database   database_mongo.Database
	Collection database_mongo.Collection
}

func NewUserApiQuotaRepository(db database_mongo.Database, collection database_mongo.Collection) UserApiQuotaRepository {
	return UserApiQuotaRepository{db, collection}
}

func (repo *UserApiQuotaRepository) GetUserApiQuota(
	ctx context.Context, userQuotaQuery request_dtos.UserApiQuotaQueryRequest) database_mongo.SingleResult {
	filter := map[string]interface{}{
		"userid":     userQuotaQuery.UserId,
		"actiontype": userQuotaQuery.ActionType,
		"quotadate":  userQuotaQuery.QuotaDate,
	}
	result := repo.Collection.FindOne(ctx, filter)
	return result
}

func (repo *UserApiQuotaRepository) InsertUserApiQuota(
	ctx context.Context, userQuota request_dtos.UserApiQuotaInsertRequest) (interface{}, error) {
	userQuotaEntity := entity.NewUserApiQuota(
		userQuota.UserId,
		userQuota.ActionType,
		userQuota.RemainingCount,
	)
	_, err := repo.Collection.InsertOne(ctx, userQuotaEntity)
	if err != nil {
		return entity.UserApiQuota{}, err
	}
	return *userQuotaEntity, nil
}

func (repo *UserApiQuotaRepository) DecreaseUserApiQuota(
	ctx context.Context, userId string, actionType string) error {
    
    today := utils.GetTodayDateString()
    now := time.Now()

    filter := bson.M{
        "userid":     userId,
        "actiontype": actionType,
        "quotadate":  today,
    }

    update := bson.M{
        "$inc": bson.M{
            "remainingcount": -1,
        },
        "$set": bson.M{
            "updatedat": now,
        },
        "$setOnInsert": bson.M{
            "_id":       uuid.New().String(),
            "createdat": now,
        },
    }

    opts := options.Update().SetUpsert(true)

    _, err := repo.Collection.UpdateOne(ctx, filter, update, opts)
    return err
}
