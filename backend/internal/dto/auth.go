package dto

type ReqisterRequest struct {
	Name				string
	Email				string
	Password			string
	ConfirmPassword 	string
}


type LoginRequest struct {
	Email 		string
	Password 	string
}

type UserResponse struct{
	ID 			uint
	Name 		string
	Email 		string
	Role 		string
}

type AuthResponse struct {
	AccessToken 	string
	RefreshToken	string
	User 			UserResponse
}

type RegisterResponse struct {
	User UserResponse
}