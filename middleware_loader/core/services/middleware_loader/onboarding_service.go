package services

import (
	"context"
	"log"
	"middleware_loader/core/port/store"
)

type OnboardingService struct {
	Store store.OnboardingStore
}

func NewOnboardingService(store store.OnboardingStore) *OnboardingService {
	return &OnboardingService{
		Store: store,
	}
}

func (s *OnboardingService) CheckUserOnboarding(userId string) (bool, error) {
	onboarding, firstTime, err := s.Store.CheckUserOnboarding(context.Background(), userId)
	if err != nil {
		return true, err
	}
	if !firstTime {
		return true, nil
	}
	log.Printf("Onboarding details: %+v\n", onboarding)
	return false, nil
}
