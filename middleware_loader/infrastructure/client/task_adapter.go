package client_adapter

import (
	"encoding/json"
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

type TaskAdapter struct {
	CreateTaskRequestDTO request_dtos.CreateTaskRequestDTO
	UpdateTaskRequestDTO request_dtos.UpdateTaskRequestDTO
}

func NewTaskAdapter() *TaskAdapter {
	return &TaskAdapter{}
}

func (adapter *TaskAdapter) GetAllTasks() ([]response_dtos.TaskResponseDTO, error) {
	listAllTasksURL := base.TaskManagerServiceURL + "/task"
	var tasks []response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(listAllTasksURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.TaskResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.TaskResponseDTO{}, nil
	}
	for _, taskElement := range bodyResultMap["tasks"].([]interface{}) {
		task := mapper_response.ReturnTaskObjectMapper(taskElement.(map[string]interface{}))
		tasks = append(tasks, *task)
	}

	return tasks, nil
}

func (adapter *TaskAdapter) GetTaskById(id string) (response_dtos.TaskResponseDTO, error) {
	getTaskByIdURL := base.TaskManagerServiceURL + "/task/" + id
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(getTaskByIdURL, "GET", nil, &task, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	return result.(response_dtos.TaskResponseDTO), nil
}

func (adapter *TaskAdapter) CreateTask(input model.CreateTaskInput) (response_dtos.TaskResponseDTO, error) {
	createTaskURL := base.TaskManagerServiceURL + "/task/create"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(createTaskURL, "POST", input, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) UpdateTask(input model.UpdateTaskInput, id string) (response_dtos.TaskResponseDTO, error) {
	updateTaskURL := base.TaskManagerServiceURL + "/task/" + id
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(updateTaskURL, "PUT", input, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) DeleteTask(id string) (response_dtos.TaskResponseDTO, error) {
	deleteTaskURL := base.TaskManagerServiceURL + "/task/" + id
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(deleteTaskURL, "DELETE", nil, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

// func GetSubTasksByTaskId(id string) ([]response_dtos.TaskResponseDTO, error) {
// 	listSubTasksURL := base.TaskManagerServiceURL + "/task/" + id + "/subtasks"
// 	var tasks []response_dtos.TaskResponseDTO

// 	bodyResult, err := base.BaseAPI(listSubTasksURL, "GET", nil)
// 	if err != nil {
// 		return []response_dtos.TaskResponseDTO{}, err
// 	}

// 	bodyResultMap, ok := bodyResult.(map[string]interface{})
// 	if !ok {
// 		return []response_dtos.TaskResponseDTO{}, nil
// 	}
// 	for _, taskElement := range bodyResultMap["tasks"].([]interface{}) {
// 		task := mapper_response.ReturnTaskObjectMapper(taskElement.(map[string]interface{}))
// 		tasks = append(tasks, *task)
// 	}

// 	return tasks, nil
// }

// func GetCommentsByTaskI(id string) ([response_dtos.CommentResponseDTO], error) {
// 	listCommentsURL := base.TaskManagerServiceURL + "/task/" + id + "/comments"
// 	var comments []response_dtos.CommentResponseDTO

// 	bodyResult, err := base.BaseAPI(listCommentsURL, "GET", nil)
// 	if err != nil {
// 		return [response_dtos.CommentResponseDTO], err
// 	}

// 	bodyResultMap, ok := bodyResult.(map[string]interface{})
// 	if !ok {
// 		return [response_dtos.CommentResponseDTO], nil
// 	}
// 	for _, commentElement := range bodyResultMap["comments"].([]interface{}) {
// 		comment := mapper_response.ReturnCommentObjectMapper(commentElement.(map[string]interface{}))
// 		comments = append(comments, *comment)
// 	}

// 	return comments, nil
// }

func (adapter *TaskAdapter) GenerateTaskWithoutGroupTask(input model.GenerateTaskWithoutGroupTaskInput) (response_dtos.TaskResponseDTO, error) {
	generateTaskURL := base.TaskManagerServiceURL + "/task/generate"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(generateTaskURL, "POST", input, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) UpdateTaskInDialog(input model.UpdateTaskInDialogInput, id string) (response_dtos.TaskResponseDTO, error) {
	updateTaskInDialogURL := base.TaskManagerServiceURL + "/task/" + id + "/update-task-in-dialog"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(updateTaskInDialogURL, "PUT", input, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) MoveTask(input model.MoveTaskInput, id string) (response_dtos.TaskResponseDTO, error) {
	moveTaskURL := base.TaskManagerServiceURL + "/task/" + id + "/move-task"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(moveTaskURL, "PUT", input, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) ArchiveTask(id string) (response_dtos.TaskResponseDTO, error) {
	archiveTaskURL := base.TaskManagerServiceURL + "/task/" + id + "/archive"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(archiveTaskURL, "PUT", nil, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) EnableTask(id string) (response_dtos.TaskResponseDTO, error) {
	enableTaskURL := base.TaskManagerServiceURL + "/task/" + id + "/enable"
	var task response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(enableTaskURL, "PUT", nil, headers)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}
	err = json.Unmarshal(dataBytes, &task)
	if err != nil {
		return response_dtos.TaskResponseDTO{}, err
	}

	return task, nil
}

func (adapter *TaskAdapter) GetTaskDetail(input request_dtos.GetTaskDetailInputDTO) (interface{}, error) {
	getTaskDetailURL := base.TaskManagerServiceURL + "/task/" + input.TaskId + "/get-task-detail"
	var taskDetail interface{}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(getTaskDetailURL, "POST", input, headers)
	if err != nil {
		return nil, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyResult)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(dataBytes, &taskDetail)
	if err != nil {
		return nil, err
	}

	return taskDetail, nil
}

func (adapter *TaskAdapter) GetDoneTasks(userId string) ([]response_dtos.CountDoneTaskListDTO, error) {
	getDoneTasksURL := base.TaskManagerServiceURL + "/dashboard/done-tasks/" + userId
	var doneTasks []response_dtos.CountDoneTaskListDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(getDoneTasksURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.CountDoneTaskListDTO{}, err
	}
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.CountDoneTaskListDTO{}, nil
	}

	for _, taskElement := range bodyResultMap["data"].([]interface{}) {
		task := mapper_response.ReturnCountDoneTaskMapper(taskElement.(map[string]interface{}))
		doneTasks = append(doneTasks, *task)
	}

	return doneTasks, nil
}

func (adapter *TaskAdapter) GetTopTasks(userId string) ([]response_dtos.TaskResponseDTO, error) {
	getTopTasksURL := base.TaskManagerServiceURL + "/dashboard/top-tasks/" + userId
	var topTasks []response_dtos.TaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(getTopTasksURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.TaskResponseDTO{}, err
	}
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.TaskResponseDTO{}, nil
	}

	for _, taskElement := range bodyResultMap["topTasks"].([]interface{}) {
		task := mapper_response.ReturnTaskObjectMapper(taskElement.(map[string]interface{}))
		topTasks = append(topTasks, *task)
	}

	return topTasks, nil
}