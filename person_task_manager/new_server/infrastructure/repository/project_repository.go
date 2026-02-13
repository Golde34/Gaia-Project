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

func (r *ProjectRepository) GetProjectByID(id int) (string, error) {
	// Implementation for retrieving a project by ID from the database
	return "Project Name", nil
}
