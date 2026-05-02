package dto


type MyResponse struct {
	ID 			uint
	Name		string
	Email		string
	Role		string
	Phone		string
	Address		string
}

type UpdateProfileRequest struct {
	Phone   string
	Address string
}
