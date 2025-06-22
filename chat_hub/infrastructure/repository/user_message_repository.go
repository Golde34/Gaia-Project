package repository

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	entity "chat_hub/core/domain/entities"
	base_repo "chat_hub/infrastructure/repository/base"
	"database/sql"
)

type UserMessageRepository struct {
	db *sql.DB
	base *base_repo.DB
}

func NewUserMessageRepository(db *sql.DB) *UserMessageRepository {
	return &UserMessageRepository{
		db: db,
		base: base_repo.NewDB(db),
	}
}

func (r *UserMessageRepository) CreateUserMessage(request request_dtos.MessageRequestDTO) (string, error) {
	var entity entity.UserChatMessageEntity
	base_repo.ConvertStruct(request, &entity)	
	columns, values := base_repo.StructToColumnsAndValues(entity)
	id, err := r.base.InsertDB("user_chat_messages", columns, values)
	if err != nil {
		return "", err
	}
	return id, nil
}