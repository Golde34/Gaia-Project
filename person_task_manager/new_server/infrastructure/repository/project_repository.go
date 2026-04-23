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
	_, err := r.base.InsertDB(ProjectTableName, columns, values)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	return project, nil
}

func (r *ProjectRepository) GetProjectByID(id string) (entities.ProjectEntity, error) {
	where := map[string]interface{}{
		"id": id,
	}

	columns := base_repo.GetStructColumns(entities.ProjectEntity{})
	results, err := r.base.SelectDB(
		r.DB,
		ProjectTableName,
		columns,
		where)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	if len(results) == 0 {
		return entities.ProjectEntity{}, sql.ErrNoRows
	}

	project := entities.NewProject(results[0])
	return *project, nil
}

func (r *ProjectRepository) GetAllProjectsByUserID(userId int) ([]entities.ProjectEntity, error) {
	where := map[string]interface{}{
		"user_id": userId,
	}

	columns := base_repo.GetStructColumns(entities.ProjectEntity{})
	results, err := r.base.SelectDB(
		r.DB,
		ProjectTableName,
		columns,
		where)
	if err != nil {
		return nil, err
	}

	var projects []entities.ProjectEntity
	for _, row := range results {
		project := entities.NewProject(row)
		projects = append(projects, *project)
	}

	return projects, nil
}

func (r *ProjectRepository) UpdateProject(id string, project entities.ProjectEntity) (entities.ProjectEntity, error) {
	columns, values := base_repo.StructToColumnsAndValues(project)
	log.Println("Updating project in database with columns:", columns, "and values:", values)
	updateData := make(map[string]interface{})
	for i, col := range columns {
		updateData[col] = values[i]
	}
	where := map[string]interface{}{
		"id": id,
	}
	_, err := r.base.UpdateDB(r.DB, ProjectTableName, updateData, where)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	return project, nil
}

func (r *ProjectRepository) DeleteProject(id string) error {
	where := map[string]interface{}{
		"id": id,
	}
	_, err := r.base.DeleteDB(r.DB, ProjectTableName, where)
	return err
}

func (r *ProjectRepository) UpdateProjectName(id, name string) (entities.ProjectEntity, error) {
	updateData := map[string]interface{}{
		"name": name,
	}
	where := map[string]interface{}{
		"id": id,
	}
	record, err := r.base.UpdateDB(r.DB, ProjectTableName, updateData, where)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	if record == 0 {
		return entities.ProjectEntity{}, sql.ErrNoRows
	}

	return r.GetProjectByID(id)
}

func (r *ProjectRepository) UpdateProjectColor(id, color string) (entities.ProjectEntity, error) {
	updateData := map[string]interface{}{
		"color": color,
	}
	where := map[string]interface{}{
		"id": id,
	}
	record, err := r.base.UpdateDB(r.DB, ProjectTableName, updateData, where)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	if record == 0 {
		return entities.ProjectEntity{}, sql.ErrNoRows
	}

	return r.GetProjectByID(id)
}
