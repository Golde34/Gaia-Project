package entity

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/kernel/utils"
	"time"
)

const (
	CollectionScreenConfiguration = enums.ScreenConfiguration
)

type ScreenConfiguration struct {
	ID         string    `json:"id" bson:"_id"`
	ScreenName string    `json:"screenName" bson:"screenname"`
	ScreenUrl  string    `json:"screenUrl" bson:"screenurl"`
	Status     bool      `json:"status" bson:"status"`
	CreatedAt  time.Time `json:"createdAt" bson:"createdat"`
	UpdatedAt  time.Time `json:"updatedAt" bson:"updatedat"`
}

func NewScreenConfiguration(screenName, screenUrl string, status bool) *ScreenConfiguration {
	return &ScreenConfiguration{
		ID: 	  utils.GenerateUUID(),
		ScreenName: screenName,
		ScreenUrl: screenUrl,
		Status:     status,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
}
