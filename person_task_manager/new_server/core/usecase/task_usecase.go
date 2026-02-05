package usecase

type TaskUsecase struct {
}

func NewTaskUsecase() *TaskUsecase {
	return &TaskUsecase{}
}

func (tu *TaskUsecase) CreateTask(title string, description string) error {
	// Implement the logic to create a task
	return nil
}