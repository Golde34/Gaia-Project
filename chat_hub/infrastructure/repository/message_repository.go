package repository

import (
	entity "chat_hub/core/domain/entities"
	base_repo "chat_hub/infrastructure/repository/base"
	"database/sql"

	"github.com/google/uuid"
)

type MessageRepository struct {
	db *sql.DB
	base *base_repo.DB
}

func NewMessageRepository(db *sql.DB) *MessageRepository{
	return &MessageRepository{
		db: db,
		base: base_repo.NewDB(db),
	}
}

var (
	ChatMessageTable = `messages`
)

// func (r *UserMessageRepository) CreateUserMessage(request request_dtos.MessageRequestDTO) (string, error) {
// 	var entity entity.MessageEntity
// 	base_repo.ConvertStruct(request, &entity)
// 	entity.ID = uuid.New().String()
// 	columns, values := base_repo.StructToColumnsAndValues(entity)
// 	id, err := r.base.InsertDB(UserChatMessageTable, columns, values)
// 	if err != nil {
// 		return "", err
// 	}
// 	return id, nil
// }

func (r *MessageRepository) CreateMessage(request entity.MessageEntity) (string, error) {
	request.ID = uuid.New().String()
	columns, values := base_repo.StructToColumnsAndValues(request)
	id, err := r.base.InsertDB(ChatMessageTable, columns, values)
	if err != nil {
		return "", err
	}
	return id, nil
}
