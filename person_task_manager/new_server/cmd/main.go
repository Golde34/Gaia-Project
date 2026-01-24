package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"

)

func main() {
	// Kafka Initialization
	

	// Server Initialization
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Timeout(time.Second * 60))

	// DATABASE

	// Defines system routers and middlewares

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", "3000")
	log.Fatal(http.ListenAndServe(":3000", r))
}
