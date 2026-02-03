package usecase

type ProjectUsecase struct {
}

func NewProjectUsecase() *ProjectUsecase {
	return &ProjectUsecase{}
}

func (pu *ProjectUsecase) CreateProject(name string, description string) error {
	// Implement the logic to create a project
	return nil
}