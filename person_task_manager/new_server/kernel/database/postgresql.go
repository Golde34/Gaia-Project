package database_postgresql

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func ConnectDB(host, port, user, password, dbname string) (*sql.DB, error) {
	databaseURI := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	pgDB, err := sql.Open("postgres", databaseURI)
	if err != nil {
		return nil, err
	}

	err = pgDB.Ping()
	if err != nil {
		return nil, err
	}

	return pgDB, nil 
}