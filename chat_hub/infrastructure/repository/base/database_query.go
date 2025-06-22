package base_repo 

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
)

type DB struct {
	db *sql.DB
}

func NewDB(db *sql.DB) *DB {
    return &DB{
        db: db,
    }
}

func (s *DB) InsertDB(tableName string, columns []string, values []interface{}) (string, error) {
	query := fmt.Sprintf(
        "INSERT INTO %s (%s) VALUES (%s) RETURNING id;",
        tableName, joinColumns(columns), placeholders(len(values)),
    )

    var id string
    err := s.db.QueryRow(query, values...).Scan(&id)
    if err != nil {
        return "", err
    }
    return id, nil
}

func (s *DB) SelectDB(db *sql.DB, tableName string, columns []string, where map[string]interface{}) ([]map[string]interface{}, error) {
    wheres := []string{}
    args := []interface{}{}
    i := 1
    for k, v := range where {
        wheres = append(wheres, fmt.Sprintf("%s = $%d", k, i))
        args = append(args, v)
        i++
    }
    whereSQL := ""
    if len(wheres) > 0 {
        whereSQL = " WHERE " + strings.Join(wheres, " AND ")
    }
    query := fmt.Sprintf("SELECT %s FROM %s%s;", joinColumns(columns), tableName, whereSQL)

    rows, err := s.db.Query(query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []map[string]interface{}{}
    cols, _ := rows.Columns()
    for rows.Next() {
        vals := make([]interface{}, len(cols))
        ptrs := make([]interface{}, len(cols))
        for i := range vals {
            ptrs[i] = &vals[i]
        }
        rows.Scan(ptrs...)
        m := map[string]interface{}{}
        for i, col := range cols {
            m[col] = vals[i]
        }
        result = append(result, m)
    }
    return result, nil
}

func (s *DB) UpdateDB(db *sql.DB, tableName string, updates map[string]interface{}, where map[string]interface{}) (int64, error) {
    setStmts := []string{}
    args := []interface{}{}
    i := 1
    for k, v := range updates {
        setStmts = append(setStmts, fmt.Sprintf("%s = $%d", k, i))
        args = append(args, v)
        i++
    }
    whereStmts := []string{}
    for k, v := range where {
        whereStmts = append(whereStmts, fmt.Sprintf("%s = $%d", k, i))
        args = append(args, v)
        i++
    }
    setSQL := strings.Join(setStmts, ", ")
    whereSQL := ""
    if len(whereStmts) > 0 {
        whereSQL = " WHERE " + strings.Join(whereStmts, " AND ")
    }
    query := fmt.Sprintf("UPDATE %s SET %s%s;", tableName, setSQL, whereSQL)
    res, err := s.db.Exec(query, args...)
    if err != nil {
        return 0, err
    }
    rowsAffected, _ := res.RowsAffected()
    return rowsAffected, nil
}

func (s *DB) DeleteDB(db *sql.DB, tableName string, where map[string]interface{}) (int64, error) {
    whereStmts := []string{}
    args := []interface{}{}
    i := 1
    for k, v := range where {
        whereStmts = append(whereStmts, fmt.Sprintf("%s = $%d", k, i))
        args = append(args, v)
        i++
    }
    whereSQL := ""
    if len(whereStmts) > 0 {
        whereSQL = " WHERE " + strings.Join(whereStmts, " AND ")
    }
    query := fmt.Sprintf("DELETE FROM %s%s;", tableName, whereSQL)
    res, err := s.db.Exec(query, args...)
    if err != nil {
        return 0, err
    }
    rowsAffected, _ := res.RowsAffected()
    return rowsAffected, nil
}

type PageParam struct {
	Limit int
	Offset int
}

func (s *DB) SelectDBByPagination(
    db *sql.DB,
    tableName string,
    columns []string,
    where map[string]interface{},
    page *PageParam, 
) ([]map[string]interface{}, error) {
    wheres := []string{}
    args := []interface{}{}
    i := 1
    for k, v := range where {
        wheres = append(wheres, fmt.Sprintf("%s = $%d", k, i))
        args = append(args, v)
        i++
    }
    whereSQL := ""
    if len(wheres) > 0 {
        whereSQL = " WHERE " + strings.Join(wheres, " AND ")
    }
    query := fmt.Sprintf("SELECT %s FROM %s%s", joinColumns(columns), tableName, whereSQL)

    if page != nil && page.Limit > 0 {
        query += fmt.Sprintf(" LIMIT $%d", i)
        args = append(args, page.Limit)
        i++
        if page.Offset > 0 {
            query += fmt.Sprintf(" OFFSET $%d", i)
            args = append(args, page.Offset)
        }
    }
    query += ";"

    rows, err := s.db.Query(query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []map[string]interface{}{}
    cols, _ := rows.Columns()
    for rows.Next() {
        vals := make([]interface{}, len(cols))
        ptrs := make([]interface{}, len(cols))
        for i := range vals {
            ptrs[i] = &vals[i]
        }
        rows.Scan(ptrs...)
        m := map[string]interface{}{}
        for i, col := range cols {
            m[col] = vals[i]
        }
        result = append(result, m)
    }
    return result, nil
}

func joinColumns(columns []string) string {
	return strings.Join(columns, ", ")
}

func placeholders(n int) string {
	placeholders := make([]string, n)
	for i := range placeholders {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}
	return strings.Join(placeholders, ", ")
}