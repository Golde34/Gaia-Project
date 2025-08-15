package services

import (
	"context"
	"middleware_loader/core/domain/entity"
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
	onboarding, err := s.Store.CheckUserOnboarding(context.Background(), userId)
	if err != nil {
		return false, err
	}
	if onboarding == (entity.Onboarding{}) {
		if !onboarding.FirstTime && onboarding.UserId == "" {
			return false, nil
		}
	}
	return true, nil
}
