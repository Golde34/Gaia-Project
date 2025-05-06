package routers

import (
	services "middleware_loader/core/services/contribution_tracker"
	controller_services "middleware_loader/ui/controller_services/contribution_tracker"
	"net/http"

	"github.com/go-chi/chi"
)

type ContributionRouter struct {
	ContributionService *services.ContributionService
}

func NewContributionRouter(contributionService *services.ContributionService, r *chi.Mux) *ContributionRouter {
	r.Route("/contribution", func(r chi.Router) {
		r.Get("/display-chart", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetUserContribution(w, r, contributionService)
		})
		r.Get("/compare-commits", func(w http.ResponseWriter, r *http.Request) {
			controller_services.CompareCommits(w, r, contributionService)
		})
		r.Get("/{projectId}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetUserProjectContribution(w, r, contributionService)
		})
	})
	return &ContributionRouter{
		ContributionService: contributionService,
	}
}