package base

import "middleware_loader/kernel/configs"

var config = configs.Config{}
var env, _ = config.LoadEnv()
var TaskManagerServiceURL = env.Url + env.TaskManagerPort
var AuthServiceURL = env.Url + env.AuthServicePort
var GaiaServiceURL = env.Url + env.GaiaPort
var ClientURL = env.ClientCORSAllowedUrl
var WorkOptimizationServiceURL = env.Url + env.WorkOptimServicePort
var SchedulePlanServiceURL = env.Url + env.SchedulePlanServicePort
var ContributionTrackerURL = env.Url + env.ContributionTrackerServicePort
var NotifyAgentURL = env.Url + env.NotifyAgentServicePort
