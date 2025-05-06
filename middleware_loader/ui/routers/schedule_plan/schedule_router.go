package routers

import (
	services "middleware_loader/core/services/schedule_plan"
	controller_services "middleware_loader/ui/controller_services/schedule_plan"
	"net/http"

	"github.com/go-chi/chi"
)

type ScheduleTaskRouter struct {
	ScheduleTaskService *services.ScheduleTaskService
}

func NewScheduleTaskRouter(scheduleTaskService *services.ScheduleTaskService, r *chi.Mux) *ScheduleTaskRouter {
	r.Route("/schedule-task", func(r chi.Router) {
		r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetScheduleTaskListByUserId(w, r, scheduleTaskService)
		})
		r.Get("/task-batch-list", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetTaskBatchListByUserId(w, r, scheduleTaskService)
		})
		r.Post("/choose-task-batch", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ChooseTaskBatch(w, r, scheduleTaskService)
		})
		r.Get("/active-task-batch", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetActiveTaskBatch(w, r, scheduleTaskService)
		})
	})
	r.Route("/schedule-group", func(r chi.Router) {
		r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
			controller_services.CreateScheduleGroup(w, r, scheduleTaskService)
		})
		r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListScheduleGroupByUserId(w, r, scheduleTaskService)
		})
		r.Delete("/delete/{scheduleGroupId}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.DeleteScheduleGroup(w, r, scheduleTaskService)
		})
	})
	return &ScheduleTaskRouter{
		ScheduleTaskService: scheduleTaskService,
	}
}
