package usecase

import (
	"context"
	"log"
	request_dtos "notify_agent/core/domain/dtos/request"
	"notify_agent/core/domain/entity"
	"notify_agent/core/port/mapper"
	"notify_agent/core/port/store"
	websocket_service "notify_agent/core/services/websocket"
	"time"
)

type OptimizeTaskUseCase struct {
	Store store.NotificationStore
}

func NewOptimizeTaskUseCase(store *store.NotificationStore) *OptimizeTaskUseCase {
	return &OptimizeTaskUseCase{
		Store: *store,
	}
}

func (usecase *OptimizeTaskUseCase) OptimizeTaskNoti(messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Println("InitOptimizeTask ", ctx, messageId)

	if errorStatus == "INIT" {
		return usecase.initOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	} else {
		return usecase.finalizeOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	}
}

func (usecase *OptimizeTaskUseCase) initOptimizeTaskNoti(ctx context.Context, messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	request := mapper.InsertOptimizeTaskRequestMapper(messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	notification := request_dtos.NewInsertNotificationRequestDTO().MapToEntity(request)
	savedTask, err := usecase.Store.CreateNotification(ctx, notification)
	if err != nil {
		log.Println("Error saving notification: ", err)
		return false, err
	}

	log.Println("Optimize task saved successfully: ", savedTask)
	return true, nil
}

func (usecase *OptimizeTaskUseCase) finalizeOptimizeTaskNoti(ctx context.Context, messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) (bool, error) {
	noti := usecase.validateUpdateOptimizeTaskNoti(ctx, messageId, userId, optimizedStatus, errorStatus, notificationFlowId)
	if (entity.Notification{}) == noti {
		log.Println("Notification not found")
		websocket_service.NewWebSocketService().HandleOptimizeTask(userId, false)
		return false, nil
	}
	notification := mapper.UpdateOptimizeTaskRequestMapper(messageId, optimizedStatus, errorStatus, noti)
	log.Println("Mapped Notification for update case: ", notification)

	savedTask, err := usecase.Store.UpdateNotification(ctx, notification.ID, notification)
	if err != nil {
		log.Println("Error updating notification: ", err)
		websocket_service.NewWebSocketService().HandleOptimizeTask(userId, false)
		return false, err
	}

	log.Println("Optimize task saved successfully: ", savedTask)

	websocket_service.NewWebSocketService().HandleOptimizeTask(userId, true)
	return true, nil
}

func (usecase *OptimizeTaskUseCase) validateUpdateOptimizeTaskNoti(ctx context.Context,
	messageId, userId, optimizedStatus, errorStatus, notificationFlowId string) entity.Notification {

	if messageId == "" || userId == "" || optimizedStatus == "" || errorStatus == "" || notificationFlowId == "" {
		log.Println("Error mapping optimize task request")
		return entity.Notification{}
	}

	savedNoti, err := usecase.Store.GetNotificationByNotificationFLowId(ctx, notificationFlowId)
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
