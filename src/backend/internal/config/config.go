package config

import (
	"bufio"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppName           string
	AppEnv            string
	AppPort           int
	DatabaseURL       string
	JWTIssuer         string
	JWTAudience       string
	JWTAccessExpires  time.Duration
	JWTRefreshExpires time.Duration
	JWTAccessSecret   string
	JWTRefreshSecret  string
	AuthClientID      string
	BCryptCost        int
}

func LoadConfig(envPath string) (*Config, error) {
	if envPath == "" {
		envPath = "dev.env"
	}
	if err := loadEnvFile(envPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}

	cfg := &Config{
		AppName:           getString("APP_NAME", "rental"),
		AppEnv:            getString("APP_ENV", "development"),
		AppPort:           getInt("APP_PORT", 8080),
		DatabaseURL:       getString("DATABASE_URL", ""),
		JWTIssuer:         getString("JWT_ISSUER", "rental"),
		JWTAudience:       getString("JWT_AUDIENCE", "web"),
		JWTAccessExpires:  getDuration("JWT_ACCESS_EXPIRES", 15*time.Minute),
		JWTRefreshExpires: getDuration("JWT_REFRESH_EXPIRES", 30*24*time.Hour),
		JWTAccessSecret:   getString("JWT_ACCESS_SECRET", ""),
		JWTRefreshSecret:  getString("JWT_REFRESH_SECRET", ""),
		AuthClientID:      getString("AUTH_CLIENT_ID", ""),
		BCryptCost:        getInt("BCRYPT_COST", 12),
	}
	return cfg, nil
}

func loadEnvFile(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		val = strings.Trim(val, `"'`)
		_ = os.Setenv(key, val)
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	if abs, err := filepath.Abs(path); err == nil {
		_ = os.Setenv("LAST_LOADED_ENV_FILE", abs)
	}
	return nil
}

func getString(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			return parsed
		}
	}
	return def
}
func getDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}
