package service

import (
	"database/sql"
	"fmt"
	"rental/internal/dto"
	"strings"
)

type EquipmentService interface {
	List(filterType, category string) ([]dto.EquipmentResponse, error)
	GetByID(id uint) (dto.EquipmentDetailResponse, error)
	Create(req dto.EquipmentCreateRequest) (dto.EquipmentResponse, error)
	Update(id uint, req dto.EquipmentUpdateRequest) (dto.EquipmentResponse, error)
}

type equipmentService struct {
	db *sql.DB
}

func NewEquipmentService(db *sql.DB) EquipmentService {
	return &equipmentService{db: db}
}

func (s *equipmentService) List(filterType, category string) ([]dto.EquipmentResponse, error) {
	query := `
		SELECT id, name, category, description, type, daily_rate, sale_price, quantity, created_at, updated_at
		FROM equipment
		WHERE ($1 = '' OR type = $1)
		AND ($2 = '' OR category = $2)
		ORDER BY id DESC
	`
	rows, err := s.db.Query(query, strings.TrimSpace(filterType), strings.TrimSpace(category))
	if err != nil {
		return nil, fmt.Errorf("list equipment: %w", err)
	}
	defer rows.Close()

	out := make([]dto.EquipmentResponse, 0)
	for rows.Next() {
		var e dto.EquipmentResponse
		if err := rows.Scan(
			&e.ID, &e.Name, &e.Category, &e.Description, &e.Type,
			&e.DailyRate, &e.SalePrice, &e.Quantity,
			&e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan equipment: %w", err)
		}
		e.Images = s.fetchImages(e.ID)
		out = append(out, e)
	}
	return out, rows.Err()
}

func (s *equipmentService) fetchImages(equipmentID uint) []string {
	rows, err := s.db.Query(
		`SELECT image_url FROM equipment_images WHERE equipment_id = $1 ORDER BY position, id`,
		equipmentID,
	)
	if err != nil {
		return []string{}
	}
	defer rows.Close()
	images := make([]string, 0)
	for rows.Next() {
		var url string
		if rows.Scan(&url) == nil {
			images = append(images, url)
		}
	}
	return images
}

func (s *equipmentService) GetByID(id uint) (dto.EquipmentDetailResponse, error) {
	var e dto.EquipmentDetailResponse
	err := s.db.QueryRow(`
		SELECT id, name, category, description, type, daily_rate, sale_price, quantity, created_at, updated_at
		FROM equipment WHERE id = $1
	`, id).Scan(
		&e.ID, &e.Name, &e.Category, &e.Description, &e.Type,
		&e.DailyRate, &e.SalePrice, &e.Quantity,
		&e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return dto.EquipmentDetailResponse{}, fmt.Errorf("get equipment: %w", err)
	}

	_ = s.db.QueryRow(
		`SELECT COUNT(*) FROM equipment_units WHERE equipment_id = $1 AND status = 'available'`, id,
	).Scan(&e.AvailableUnits)

	rows, err := s.db.Query(
		`SELECT serial_number FROM equipment_units WHERE equipment_id = $1 ORDER BY id`, id,
	)
	if err != nil {
		return dto.EquipmentDetailResponse{}, fmt.Errorf("list serials: %w", err)
	}
	defer rows.Close()

	serials := make([]string, 0)
	for rows.Next() {
		var serial string
		if err := rows.Scan(&serial); err != nil {
			return dto.EquipmentDetailResponse{}, fmt.Errorf("scan serial: %w", err)
		}
		serials = append(serials, serial)
	}
	e.Serials = serials
	e.Images = s.fetchImages(id)

	return e, nil
}

func (s *equipmentService) Create(req dto.EquipmentCreateRequest) (dto.EquipmentResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return dto.EquipmentResponse{}, err
	}
	defer tx.Rollback()

	var out dto.EquipmentResponse
	err = tx.QueryRow(`
		INSERT INTO equipment(name, category, description, type, daily_rate, sale_price, quantity)
		VALUES($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, name, category, description, type, daily_rate, sale_price, quantity, created_at, updated_at
	`,
		strings.TrimSpace(req.Name),
		strings.TrimSpace(req.Category),
		strings.TrimSpace(req.Description),
		strings.TrimSpace(req.Type),
		req.DailyRate,
		req.SalePrice,
		req.Quantity,
	).Scan(
		&out.ID, &out.Name, &out.Category, &out.Description, &out.Type,
		&out.DailyRate, &out.SalePrice, &out.Quantity,
		&out.CreatedAt, &out.UpdatedAt,
	)
	if err != nil {
		return dto.EquipmentResponse{}, fmt.Errorf("create equipment: %w", err)
	}

	for _, serial := range req.Serials {
		serial = strings.TrimSpace(serial)
		if serial == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT INTO equipment_units(equipment_id, serial_number, status) VALUES($1,$2,'available')`,
			out.ID, serial,
		); err != nil {
			return dto.EquipmentResponse{}, fmt.Errorf("create equipment unit: %w", err)
		}
	}

	for i, imageURL := range req.Images {
		imageURL = strings.TrimSpace(imageURL)
		if imageURL == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT INTO equipment_images(equipment_id, image_url, position) VALUES($1,$2,$3)`,
			out.ID, imageURL, i,
		); err != nil {
			return dto.EquipmentResponse{}, fmt.Errorf("create equipment image: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return dto.EquipmentResponse{}, err
	}
	out.Images = req.Images
	return out, nil
}

func (s *equipmentService) Update(id uint, req dto.EquipmentUpdateRequest) (dto.EquipmentResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return dto.EquipmentResponse{}, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`
		UPDATE equipment SET
			name        = COALESCE($2, name),
			category    = COALESCE($3, category),
			description = COALESCE($4, description),
			type        = COALESCE($5, type),
			daily_rate  = COALESCE($6, daily_rate),
			sale_price  = COALESCE($7, sale_price),
			quantity    = COALESCE($8, quantity),
			updated_at  = NOW()
		WHERE id = $1
	`, id, req.Name, req.Category, req.Description, req.Type, req.DailyRate, req.SalePrice, req.Quantity); err != nil {
		return dto.EquipmentResponse{}, fmt.Errorf("update equipment: %w", err)
	}

	if req.Images != nil {
		if _, err := tx.Exec(`DELETE FROM equipment_images WHERE equipment_id = $1`, id); err != nil {
			return dto.EquipmentResponse{}, fmt.Errorf("delete old images: %w", err)
		}
		for i, imageURL := range req.Images {
			imageURL = strings.TrimSpace(imageURL)
			if imageURL == "" {
				continue
			}
			if _, err := tx.Exec(
				`INSERT INTO equipment_images(equipment_id, image_url, position) VALUES($1,$2,$3)`,
				id, imageURL, i,
			); err != nil {
				return dto.EquipmentResponse{}, fmt.Errorf("insert image: %w", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return dto.EquipmentResponse{}, err
	}

	var out dto.EquipmentResponse
	if err := s.db.QueryRow(`
		SELECT id, name, category, description, type, daily_rate, sale_price, quantity, created_at, updated_at
		FROM equipment WHERE id = $1
	`, id).Scan(
		&out.ID, &out.Name, &out.Category, &out.Description, &out.Type,
		&out.DailyRate, &out.SalePrice, &out.Quantity,
		&out.CreatedAt, &out.UpdatedAt,
	); err != nil {
		return dto.EquipmentResponse{}, fmt.Errorf("get equipment after update: %w", err)
	}
	out.Images = s.fetchImages(id)
	return out, nil
}
