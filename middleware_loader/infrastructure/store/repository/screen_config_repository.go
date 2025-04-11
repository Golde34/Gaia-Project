package repository

import (
	"context"
	"middleware_loader/core/domain/entity"
	database_mongo "middleware_loader/kernel/database/mongo"

	"go.mongodb.org/mongo-driver/bson"
)

type ScreenConfigurationRepository struct {
	Database   database_mongo.Database
	Collection database_mongo.Collection
}

func NewScreenConfigurationRepository(db database_mongo.Database, collection database_mongo.Collection) ScreenConfigurationRepository {
	return ScreenConfigurationRepository{db, collection}
}

func (repo *ScreenConfigurationRepository) GetAllScreens(context context.Context) ([]entity.ScreenConfiguration, error) {
	cursor, err := repo.Collection.Find(context, bson.M{})
	if err != nil {
		return nil, err
	}
	var screens []entity.ScreenConfiguration
	if err = cursor.All(context, &screens); err != nil {
		return nil, err
	}

	return screens, nil
}
