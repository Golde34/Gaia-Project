package store

import (
	"context"
	"middleware_loader/core/domain/entity"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/store/repository"
	database_mongo "middleware_loader/kernel/database/mongo"
)

type OnboardingStore struct {
	Database   database_mongo.Database
	Collection string
}

func NewOnboardingStore(db database_mongo.Database) OnboardingStore {
	return OnboardingStore{
		Database:   db,
		Collection: enums.Onboarding,
	}
}

func (store *OnboardingStore) CheckUserOnboarding(ctx context.Context, userId string) (entity.Onboarding, bool, error) {
	collection := store.Database.Collection(store.Collection)
	db := store.Database

	onboarding := repository.NewOnboardingRepository(db, collection)
	return onboarding.FindOneOrInsertOnboarding(ctx, userId)
}
