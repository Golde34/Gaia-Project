package entity

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/kernel/utils"
	"time"
)

const (
	CollectionUserApiQuota = enums.UserApiQuota
)

type UserApiQuota struct {
	ID             string    `json:"id" bson:"_id"`
	UserId         string    `json:"userId" bson:"userid"`
	ActionType     string    `json:"actionType" bson:"actiontype"`
	QuotaDate      string    `json:"quotaDate" bson:"quotadate"`
	RemainingCount int       `json:"remainingCount" bson:"remainingcount"`
	CreatedAt      time.Time `json:"createdAt" bson:"createdat"`
	UpdatedAt      time.Time `json:"updatedAt" bson:"updatedat"`
}

func NewUserApiQuota(userId, actionType string, remainingCount int) *UserApiQuota {
	now := time.Now()
	quotaDate := now.Format("2006-01-02")
	return &UserApiQuota{
		ID:             utils.GenerateUUID(),
		UserId:         userId,
		ActionType:     actionType,
		QuotaDate:      quotaDate,
		RemainingCount: remainingCount,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}
