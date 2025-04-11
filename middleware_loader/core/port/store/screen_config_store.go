package store

import (
	"context"
	"middleware_loader/core/domain/entity"
	"middleware_loader/core/domain/enums"
	store_adapter "middleware_loader/infrastructure/store/adapter"
	"middleware_loader/infrastructure/store/repository"
	database_mongo "middleware_loader/kernel/database/mongo"
)

type ScreenConfigurationStore struct {
	Database   database_mongo.Database
	Collection string
}

func NewScreenConfigurationStore(db database_mongo.Database) ScreenConfigurationStore {
	return ScreenConfigurationStore{db, enums.ScreenConfiguration}
}

func (store *ScreenConfigurationStore) GetAllScreens(context context.Context) ([]entity.ScreenConfiguration, error) {
	collection := store.Database.Collection(store.Collection)
	db := store.Database

	screens, err := store_adapter.IScreenConfigurationRepository(
		&repository.ScreenConfigurationRepository{Database: db, Collection: collection},
	).GetAllScreens(context)
	if err != nil {
		return nil, err
	}
		
	return screens, nil
}
