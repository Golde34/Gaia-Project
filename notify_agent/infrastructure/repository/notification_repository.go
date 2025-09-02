package repository

import (
	"database/sql"
	"log"
	"notify_agent/core/domain/entity"
	base_repo "notify_agent/infrastructure/repository/base"
	"reflect"
)

type NotificationRepository struct {
	db *sql.DB

	base *base_repo.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{
		db: db,
		base: base_repo.NewDB(db),
	}
}

var (
	NotificationTable = `notifications`
)

func (repo *NotificationRepository) CreateNotification(notification entity.Notification) (entity.Notification, error) {
	columns, values := base_repo.StructToColumnsAndValues(notification)
	id, err := repo.base.InsertDB(NotificationTable, columns, values)
	if err != nil {
		return entity.Notification{}, err
	}
	notification.ID = id
	return notification, nil
}

func (repo *NotificationRepository) GetNotificationByNotificationFLowId(notificationFlowId string) (entity.Notification, error) {
	where := map[string]interface{}{
		"notification_flow_id": notificationFlowId,
	}
	rows, err := repo.base.SelectDB(repo.db, NotificationTable, []string{}, where)
	if err != nil {
		return entity.Notification{}, err
	}
	if len(rows) == 0 {
		return entity.Notification{}, sql.ErrNoRows
	}
	row := rows[0]
	notification := entity.Notification{
		ID: base_repo.ToStringUUID(row["id"]),
		MessageID: row["message_id"].(string),
		Type: row["type"].(string),
		Content: row["content"].(string),
		ReceiverID: row["receiver_id"].(string),
		IsRead: row["is_read"].(bool),
		Status: row["status"].(string),
		ErrorStatus: row["error_status"].(string),
		UserId: row["user_id"].(string),
		NotificationFlowId: row["notification_flow_id"].(string),
	}

	log.Println("Notification retrieved: ", notification)
	return notification, nil
}

func (repo *NotificationRepository) UpdateNotification(notificationId string, notification entity.Notification) (entity.Notification, error) {
	where := map[string]interface{}{
		"id": notificationId,
	}
	// convert notification to notification map
	val := reflect.ValueOf(notification)
	typ := reflect.TypeOf(notification)
	notificationMap := base_repo.StructToMap(val, typ)
	updatedNumber, err := repo.base.UpdateDB(repo.db, NotificationTable, notificationMap, where)
	if err != nil {
		return entity.Notification{}, err
	}
	if updatedNumber == 0 {
		return entity.Notification{}, sql.ErrNoRows
	}
	notification.ID = notificationId
	return notification, nil
}