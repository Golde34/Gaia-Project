package repository

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
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

func (r *MessageRepository) GetFarestUserMessageByDialogueId(dialogueId string, numberOfMessages int) (string, error) {
	query := `SELECT id FROM messages WHERE dialogue_id = ? AND sender_type = ? ORDER BY created_at DESC LIMIT ?`
	row := r.db.QueryRow(query, dialogueId, enums.UserMessage, numberOfMessages)
	var messageId string
	err := row.Scan(&messageId)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil 
		}
		return "", err
	}
	return messageId, nil
}

func (r *MessageRepository) GetRecentChatMessagesByDialogueId(dialogueId, oldestMessageId string) ([]entity.MessageEntity, error) {
	query := `SELECT * FROM messages WHERE dialogue_id = ? AND id = ? ORDER BY created_at DESC`
	rows, err := r.db.Query(query, dialogueId, oldestMessageId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []entity.MessageEntity
	for rows.Next() {
		var message entity.MessageEntity
		if err := rows.Scan(&message.ID, &message.UserId, &message.DialogueId, &message.UserMessageId,
			&message.MessageType, &message.SenderType, &message.Content, &message.Metadata,
			&message.CreatedAt, &message.UpdatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	return messages, nil
}