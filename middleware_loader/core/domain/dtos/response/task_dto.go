package response_dtos

import (
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"

	"github.com/devfeel/mapper"
)

type TaskResponseDTO struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Priority     []string `json:"priority"`
	Status       string   `json:"status"`
	StartDate    string   `json:"startDate"`
	Deadline     string   `json:"deadline"`
	Duration     float64  `json:"duration"`
	ActiveStatus string   `json:"activeStatus"`

	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`

	GroupTaskId string   `json:"groupTaskId"`
	SubTasks    []string `json:"subTasks"`
	Comments    []string `json:"comments"`
}

func NewTaskResponseDTO() *TaskResponseDTO {
	return &TaskResponseDTO{}
}

// mapper from dto to graphql model
func (in *TaskResponseDTO) MapperToGraphQLModel(input TaskResponseDTO) model.Task {
	var out model.Task
	mapper.AutoMapper(&input, &out)
	return out
}

func (in *TaskResponseDTO) MapperListToGraphQLModel(input []TaskResponseDTO) []model.Task {
	var out []model.Task
	for _, item := range input {
		out = append(out, in.MapperToGraphQLModel(item))
	}
	return out
}

type TaskDashboardResponseDTO struct {
	DoneTaskList    []*model.Task `json:"doneTaskList"`
	NotDoneTaskList []*model.Task `json:"notDoneTaskList"`
}

func NewTaskDashboardResponseDTO() *TaskDashboardResponseDTO {
	return &TaskDashboardResponseDTO{}
}

func (in *TaskDashboardResponseDTO) MapTaskDashboard(input TaskDashboardResponseDTO) model.TaskDashboard {
	var out model.TaskDashboard
	mapper.AutoMapper(&input, &out)
	return out
}

type TaskTableResponseDTO struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Priority    []string      `json:"priority"`
	Status      string        `json:"status"`
	TaskTable   []*model.Task `json:"tasks"`
}

func NewTaskTableResponseDTO() *TaskTableResponseDTO {
	return &TaskTableResponseDTO{}
}

func (in *TaskTableResponseDTO) MapTaskTable(input TaskTableResponseDTO) model.TaskTable {
	var out model.TaskTable
	mapper.AutoMapper(&input, &out)
	return out
}

type TaskDetailResponseDTO struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    []string `json:"priority"`
	Status      string   `json:"status"`
	Duration    float64  `json:"duration"`
	StartDate   string   `json:"startDate"`
	Deadline    string   `json:"deadline"`

	ScheduleTaskId string  `json:"scheduleTaskId"`
	TaskBatch      int64   `json:"taskBatch"`
	TaskOrder      int64   `json:"taskOrder"`
	StopTime       float64 `json:"stopTime"`

	ProjectId          string `json:"projectId"`
	ProjectName        string `json:"projectName"`
	ProjectColor       string `json:"projectColor"`
	ProjectStatus      string `json:"projectStatus"`
	ProjectDescription string `json:"projectDescription"`

	GroupTaskId          string   `json:"groupTaskId"`
	GroupTaskTitle       string   `json:"groupTaskTitle"`
	GroupTaskDescription string   `json:"groupTaskDescription"`
	GroupTaskPriority    []string `json:"groupTaskPriority"`
	GroupTaskStatus      string   `json:"groupTaskStatus"`

	TotalTasks     int64 `json:"totalTasks"`
	CompletedTasks int64 `json:"completedTasks"`
}

func NewTaskDetailResponseDTO() *TaskDetailResponseDTO {
	return &TaskDetailResponseDTO{}
}

func (in *TaskDetailResponseDTO) MapperTaskDetail(response interface{}) TaskDetailResponseDTO {
	var out TaskDetailResponseDTO
	responseMap := response.(map[string]interface{})
	responseData := responseMap["response"].(map[string]interface{})
	taskDetail := responseData["taskDetail"].(map[string]interface{})
	var task = taskDetail["task"].(map[string]interface{})
	scheduleTaskData := taskDetail["scheduleTask"].(map[string]interface{})
	var scheduleTask = scheduleTaskData["data"].(map[string]interface{})["scheduleTask"].(map[string]interface{})
	var project = responseData["project"].(map[string]interface{})
	var groupTask = responseData["groupTask"].(map[string]interface{})

	out.Title = task["title"].(string)
	if task["description"] == nil {
		out.Description = ""
	} else {
		out.Description = task["description"].(string)
	}
	out.Priority = utils.ConvertStringToStringArray(task["priority"].([]interface{}))
	out.Status = task["status"].(string)
	out.Duration = task["duration"].(float64)
	out.StartDate = task["startDate"].(string)
	out.Deadline = task["deadline"].(string)

	out.ScheduleTaskId = scheduleTask["_id"].(string)
	if scheduleTask["taskBatch"] != nil {
		out.TaskBatch = int64(scheduleTask["taskBatch"].(float64))
	}
	if scheduleTask["taskOrder"] != nil {
		out.TaskOrder = int64(scheduleTask["taskOrder"].(float64))
	}
	if scheduleTask["stopTime"] != nil {
		out.StopTime = scheduleTask["stopTime"].(float64)
	}

	out.ProjectId = project["_id"].(string)
	out.ProjectName = project["name"].(string)
	out.ProjectColor = project["color"].(string)
	out.ProjectStatus = project["status"].(string)
	out.ProjectDescription = project["description"].(string)

	out.GroupTaskId = groupTask["_id"].(string)
	out.GroupTaskTitle = groupTask["title"].(string)
	out.GroupTaskDescription = groupTask["description"].(string)
	out.GroupTaskPriority = utils.ConvertStringToStringArray(groupTask["priority"].([]interface{}))
	out.GroupTaskStatus = groupTask["status"].(string)
	out.TotalTasks = int64(groupTask["totalTasks"].(float64))
	out.CompletedTasks = int64(groupTask["completedTasks"].(float64))
	return out
}

type CountDoneTaskListDTO struct {
	GroupTaskId string  `json:"groupTaskId"`
	Count       float64 `json:"count"`
	ProjectId   string  `json:"projectId"`
	Name        string  `json:"name"`
}

func NewCountDoneTaskListDTO() *CountDoneTaskListDTO {
	return &CountDoneTaskListDTO{}
}
