package routers

import (
	services "middleware_loader/core/services/schedule_plan"
	controller_services "middleware_loader/ui/controller_services/schedule_plan"
	"net/http"

	"github.com/go-chi/chi"
)

type ScheduleTaskRouter struct {
	ScheduleTaskService *services.ScheduleTaskService
	ScheduleGroupService *services.ScheduleGroupService
	ScheduleCalendarService *services.ScheduleCalendarService
}

func NewScheduleTaskRouter(r *chi.Mux) *ScheduleTaskRouter {
	scheduleTaskService := services.NewScheduleTaskService()
	scheduleGroupService := services.NewScheduleGroupService()
	scheduleCalendarService := services.NewScheduleCalendarService()

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
			controller_services.CreateScheduleGroup(w, r, scheduleGroupService)
		})
		r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListScheduleGroupByUserId(w, r, scheduleGroupService)
		})
		r.Delete("/delete/{scheduleGroupId}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.DeleteScheduleGroup(w, r, scheduleGroupService)
		})
	})
	r.Route("/schedule-calendar", func(r chi.Router) {
		r.Get("/time-bubble-config", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetTimeBubbleConfig(w, r, scheduleCalendarService)
		})
		r.Post("/register", func(w http.ResponseWriter, r *http.Request) {
			controller_services.RegisterScheduleCalendar(w, r, scheduleCalendarService)
		})
		r.Post("/generate-daily-calendar", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GenerateDailyCalendar(w, r, scheduleCalendarService)
		})
		r.Get("/daily-tasks", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetUserDailyTasks(w, r, scheduleCalendarService)
		})
		r.Post("/edit-time-bubble", func(w http.ResponseWriter, r *http.Request) {
			controller_services.EditTimeBubble(w, r, scheduleCalendarService)
		})
	})
	return &ScheduleTaskRouter{
		ScheduleTaskService: scheduleTaskService,
		ScheduleGroupService: scheduleGroupService,
		ScheduleCalendarService: scheduleCalendarService,
	}
}
