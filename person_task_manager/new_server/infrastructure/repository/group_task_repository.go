package repository

import (
	"database/sql"
	"personal_task_manager/core/domain/entities"
	base_repo "personal_task_manager/infrastructure/repository/base"
)

type GroupTaskRepository struct {
	DB *sql.DB

	base *base_repo.DB
}

func NewGroupTaskRepository(db *sql.DB) *GroupTaskRepository {
	return &GroupTaskRepository{
		DB:   db,
		base: base_repo.NewDB(db),
	}
}

var (
	GroupTaskTableName = "group_tasks"
)

func (r *GroupTaskRepository) GetAllGroupTasksInProject(projectID string) ([]entities.GroupTaskEntity, error) {
	where := map[string]interface{}{
		"project_id": projectID,
	}

	columns := base_repo.GetStructColumns(entities.GroupTaskEntity{})
	results, err := r.base.SelectDB(
		r.DB,
		GroupTaskTableName,
		columns,
		where)
	if err != nil {
		return nil, err
	}

	var groupTasks []entities.GroupTaskEntity
	for _, row := range results {
		groupTask := entities.NewGroupTask(row)
		groupTasks = append(groupTasks, *groupTask)
	}
	
	return groupTasks, nil
}
