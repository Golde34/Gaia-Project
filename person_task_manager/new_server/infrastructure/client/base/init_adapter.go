package base

import "personal_task_manager/kernel/configs"


var config = configs.Config{}
var env, _ = config.LoadEnv()
var AuthServiceURL = env.Url + env.AuthServiceURL
var SchedulePlanServiceURL = env.Url + env.SchedulePlanServiceURL
