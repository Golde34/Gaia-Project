package services

import (
	"context"
	"log"
	request_dtos "notify_agent/core/domain/dtos/request"
	"notify_agent/core/domain/entity"
	"notify_agent/core/port/mapper"
	"notify_agent/core/port/store"
	// services "notify_agent/core/services/websocket"
	"time"
)

type OptimizeTaskNotifyService struct {
	Store store.NotificationStore
}

func NewOptimizeTaskNotifyService(store *store.NotificationStore) *OptimizeTaskNotifyService {
	return &OptimizeTaskNotifyService{
		Store: *store,
	}
}

func (service *OptimizeTaskNotifyService) OptimizeTaskNoti(messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Println("InitOptimizeTask ", ctx, messageId)

	if errorStatus == "INIT" {
		return service.initOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	} else {
		return service.finalizeOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	}
}

func (service *OptimizeTaskNotifyService) initOptimizeTaskNoti(ctx context.Context, messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	request := mapper.InsertOptimizeTaskRequestMapper(messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	notification := request_dtos.NewInsertNotificationRequestDTO().MapToEntity(request)
	savedTask, err := service.Store.CreateNotification(ctx, notification)
	if err != nil {
		log.Println("Error saving notification: ", err)
		return false, err
	}

	log.Println("Optimize task saved successfully: ", savedTask)
	return true, nil
}

func (service *OptimizeTaskNotifyService) finalizeOptimizeTaskNoti(ctx context.Context, messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	noti := service.validateUpdateOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	if (entity.Notification{}) == noti {
		log.Println("Notification not found")
		return false, nil
	}
	notification := mapper.UpdateOptimizeTaskRequestMapper(messageId, optimizedStatus, errorStatus, noti)
	log.Println("Mapped Notification for update case: ", notification)

	savedTask, err := service.Store.UpdateNotification(ctx, notification.ID, notification)
	if err != nil {
		log.Println("Error updating notification: ", err)
		return false, err
	}

	log.Println("Optimize task saved successfully: ", savedTask)
	return true, nil
}

func (service *OptimizeTaskNotifyService) validateUpdateOptimizeTaskNoti(ctx context.Context,
	messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) entity.Notification {

	if messageId == "" || userId == "" || optimizedStatus == "" || errorStatus == "" || notificationFlowId == "" {
		log.Println("Error mapping optimize task request")
		return entity.Notification{}
	}

	savedNoti, err := service.Store.GetNotificationByNotificationFLowId(ctx, notificationFlowId)
	if err != nil {
		log.Println("Error retrieving notification: ", err)
		return entity.Notification{}
	}

	if (entity.Notification{}) == savedNoti {
		log.Println("Notification not found")
		return entity.Notification{}
	}

	if savedNoti.NotificationFlowId != notificationFlowId {
		log.Println("Invalid notification flow ID")
		return entity.Notification{}
	}

	if savedNoti.ErrorStatus != "INIT" {
		log.Println("Notification already processed")
		return entity.Notification{}
	}

	if savedNoti.UserId != userId {
		log.Println("User ID mismatch")
		return entity.Notification{}
	}

	return savedNoti
}
