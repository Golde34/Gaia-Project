package repository

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	entity "chat_hub/core/domain/entities"
	base_repo "chat_hub/infrastructure/repository/base"
	"database/sql"
)

type BotMessageRepository struct {
	db *sql.DB
	base *base_repo.DB
}

func NewBotMessageRepository(db *sql.DB) *BotMessageRepository {
	return &BotMessageRepository{
		db: db,
		base: base_repo.NewDB(db),
	}
}

func (r *BotMessageRepository) CreateBotMessage(request request_dtos.MessageRequestDTO) (string, error) {
	var entity entity.BotMessageEntity
	base_repo.ConvertStruct(request, &entity)	
	columns, values := base_repo.StructToColumnsAndValues(entity)
	id, err := r.base.InsertDB("bot_messages", columns, values)
	if err != nil {
		return "", err
	}
	return id, nil
}