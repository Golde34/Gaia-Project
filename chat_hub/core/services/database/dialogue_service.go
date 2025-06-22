package services

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	"chat_hub/infrastructure/repository"
	"database/sql"
	"log"
	"strconv"

	"github.com/google/uuid"
)

type DialogueService struct {
	db *sql.DB

	repository *repository.DialogueRepository
}

func NewDialogueService(db *sql.DB) *DialogueService {
	return &DialogueService{
		db: db,
		repository: repository.NewDialogueRepository(db),
	}
}

func (s *DialogueService) CreateDialogue(userId, dialogueType string) (entity.UserDialogueEntity, error) {
	log.Println("Creating dialogue for user:", userId, "with dialog type:", dialogueType)

	userIdF, err := strconv.ParseFloat(userId, 64)
	if err != nil {
		log.Println("Error parsing user ID:", err)
		return entity.UserDialogueEntity{}, err
	}

	dialogue := entity.UserDialogueEntity{
		ID:             uuid.New().String(),
		UserID:         userIdF,
		DialogueName:   enums.GaiaIntroductionDialogue,
		DialogueType:   enums.GaiaIntroductionDialogueType,
		DialogueStatus: enums.ACTIVE,
		Metadata:       "{}",
	}

	// store in repository
	log.Println("Storing dialogue in repository:", dialogue)

	return entity.UserDialogueEntity{}, nil
}
