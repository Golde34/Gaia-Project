package services

import (
	"context"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/port/store"
	"middleware_loader/kernel/utils"
	"time"
)

type ScreenConfigurationService struct {
	Store store.ScreenConfigurationStore
}

func NewScreenConfigurationService(store store.ScreenConfigurationStore) *ScreenConfigurationService {
	return &ScreenConfigurationService{store}
}

func (s *ScreenConfigurationService) GetGaiaScreens() (base_dtos.ErrorResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	screens, err := s.Store.GetAllScreens(ctx)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}

	return utils.ReturnSuccessResponse("Get all screens successfully", screens), nil	
}

func (s *ScreenConfigurationService) InsertScreen(body map[string]interface{}) (base_dtos.ErrorResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	screen, err := s.Store.InsertScreen(ctx, body)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}

	return utils.ReturnSuccessResponse("Insert screen successfully", screen), nil
}
