package repository

import (
	"context"
	"log"
	"middleware_loader/core/domain/entity"
	database_mongo "middleware_loader/kernel/database/mongo"

	"go.mongodb.org/mongo-driver/bson"
)

type OnboardingRepository struct {
	Database   database_mongo.Database
	Collection database_mongo.Collection
}

func NewOnboardingRepository(db database_mongo.Database, collection database_mongo.Collection) OnboardingRepository {
	return OnboardingRepository{db, collection}
}

func (repo *OnboardingRepository) FindOneOrInsertOnboarding(ctx context.Context, userId string) (entity.Onboarding, error) {
	foundedOnboarding, err := repo.FindByUserId(ctx, userId)
	if err == nil {
		log.Println("Onboarding already exists for user:", userId)
		return foundedOnboarding, nil
	}

	newOnboarding := entity.NewOnboarding(userId, true)
	result, err := repo.Collection.InsertOne(ctx, newOnboarding)
	if err != nil {
		return entity.Onboarding{}, err
	}
	log.Println("Inserted new onboarding for user:", userId, "Result:", result)
	return *newOnboarding, nil
}

func (repo *OnboardingRepository) FindByUserId(ctx context.Context, userId string) (entity.Onboarding, error) {
	filter := bson.M{"userid": userId}
	result := repo.Collection.FindOne(ctx, filter)
	onboarding := entity.Onboarding{}
	err := result.Decode(&onboarding)
	if err != nil {
		return entity.Onboarding{}, err
	}
	return onboarding, nil
}
