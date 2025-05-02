package routers

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/task_manager"
	database_mongo "middleware_loader/kernel/database/mongo"
	controller_services "middleware_loader/ui/controller_services/task_manager"
	"net/http"

	"github.com/go-chi/chi"
)

type TaskRouter struct {
	TaskService *services.TaskService
}

func NewTaskRouter(taskService *services.TaskService, db database_mongo.Database, r *chi.Mux) *TaskRouter {
	r.Route("/task", func(r chi.Router) {
		r.Use(middleware.CheckMicroserviceStatus(db, enums.TASK_MANAGER))
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListAllTasks(w, r, taskService)
		})
		r.Get("/top-tasks/{userId}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListTopTasks(w, r, taskService)
		})
		r.Get("/done-tasks/{userId}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListDoneTasks(w, r, taskService)
		})
		r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetTaskById(w, r, taskService)
		})
		r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
			controller_services.CreateTask(w, r, taskService)
		})
		r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateTask(w, r, taskService)
		})
		r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.DeleteTask(w, r, taskService)
		})
		r.Get("/{id}/sub-tasks", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetSubTasksByTaskId(w, r, taskService)
		})
		r.Get("/{id}/comments", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetCommentsByTaskId(w, r, taskService)
		})
		r.Post("/generate", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GenerateTaskWithoutGroupTask(w, r, taskService)
		})
		r.Put("/{id}/update-task-in-dialog", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateTaskInDialog(w, r, taskService)
		})
		r.Put("/{id}/move-task", func(w http.ResponseWriter, r *http.Request) {
			controller_services.MoveTask(w, r, taskService)
		})
		r.Put("/{id}/archive", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ArchiveTask(w, r, taskService)
		})
		r.Put("/{id}/enable", func(w http.ResponseWriter, r *http.Request) {
			controller_services.Enable(w, r, taskService)
		})
		r.Post("/{id}/detail", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetTaskDetail(w, r, taskService)
		})
	})
	return &TaskRouter{
		TaskService: taskService,
	}
}
