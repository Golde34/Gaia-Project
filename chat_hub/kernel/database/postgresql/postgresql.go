package database_postgresql

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func ConnectDB(host, port, user, password, dbname string) error {
	databaseURI := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	pgDB, err := sql.Open("postgres", databaseURI)
	if err != nil {
		log.Fatal(err)
	}
	defer pgDB.Close()

	err = pgDB.Ping()
	if err != nil {
		log.Fatal(err)
	}

	return nil
}
