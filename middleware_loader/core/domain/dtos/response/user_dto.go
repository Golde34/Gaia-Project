package response_dtos

import "middleware_loader/infrastructure/graph/model"

type UserDTO struct {
	ID         float64       `json:"id"`
	Name       string        `json:"name"`
	Username   string        `json:"username"`
	Email      string        `json:"email"`
	Password   string        `json:"password"`
	LastLogin  string        `json:"lastLogin"`
	Enabled    bool          `json:"enabled"`
	IsUsing2fa bool          `json:"isUsing2FA"`
	Secret     string        `json:"secret"`
	Roles      []interface{} `json:"roles"`
}

func NewUserDTO() *UserDTO {
	return &UserDTO{}
}

func (in *UserDTO) UserMapperToGraphQLModel(input UserDTO) model.UpdateUser {
	var out model.UpdateUser
	out.ID = input.ID
	out.Name = input.Name
	out.Username = input.Username
	return out
}

func (in *UserDTO) MapperToGraphQLModel(input UserDTO) model.ListAllUsers {
	var out model.ListAllUsers
	out.ID = input.ID
	out.Name = input.Name
	out.Username = input.Username
	out.Email = input.Email
	out.LastLogin = input.LastLogin
	out.Roles = convertRoleName(input.Roles) // Convert []interface{} to []*model.Role
	return out
}

func convertRoleNameToModelRoles(roles []interface{}) []*model.Role {
	var out []*model.Role
	for _, role := range roles {
		roleMap := role.(map[string]interface{})
		roleName := roleMap["name"].(string)
		out = append(out, &model.Role{Name: roleName})
	}
	return out
}

func convertRoleName(roles []interface{}) []string {
	var out []string
	for _, role := range roles {
		roleMap := role.(map[string]interface{})
		roleName := roleMap["name"].(string)
		out = append(out, roleName)
	}
	return out
}

func (in *UserDTO) MapperListToGraphQLModel(input []UserDTO) []model.ListAllUsers {
	var out []model.ListAllUsers
	for _, item := range input {
		out = append(out, in.MapperToGraphQLModel(item))
	}
	return out
}

type UserDetailDTO struct {
	ID         float64       `json:"id"`
	Name       string        `json:"name"`
	Username   string        `json:"username"`
	Email      string        `json:"email"`
	Password   string        `json:"password"`
	LastLogin  string        `json:"lastLogin"`
	Enabled    bool          `json:"enabled"`
	IsUsing2fa bool          `json:"isUsing2FA"`
	Secret     string        `json:"secret"`
	Roles      []interface{} `json:"roles"`

	UserSetting *UserSettingDTO `json:"userSetting"`
}
type UserSettingDTO struct {
	OptimizedTaskConfig  float64 `json:"optimizedTaskConfig"`
	PrivateProfileConfig float64 `json:"privateProfileConfig"`
	TaskSortingAlgorithm float64 `json:"taskSortingAlgorithm"`
}

func NewUserDetailDTO() *UserDetailDTO {
	return &UserDetailDTO{}
}

func (in *UserDetailDTO) MapperToGraphQLModelDetail(input UserDetailDTO) model.UpdateUser {
	var out model.UpdateUser
	out.ID = input.ID
	out.Name = input.Name
	out.Username = input.Username
	out.Email = input.Email
	out.LastLogin = input.LastLogin
	out.Roles = convertRoleNameToModelRoles(input.Roles) 
	out.UserSetting = &model.UserSetting{
		OptimizedTaskConfig:  input.UserSetting.OptimizedTaskConfig,
		PrivateProfileConfig: input.UserSetting.PrivateProfileConfig,
		TaskSortingAlgorithm: input.UserSetting.TaskSortingAlgorithm,
	}
	return out
}
