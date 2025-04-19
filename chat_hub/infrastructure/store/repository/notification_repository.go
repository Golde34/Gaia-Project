package repository

import (
	"context"
	"log"
	"chat_hub/core/domain/entity"
	database_mongo "chat_hub/kernel/database/mongo"

	"go.mongodb.org/mongo-driver/bson"
)

type NotificationRepository struct {
	Database   database_mongo.Database
	Collection database_mongo.Collection
}

func NewNotificationRepository(db database_mongo.Database, collection database_mongo.Collection) NotificationRepository {
	return NotificationRepository{
		Database:   db,
		Collection: collection,
	}
}

func (repo *NotificationRepository) CreateNotification(context context.Context, notification entity.Notification) (interface{}, error) {
	if err := repo.Database.Client().Ping(context); err != nil {
		log.Println("MongoDB connection error: ", err)
		return nil, err
	}
	
	result, err := repo.Collection.InsertOne(context, notification)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (repo *NotificationRepository) GetNotificationByNotificationFLowId(ctx context.Context, notificationFlowId string) (entity.Notification, error) {
	filter := bson.M{"notification_flow_id": notificationFlowId} 
	result := repo.Collection.FindOne(ctx, filter)

	var notification entity.Notification
	if err := result.Decode(&notification); err != nil {
		log.Println("Error decoding notification: ", err)
		return entity.Notification{}, err
	}

	log.Println("Notification retrieved: ", notification)
	return notification, nil
}

func (repo *NotificationRepository) UpdateNotification(context context.Context, notificationId string, notification entity.Notification) (entity.Notification, error) {
	filter := bson.M{"_id": notificationId}
	update := bson.M{"$set": notification}
	_, err := repo.Collection.UpdateOne(context, filter, update)
	if err != nil {
		log.Println("Error updating notification: ", err)
		return entity.Notification{}, err
	}

	return notification, nil
}