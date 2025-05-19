package routers

import (
	services "middleware_loader/core/services/schedule_plan"
	controller_services "middleware_loader/ui/controller_services/schedule_plan"
	"net/http"

	"github.com/go-chi/chi"
)

type ScheduleCalendarRouter struct {
	ScheduleCalendarService *services.ScheduleCalendarService
}

func NewScheduleCalendarRouter(scheduleCalendarService *services.ScheduleCalendarService, r *chi.Mux) *ScheduleCalendarRouter {
	r.Route("/schedule-calendar", func(r chi.Router) {
		r.Get("/daily-tasks", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetUserDailyTasks(w, r, scheduleCalendarService)
		})
	})
	return &ScheduleCalendarRouter{
		ScheduleCalendarService: scheduleCalendarService,
	}
}