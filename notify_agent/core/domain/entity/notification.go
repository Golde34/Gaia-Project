package entity

import "notify_agent/core/domain/enums"

const (
	CollectionNotification = enums.Notification
)

type Notification struct {
	ID                 string `json:"id" db:"_id"`
	MessageID          string `json:"message_id" db:"message_id"`
	Type               string `json:"type" db:"type"`
	Content            string `json:"content" db:"content"`
	ReceiverID         string `json:"receiver_id" db:"receiver_id"`
	IsRead             bool   `json:"is_read" db:"is_read"`
	Status             string `json:"status" db:"status"`
	ErrorStatus        string `json:"error_status" db:"error_status"`
	CreatedAt          int64  `json:"created_at" db:"created_at"`
	UpdatedAt          int64  `json:"updated_at" db:"updated_at"`
	UserId             string `json:"user_id" db:"user_id"`
	NotificationFlowId string `json:"notification_flow_id" db:"notification_flow_id"`
}

func NewNotification(id, messageID, notificationType, content, receiverID, status, errorStatus string, isRead bool, createdAt, updatedAt int64, userId, notificationFlowId string) *Notification {
	return &Notification{
		ID:                 id,
		MessageID:          messageID,
		Type:               notificationType,
		Content:            content,
		ReceiverID:         receiverID,
		IsRead:             isRead,
		Status:             status,
		ErrorStatus:        errorStatus,
		CreatedAt:          createdAt,
		UpdatedAt:          updatedAt,
		UserId:             userId,
		NotificationFlowId: notificationFlowId,
	}
}

func (n *Notification) SetID(id string) {
	n.ID = id
}

func (n *Notification) SetMessageID(messageID string) {
	n.MessageID = messageID
}

func (n *Notification) SetType(notificationType string) {
	n.Type = notificationType
}

func (n *Notification) SetContent(content string) {
	n.Content = content
}

func (n *Notification) SetReceiverID(receiverID string) {
	n.ReceiverID = receiverID
}

func (n *Notification) SetIsRead(isRead bool) {
	n.IsRead = isRead
}

func (n *Notification) SetStatus(status string) {
	n.Status = status
}

func (n *Notification) SetErrorStatus(errorStatus string) {
	n.ErrorStatus = errorStatus
}

func (n *Notification) SetCreatedAt(createdAt int64) {
	n.CreatedAt = createdAt
}

func (n *Notification) SetUpdatedAt(updatedAt int64) {
	n.UpdatedAt = updatedAt
}

func (n *Notification) SetUserId(userId string) {
	n.UserId = userId
}

func (n *Notification) SetNotificationFlowId(notificationFlowId string) {
	n.NotificationFlowId = notificationFlowId
}

func (n *Notification) GetID() string {
	return n.ID
}

func (n *Notification) GetMessageID() string {
	return n.MessageID
}

func (n *Notification) GetType() string {
	return n.Type
}

func (n *Notification) GetContent() string {
	return n.Content
}

func (n *Notification) GetReceiverID() string {
	return n.ReceiverID
}

func (n *Notification) GetIsRead() bool {
	return n.IsRead
}

func (n *Notification) GetStatus() string {
	return n.Status
}

func (n *Notification) GetErrorStatus() string {
	return n.ErrorStatus
}

func (n *Notification) GetCreatedAt() int64 {
	return n.CreatedAt
}

func (n *Notification) GetUpdatedAt() int64 {
	return n.UpdatedAt
}

func (n *Notification) GetUserId() string {
	return n.UserId
}

func (n *Notification) GetNotificationFlowId() string {
	return n.NotificationFlowId
}
