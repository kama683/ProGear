package model

import "time"

type CreateUser struct {
	Name 			string
	Email			string
	PasswordHash	string
	Role			string
	IsActive		string
}

type User struct {
	ID 				uint
	Name 			string
	Email			string
	PasswordHash 	string
	Role			string
	IsActive		bool
	LastLoggedIn	*time.Time
	CreatedAt		time.Time
	UpdatedAt		time.Time
}