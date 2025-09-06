package services

import (
	"context"
	"database/sql"
	"notify_agent/core/domain/entity"
	"notify_agent/infrastructure/repository"
)

type NotificationService struct {
	db       *sql.DB
	notiRepo *repository.NotificationRepository
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{
		db:       db,
		notiRepo: repository.NewNotificationRepository(db),
	}
}

func (s *NotificationService) GetAllNotifications(context context.Context, userId string) ([]entity.Notification, error) {
	return s.notiRepo.GetNotificationByUserId(userId)
}
