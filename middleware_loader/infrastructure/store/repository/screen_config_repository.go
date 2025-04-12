package repository

import (
	"context"
	"log"
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

func (repo *ScreenConfigurationRepository) InsertScreen(
	context context.Context, 
	screen map[string]any,
) (entity.ScreenConfiguration, error) {
	screenEntity := entity.NewScreenConfiguration(
		screen["screenName"].(string),
		screen["screenUrl"].(string),
		screen["status"].(bool),
	)
	log.Println("Inserting screen configuration:", screenEntity)

	foundedScreen, err := repo.FindByScreenName(context, screenEntity.ScreenName)
	if err == nil {
		log.Println("Screen configuration already exists:", foundedScreen)
		return foundedScreen, nil
	}

	result, err := repo.Collection.InsertOne(context, screenEntity)
	if err != nil {
		return entity.ScreenConfiguration{}, err
	}
	log.Println("Inserted screen configuration:", result)
	return *screenEntity, nil
}

func (repo ScreenConfigurationRepository) FindByScreenName(
	ctx context.Context,
	screenName string,
) (entity.ScreenConfiguration, error) {
	filter := bson.M{"screenname": screenName}
	result := repo.Collection.FindOne(ctx, filter)
	screen := entity.ScreenConfiguration{}
	err := result.Decode(&screen)
	if err != nil {
		return entity.ScreenConfiguration{}, err
	}

	return screen, nil
}
