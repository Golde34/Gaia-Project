package request_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type CreateTaskRequestDTO struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Priority     []string `json:"priority"`
	Status       string   `json:"status"`
	StartDate    string   `json:"startDate"`
	Deadline     string   `json:"deadline"`
	Duration     string   `json:"duration"`
	ActiveStatus string   `json:"activeStatus"`
	GroupTaskId  string   `json:"groupTaskId"`
	UserId       float64  `json:"userId"`
}

type UpdateTaskRequestDTO struct {
	UserId         float64  `json:"userId"`
	TaskId         string   `json:"taskId"`
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	StartDate      string   `json:"startDate"`
	Deadline       string   `json:"deadline"`
	Duration       float64  `json:"duration"`
	Status         string   `json:"status"`
	Priority       []string `json:"priority"`
	TaskOrder      float64  `json:"taskOrder"`
	StopTime       float64  `json:"stopTime"`
	ScheduleTaskId string   `json:"scheduleTaskId"`
}

type GenerateTaskRequestDTO struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Priority     []string `json:"priority"`
	Status       string   `json:"status"`
	StartDate    string   `json:"startDate"`
	Deadline     string   `json:"deadline"`
	Duration     string   `json:"duration"`
	ActiveStatus string   `json:"activeStatus"`
	ProjectID    string   `json:"projectId"`
}

type UpdateTaskInDialogRequestDTO struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	TaskID      string `json:"taskId"`
}

type MoveTaskRequestDTO struct {
	OldGroupTaskID string `json:"oldGroupTaskId"`
	NewGroupTaskID string `json:"newGroupTaskId"`
	TaskID         string `json:"taskId"`
}

func NewCreateTaskRequestDTO() *CreateTaskRequestDTO {
	return &CreateTaskRequestDTO{}
}
func (in *CreateTaskRequestDTO) MapperToModel(input model.CreateTaskInput) {
	mapper.AutoMapper(&input, in)
}

func NewUpdateTaskRequestDTO() *UpdateTaskRequestDTO {
	return &UpdateTaskRequestDTO{}
}
func (in *UpdateTaskRequestDTO) MapperToModel(input model.UpdateTaskInput) {
	mapper.AutoMapper(&input, in)
}

func NewGenerateTaskRequestDTO() *GenerateTaskRequestDTO {
	return &GenerateTaskRequestDTO{}
}
func (in *GenerateTaskRequestDTO) MapperToModel(input model.GenerateTaskWithoutGroupTaskInput) {
	mapper.AutoMapper(&input, in)
}

func NewUpdateTaskInDialogInput() *UpdateTaskInDialogRequestDTO {
	return &UpdateTaskInDialogRequestDTO{}
}
func (in *UpdateTaskInDialogRequestDTO) MapperToModel(input model.UpdateTaskInput) {
	mapper.AutoMapper(&input, in)
}

func NewMoveTaskInput() *MoveTaskRequestDTO {
	return &MoveTaskRequestDTO{}
}
func (in *MoveTaskRequestDTO) MapperToModel(input model.MoveTaskInput) {
	mapper.AutoMapper(&input, in)
}
