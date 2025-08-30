package base

import "chat_hub/kernel/configs"

var config = configs.Config{}
var env, _ = config.LoadEnv()
var AuthServiceURL = env.Url + env.AuthServicePort
var LLMCoreServiceURL = env.Url + env.LLMCoreServicePort
var SchedulePlanURL = env.Url + env.SchedulePlanServicePort
