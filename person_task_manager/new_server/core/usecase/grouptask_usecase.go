package usecase

type GroupTaskUsecase struct {
}

func NewGroupTaskUsecase() *GroupTaskUsecase {
	return &GroupTaskUsecase{}
}

func (gtu *GroupTaskUsecase) CreateGroupTask(name string, description string) error {
	// Implement the logic to create a group task
	return nil
}
