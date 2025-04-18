package bootstrap

import database_mongo "notify_agent/kernel/database/mongo"


type Application struct {
	Env   *Env
	Mongo database_mongo.Client
}

func App() Application {
	app := &Application{}
	app.Env = NewEnv()
	app.Mongo = NewMongoDatabase(app.Env)
	return *app
}

func (app *Application) CloseDBConnection() {
	CloseMongoDBConnection(app.Mongo)
}