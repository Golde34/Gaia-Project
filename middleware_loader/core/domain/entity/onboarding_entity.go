package entity

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/kernel/utils"
	"time"
)

const (
	CollectionOnboarding = enums.Onboarding
)

type Onboarding struct {
	ID        string
	UserId    string
	FirstTime bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewOnboarding(
	UserId string,
	FirstTime bool,
) *Onboarding {
	return &Onboarding{
		ID:        utils.GenerateUUID(),
		UserId:    UserId,
		FirstTime: FirstTime,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
