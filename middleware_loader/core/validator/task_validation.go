package validator

import (
	"fmt"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/graph/model"
)

type TaskValidator struct {
	CreateTaskRequestDTO request_dtos.CreateTaskRequestDTO
	UpdateTaskRequestDTO request_dtos.UpdateTaskRequestDTO
	GenerateTaskRequestDTO request_dtos.GenerateTaskRequestDTO
	MoveTaskRequestDTO request_dtos.MoveTaskRequestDTO
	UpdateTaskInDialogRequestDTO request_dtos.UpdateTaskInDialogRequestDTO
}

func NewTaskDTOValidator() *TaskValidator {
	return &TaskValidator{}
}

func (in *TaskValidator) CreateTaskValidate(input model.CreateTaskInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", enums.ErrValidation)
	}
	if input.UserID <= 0 {
		return fmt.Errorf("%w: user id is nil", enums.ErrValidation)
	}
	return nil
}

func (in *TaskValidator) UpdateTaskValidate(input model.UpdateTaskInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", enums.ErrValidation)
	}

	return nil
}

func (in *TaskValidator) GenerateTaskValidate(input model.GenerateTaskWithoutGroupTaskInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", enums.ErrValidation)
	}

	return nil
}

func (in *TaskValidator) MoveTaskValidate(input model.MoveTaskInput) error {
	if input.OldGroupTaskID == "" {
		return fmt.Errorf("%w: task id is required", enums.ErrValidation)
	}
	if input.NewGroupTaskID == "" {
		return fmt.Errorf("%w: group task id is required", enums.ErrValidation)
	}

	return nil
}

func (in *TaskValidator) UpdateTaskInDialogValidate(input model.UpdateTaskInDialogInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", enums.ErrValidation)
	}

	return nil
}