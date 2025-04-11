package entity

import (
	"middleware_loader/core/domain/enums"
	"time"
)

const (
	CollectionScreenConfiguration = enums.ScreenConfiguration
)

type ScreenConfiguration struct {
	ID         string    `json:"id" bson:"_id"`
	ScreenName string    `json:"screenName" bson:"screenname"`
	Status     bool      `json:"status" bson:"status"`
	CreatedAt  time.Time `json:"createdAt" bson:"createdat"`
	UpdatedAt  time.Time `json:"updatedAt" bson:"updatedat"`
}

func NewScreenConfiguration(id, screenName string, status bool, createdAt, updatedAt time.Time) *ScreenConfiguration {
	return &ScreenConfiguration{
		ID:         id,
		ScreenName: screenName,
		Status:     status,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}
}
