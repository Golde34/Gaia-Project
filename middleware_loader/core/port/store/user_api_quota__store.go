package store

import (
	"context"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/entity"
	"middleware_loader/core/domain/enums"
	store_adapter "middleware_loader/infrastructure/store/adapter"
	"middleware_loader/infrastructure/store/repository"
	database_mongo "middleware_loader/kernel/database/mongo"
)

type UserApiQuotaStore struct {
	Database   database_mongo.Database
	Collection string
}

func NewUserApiQuotaStore(db database_mongo.Database) UserApiQuotaStore {
	return UserApiQuotaStore{db, enums.UserApiQuota}
}

func (store *UserApiQuotaStore) GetUserApiQuota(context context.Context,
	userQuotaQuery request_dtos.UserApiQuotaQueryRequest) database_mongo.SingleResult {

	collection := store.Database.Collection(store.Collection)
	db := store.Database
	result := store_adapter.IUserApiQuotaRepository(
		&repository.UserApiQuotaRepository{Database: db, Collection: collection},
	).GetUserApiQuota(context, userQuotaQuery)
	return result
}

func (store *UserApiQuotaStore) InsertUserApiQuota(context context.Context,
	userQuota request_dtos.UserApiQuotaInsertRequest) (entity.UserApiQuota, error) {
	collection := store.Database.Collection(store.Collection)
	db := store.Database
	result, err := store_adapter.IUserApiQuotaRepository(
		&repository.UserApiQuotaRepository{Database: db, Collection: collection},
	).InsertUserApiQuota(context, userQuota)
	if err != nil {
		return entity.UserApiQuota{}, err
	}
	// Type assert the result to UserApiQuota
	userQuotaEntity, ok := result.(entity.UserApiQuota)
	if !ok {
		return entity.UserApiQuota{}, nil
	}
	return userQuotaEntity, nil
}

func (store *UserApiQuotaStore) DecreaseUserApiQuota(ctx context.Context, userId string, actionType string) error {
	collection := store.Database.Collection(store.Collection)
	db := store.Database
	err := store_adapter.IUserApiQuotaRepository(
		&repository.UserApiQuotaRepository{Database: db, Collection: collection},
	).DecreaseUserApiQuota(ctx, userId, actionType)
	return err
}
