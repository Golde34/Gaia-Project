// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type AuthToken struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Name         string `json:"name"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	LastLogin    string `json:"lastLogin"`
}

type SigninInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Enabled    bool   `json:"enabled"`
	IsUsing2fa bool   `json:"isUsing2FA"`
	Secret     string `json:"secret"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}