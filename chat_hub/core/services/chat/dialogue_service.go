package services

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	"chat_hub/infrastructure/repository"
	"database/sql"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type DialogueService struct {
	db *sql.DB

	dialogueRepo *repository.DialogueRepository
}

func NewDialogueService(db *sql.DB) *DialogueService {
	return &DialogueService{
		db:           db,
		dialogueRepo: repository.NewDialogueRepository(db),
	}
}

func (s *DialogueService) CreateDialogueIfNotExists(userId, dialogueType string) (entity.UserDialogueEntity, error) {
	log.Println("Checking if dialogue exists for user:", userId, "with dialog type:", dialogueType)

	dialogue, err := s.GetDialogueByUserIdAndType(userId, dialogueType)
	if err != nil {
		log.Println("Error retrieving dialogue from repository:", err)
		return entity.UserDialogueEntity{}, err
	}

	if dialogue.ID != "" {
		log.Println("Dialogue already exists for user:", userId, "with dialog type:", dialogueType)
		return dialogue, nil
	}

	return s.CreateDialogue(userId, dialogueType)
}

func (s *DialogueService) CreateDialogue(userId, dialogueType string) (entity.UserDialogueEntity, error) {
	userIdF, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		log.Println("Error parsing user ID:", err)
		return entity.UserDialogueEntity{}, err
	}

	dialogue := entity.UserDialogueEntity{
		ID:             uuid.New().String(),
		UserID:         userIdF,
		DialogueName:   enums.GaiaIntroductionDialogue,
		DialogueType:   dialogueType,
		DialogueStatus: enums.ACTIVE,
		Metadata:       "{}",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	createdDialogue, err := s.dialogueRepo.CreateDialogue(dialogue)
	if err != nil {
		log.Println("Error creating dialogue in repository:", err)
		return entity.UserDialogueEntity{}, err
	}
	log.Println("Storing dialogue in repository:", dialogue)

	return createdDialogue, nil
}

func (s *DialogueService) GetDialogueByUserIdAndType(userId, dialogueType string) (entity.UserDialogueEntity, error) {
	log.Println("Retrieving dialogue for user:", userId, "with dialog type:", dialogueType)

	dialogue, err := s.dialogueRepo.GetDialogueByUserIdAndType(userId, dialogueType)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error retrieving dialogue from repository:", err)
		return entity.UserDialogueEntity{}, err
	}

	if err == sql.ErrNoRows {
		log.Println("No dialogue found for user:", userId, "with dialog type:", dialogueType)
		return entity.UserDialogueEntity{}, nil
	}

	return dialogue, nil
}

func (s *DialogueService) GetDialogueById(userId, dialogueId string) (entity.UserDialogueEntity, error) {
	log.Println("Retrieving dialogue by ID:", dialogueId)

	dialogue, err := s.dialogueRepo.GetDialogueById(userId, dialogueId)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error retrieving dialogue from repository:", err)
		return entity.UserDialogueEntity{}, err
	}

	if err == sql.ErrNoRows {
		log.Println("No dialogue found with ID:", dialogueId)
		return entity.UserDialogueEntity{}, nil
	}

	return dialogue, nil
}