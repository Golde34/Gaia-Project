package services

import (
	"context"
	"log"

	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	"middleware_loader/core/validator"
	adapter "middleware_loader/infrastructure/client"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

type TaskService struct {

}

func NewTaskService() *TaskService {
	return &TaskService{}
}

var taskValidator = validator.NewTaskDTOValidator()
var taskResponse = response_dtos.NewTaskResponseDTO()
var taskDetailResponse = response_dtos.NewTaskDetailResponseDTO()

func (s *TaskService) ListAllTasks(ctx context.Context) ([]model.Task, error) {
	tasks, err := client.ITaskAdapter(&adapter.TaskAdapter{}).GetAllTasks()
	if err != nil {
		return nil, err
	}
	tasksModel := taskResponse.MapperListToGraphQLModel(tasks)

	return tasksModel, nil
}

func (s *TaskService) GetTaskById(ctx context.Context, id string) (model.Task, error) {
	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).GetTaskById(id)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) CreateTask(ctx context.Context, input model.CreateTaskInput) (model.Task, error) {
	err := taskValidator.CreateTaskValidate(input)
	if err != nil {
		return model.Task{}, err
	}
	log.Println("Validation passed!")

	input.Priority = utils.ConvertStringToArray(input.Priority)
	log.Println("priority: ", input.Priority)

	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).CreateTask(input)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) UpdateTask(ctx context.Context, input model.UpdateTaskInput) (model.Task, error) {
	err := taskValidator.UpdateTaskValidate(input)
	if err != nil {
		return model.Task{}, err
	}
	log.Println("Validation passed!")

	input.Priority = utils.ConvertStringToArray(input.Priority)
	taskId := input.TaskID

	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).UpdateTask(input, taskId)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) DeleteTask(ctx context.Context, input model.IDInput) (model.Task, error) {
	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).DeleteTask(input.ID)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) GenerateTaskWithoutGroupTask(ctx context.Context, input model.GenerateTaskWithoutGroupTaskInput) (model.Task, error) {
	err := taskValidator.GenerateTaskValidate(input)
	if err != nil {
		return model.Task{}, err
	}
	log.Println("Validation passed!")

	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).GenerateTaskWithoutGroupTask(input)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) UpdateTaskInDialog(ctx context.Context, input model.UpdateTaskInDialogInput) (model.Task, error) {
	err := taskValidator.UpdateTaskInDialogValidate(input)
	if err != nil {
		return model.Task{}, err
	}
	log.Println("Validation passed!")

	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).UpdateTaskInDialog(input, input.TaskID)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) MoveTask(ctx context.Context, input model.MoveTaskInput) (model.Task, error) {
	err := taskValidator.MoveTaskValidate(input)
	if err != nil {
		return model.Task{}, err
	}
	log.Println("Validation passed!")

	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).MoveTask(input, input.TaskID)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) ArchiveTask(ctx context.Context, input model.IDInput) (model.Task, error) {
	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).ArchiveTask(input.ID)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) EnableTask(ctx context.Context, input model.IDInput) (model.Task, error) {
	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).EnableTask(input.ID)
	if err != nil {
		return model.Task{}, err
	} else {
		taskModel := taskResponse.MapperToGraphQLModel(task)
		return taskModel, nil
	}
}

func (s *TaskService) GetTaskDetail(input request_dtos.GetTaskDetailInputDTO) (response_dtos.TaskDetailResponseDTO, error) {
	task, err := client.ITaskAdapter(&adapter.TaskAdapter{}).GetTaskDetail(input)
	if err != nil {
		return response_dtos.TaskDetailResponseDTO{}, err
	} else {
		response := taskDetailResponse.MapperTaskDetail(task)
		return response, nil
	}	
}

func (s *TaskService) GetDoneTasks(userId string) ([]response_dtos.TaskResponseDTO, error) {
	tasks, err := client.ITaskAdapter(&adapter.TaskAdapter{}).GetDoneTasks(userId)
	if err != nil {
		return []response_dtos.TaskResponseDTO{}, err
	}
	return tasks, nil
}