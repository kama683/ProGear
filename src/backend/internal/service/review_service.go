package service

import (
	"database/sql"
	"errors"
	"fmt"
	"rental/internal/dto"
)

type ReviewService interface {
	Create(equipmentID, userID uint, req dto.ReviewCreateRequest) (dto.ReviewResponse, error)
	List(equipmentID uint) (dto.ReviewSummary, error)
}

type reviewService struct {
	db *sql.DB
}

func NewReviewService(db *sql.DB) ReviewService {
	return &reviewService{db: db}
}

func (s *reviewService) Create(equipmentID, userID uint, req dto.ReviewCreateRequest) (dto.ReviewResponse, error) {
	if req.Rating < 1 || req.Rating > 5 {
		return dto.ReviewResponse{}, errors.New("rating must be between 1 and 5")
	}

	// only users who have a completed/returned order for this equipment can review
	var eligible bool
	err := s.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM order_items oi
			JOIN orders o ON o.id = oi.order_id
			WHERE oi.equipment_id = $1 AND o.user_id = $2
			  AND o.status IN ('returned','completed')
		)
	`, equipmentID, userID).Scan(&eligible)
	if err != nil {
		return dto.ReviewResponse{}, fmt.Errorf("check eligibility: %w", err)
	}
	if !eligible {
		return dto.ReviewResponse{}, errors.New("you can only review equipment you have rented and returned")
	}

	var rev dto.ReviewResponse
	err = s.db.QueryRow(`
		INSERT INTO equipment_reviews(equipment_id, user_id, rating, comment)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (equipment_id, user_id)
		DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
		RETURNING id, equipment_id, user_id, rating, comment, created_at
	`, equipmentID, userID, req.Rating, req.Comment).Scan(
		&rev.ID, &rev.EquipmentID, &rev.UserID, &rev.Rating, &rev.Comment, &rev.CreatedAt,
	)
	if err != nil {
		return dto.ReviewResponse{}, fmt.Errorf("insert review: %w", err)
	}

	s.db.QueryRow(`SELECT name FROM users WHERE id = $1`, userID).Scan(&rev.UserName)
	return rev, nil
}

func (s *reviewService) List(equipmentID uint) (dto.ReviewSummary, error) {
	rows, err := s.db.Query(`
		SELECT r.id, r.equipment_id, r.user_id, u.name, r.rating, r.comment, r.created_at
		FROM equipment_reviews r
		JOIN users u ON u.id = r.user_id
		WHERE r.equipment_id = $1
		ORDER BY r.created_at DESC
	`, equipmentID)
	if err != nil {
		return dto.ReviewSummary{}, fmt.Errorf("list reviews: %w", err)
	}
	defer rows.Close()

	var reviews []dto.ReviewResponse
	var totalRating int
	for rows.Next() {
		var r dto.ReviewResponse
		if err := rows.Scan(&r.ID, &r.EquipmentID, &r.UserID, &r.UserName, &r.Rating, &r.Comment, &r.CreatedAt); err != nil {
			continue
		}
		reviews = append(reviews, r)
		totalRating += r.Rating
	}

	summary := dto.ReviewSummary{Reviews: reviews, TotalReviews: len(reviews)}
	if len(reviews) > 0 {
		summary.AverageRating = float64(totalRating) / float64(len(reviews))
	}
	return summary, nil
}
