package client

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/graph/model"
)

type ITaskAdapter interface {
	GetAllTasks() ([]response_dtos.TaskResponseDTO, error)
	GetTaskById(id string) (response_dtos.TaskResponseDTO, error)
	CreateTask(input model.CreateTaskInput) (response_dtos.TaskResponseDTO, error)
	UpdateTask(input model.UpdateTaskInput, id string) (response_dtos.TaskResponseDTO, error)
	DeleteTask(id string) (response_dtos.TaskResponseDTO, error)
	// GetSubTasksByTaskId(id string) ([]model.SubTask, error)
	// GetCommentsByTaskId(id string) ([]model.Comment, error)
	GenerateTaskWithoutGroupTask(input model.GenerateTaskWithoutGroupTaskInput) (response_dtos.TaskResponseDTO, error)
	UpdateTaskInDialog(input model.UpdateTaskInDialogInput, id string) (response_dtos.TaskResponseDTO, error)
	MoveTask(input model.MoveTaskInput, id string) (response_dtos.TaskResponseDTO, error)
	ArchiveTask(id string) (response_dtos.TaskResponseDTO, error)
	EnableTask(id string) (response_dtos.TaskResponseDTO, error)
	GetTaskDetail(input request_dtos.GetTaskDetailInputDTO) (interface{}, error)
	GetDoneTasks(userId string) ([]response_dtos.CountDoneTaskListDTO, error)
	GetTopTasks(userId string) ([]response_dtos.TaskResponseDTO, error)
}