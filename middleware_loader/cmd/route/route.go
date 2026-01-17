package route

import (
	gaia_connector "middleware_loader/core/services/gaia_connector"
	auth_services "middleware_loader/core/services/auth_services"
	task_manager "middleware_loader/core/services/task_manager"
	work_optim "middleware_loader/core/services/work_optimization"
	contribution_tracker "middleware_loader/core/services/contribution_tracker"
	notify_agent "middleware_loader/core/services/notify_agent"
	"middleware_loader/infrastructure/graph"
	database_mongo "middleware_loader/kernel/database/mongo"
	auth_router "middleware_loader/ui/routers/auth_service"
	gaia_router "middleware_loader/ui/routers/gaia_connector"
	middleware_router "middleware_loader/ui/routers/middleware_service"
	task_router "middleware_loader/ui/routers/task_manager"
	work_optim_router "middleware_loader/ui/routers/work_optimization"
	schedule_plan_router "middleware_loader/ui/routers/schedule_plan"
	contribution_tracker_router "middleware_loader/ui/routers/contribution_tracker"
	notification_router "middleware_loader/ui/routers/notify_agent"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux, db database_mongo.Database) {

	// SERVICES
	authService := auth_services.NewAuthService()
	userService := auth_services.NewUserService()
	roleService := auth_services.NewRoleService()
	privilegeService := auth_services.NewPrivilegeService()
	gaiaService := gaia_connector.NewGaiaService()
	taskService := task_manager.NewTaskService()
	projectService := task_manager.NewProjectService()
	groupTaskService := task_manager.NewGroupTaskService()
	taskRegisterService := work_optim.NewTaskRegisterService()
	noteService := task_manager.NewNoteService()
	taskOptimizationService := work_optim.NewTaskOptimizationService()
	userGithubService := contribution_tracker.NewUserGithubService()
	contributionService := contribution_tracker.NewContributionService()
	notificationService := notify_agent.NewNotificationService()

	// GRAPHQL FEDERATION
	router.Handle("/graphql", playground.Handler("GraphQL playground", "/graphql-query"))
	router.Handle("/graphql-query", handler.NewDefaultServer(
		graph.NewExecutableSchema(
			graph.Config{
				Resolvers: &graph.Resolver{
					AuthGraphQLService:    authService,
					UserGraphQLService:    userService,
					RoleGraphQLService:    roleService,
					PrivilegeGraphQLService: privilegeService,
					TaskGraphQLService:    taskService,
					ProjectGraphQLService: projectService,
					GroupTaskGraphQLService: groupTaskService,
					TaskRegisterGraphQLService: taskRegisterService,
					NoteGraphQLService: noteService,
				},
			},
		),
	))

	// ROUTERS
	router.Group(func(r chi.Router) {
		middleware_router.NewMicroserviceRouter(db, router)
		middleware_router.NewURLPermissionRouter(db, router)
		middleware_router.NewUserApiQuotaRouter(db, router)
	})

	router.Group(func(r chi.Router) {
		auth_router.NewAuthRouter(authService, db, router)
		auth_router.NewUserRouter(userService, db, router)
		auth_router.NewRoleRouter(roleService, db, router)
		auth_router.NewPrivilegeRouter(privilegeService, db, router)
	})

	gaia_router.NewGaiaRouter(gaiaService, db, router)
	
	router.Group(func(r chi.Router) {
		task_router.NewProjectRouter(projectService, db, router)
		task_router.NewTaskRouter(taskService, db, router)
		task_router.NewGroupTaskRouter(groupTaskService, db, router)
		task_router.NewNoteRouter(noteService, db, router)
	})

	router.Group(func(r chi.Router) {
		work_optim_router.NewTaskRegistrationRouter(taskRegisterService, db, router)
		work_optim_router.NewTaskOptimizationRouter(taskOptimizationService, db, router)
	})

	router.Group(func(r chi.Router) {
		schedule_plan_router.NewScheduleTaskRouter(router)
	})

	router.Group(func (r chi.Router) {
		contribution_tracker_router.NewUserGithubRouter(userGithubService, router)
		contribution_tracker_router.NewContributionRouter(contributionService, router)
	})

	router.Group(func(r chi.Router) {
		notification_router.NewNotificationRouter(notificationService, router)
	})
}
