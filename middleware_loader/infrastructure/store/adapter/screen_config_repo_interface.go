package store_adapter

import (
	"context"
	"middleware_loader/core/domain/entity"
)

type IScreenConfigurationRepository interface {
	GetAllScreens(context context.Context) ([]entity.ScreenConfiguration, error)
}