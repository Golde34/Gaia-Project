package repository

import (
	"database/sql"
	"log"
	"personal_task_manager/core/domain/entities"
	base_repo "personal_task_manager/infrastructure/repository/base"
)

type ProjectRepository struct {
	DB *sql.DB

	base *base_repo.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{
		DB:   db,
		base: base_repo.NewDB(db),
	}
}

var (
	ProjectTableName = "projects"
)

func (r *ProjectRepository) CreateProject(project entities.ProjectEntity) (entities.ProjectEntity, error) {
	columns, values := base_repo.StructToColumnsAndValues(project)
	log.Println("Inserting project into database with columns:", columns, "and values:", values)
	id, err := r.base.InsertDB(ProjectTableName, columns, values)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	project.ID = id
	return project, nil
}

func (r *ProjectRepository) GetProjectByID(id int) (entities.ProjectEntity, error) {
	where := map[string]interface{}{
		"id": id,
	}
	results, err := r.base.SelectDB(
		r.DB, 
		ProjectTableName, 
		[]string{"id", "name", "description", "user_id", "color", "status", "active_status"}, 
		where)	
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	if len(results) == 0 {
		return entities.ProjectEntity{}, sql.ErrNoRows
	}
	
	result := results[0]
	project := entities.ProjectEntity{
		ID:           result["id"].(string),
		Name:         result["name"].(string),
		Description:  result["description"].(string),
		UserID:       int(result["user_id"].(float64)),
		Color:        result["color"].(string),
		Status:       result["status"].(string),
		ActiveStatus: result["active_status"].(string),
	}
	return project, nil
}
