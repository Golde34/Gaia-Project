package base

import "notify_agent/kernel/configs"

var config = configs.Config{}
var env, _ = config.LoadEnv()
var AuthServiceURL = env.Url + env.AuthServicePort
