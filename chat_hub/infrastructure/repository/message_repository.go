package repository

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	base_repo "chat_hub/infrastructure/repository/base"
	"chat_hub/kernel/utils"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MessageRepository struct {
	db   *sql.DB
	base *base_repo.DB
}

func NewMessageRepository(db *sql.DB) *MessageRepository {
	return &MessageRepository{
		db:   db,
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

// GetRecentChatMessagesByDialogueId retrieves all messages in a dialogue starting
// from the N-th latest user message. It returns every message from that point
// onward ordered by creation time descending.
func (r *MessageRepository) GetRecentChatMessagesByDialogueId(dialogueId string, numberOfMessages int) ([]entity.MessageEntity, error) {
	query := `SELECT user_id, dialogue_id, sender_type, content, metadata
                FROM messages
                WHERE dialogue_id = $1
                AND created_at >= COALESCE((
                        SELECT created_at FROM messages
                        WHERE dialogue_id = $1 AND sender_type = $2
                        ORDER BY created_at DESC
                        OFFSET $3 LIMIT 1
                ), to_timestamp(0))
                ORDER BY created_at DESC`
	rows, err := r.db.Query(query, dialogueId, string(enums.UserMessage), numberOfMessages-1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []entity.MessageEntity
	for rows.Next() {
		var message entity.MessageEntity
		if err := rows.Scan(&message.UserId, &message.DialogueId,
			&message.SenderType, &message.Content, &message.Metadata); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	return messages, nil
}

func (r *MessageRepository) GetMessagesByDialogueIdWithCursorPagination(dialogueId string, size int, cursor string) ([]entity.MessageEntity, error) {
	size = utils.ValidatePagination(size)

	var (
		rows *sql.Rows
		err  error
	)

	baseQuery := `
		SELECT id, user_id, dialogue_id, sender_type, content, metadata, created_at
		FROM messages
		WHERE dialogue_id = $1
	`

	if cursor == "" {
		query := baseQuery + `
			ORDER BY created_at DESC
			LIMIT $2`
		rows, err = r.db.Query(query, dialogueId, size)
	} else {
		query := baseQuery + `
			AND created_at < $2::timestamp
			ORDER BY created_at DESC
			LIMIT $3`
		rows, err = r.db.Query(query, dialogueId, cursor, size)
	}

	if err != nil {
		return nil, fmt.Errorf("error executing query: %w", err)
	}
	defer rows.Close()

	var messages []entity.MessageEntity
	for rows.Next() {
		var message entity.MessageEntity
		var createdAt time.Time
		if err := rows.Scan(&message.ID, &message.UserId, &message.DialogueId, &message.SenderType,
			&message.Content, &message.Metadata, &createdAt); err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}
		message.CreatedAt = createdAt
		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return messages, nil
}
