package util

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"rental/internal/config"
	"strings"
	"time"
)

type ClaimsToken struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Iss   string `json:"iss"`
	Aud   string `json:"aud"`
	Exp   int64  `json:"exp"`
	Iat   int64  `json:"iat"`
}

type JwtHeader struct {
	Alg  string `json:"alg"`
	Type string `json:"typ"`
}

func HashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	h := sha256.Sum256(append(salt, []byte(password)...))
	return hex.EncodeToString(salt) + ":" + hex.EncodeToString(h[:]), nil
}

func ComparePassword(hash, password string) bool {
	parts := strings.Split(hash, ":")
	if len(parts) != 2 {
		return false
	}

	salt, err := hex.DecodeString(parts[0])
	if err != nil {
		return false
	}

	changed := sha256.Sum256(append(salt, []byte(password)...))
	return hmac.Equal([]byte(parts[1]), []byte(hex.EncodeToString(changed[:])))
}

func GenerateAccessToken(cfg *config.Config, userId uint, email, role string) (string, error) {

	claims := ClaimsToken{
		Sub:   fmt.Sprintf("%d", userId),
		Email: email,
		Role:  role,
		Iss:   cfg.JWTIssuer,
		Aud:   cfg.JWTAudience,
		Iat:   time.Now().Unix(),
		Exp:   time.Now().Add(cfg.JWTAccessExpires).Unix(),
	}
	return signClaims(claims, cfg.JWTAccessSecret)
}

func GenerateRefreshToken(cfg *config.Config, userID uint, email, role string) (string, error) {
	claims := ClaimsToken{
		Sub:   fmt.Sprintf("%d", userID),
		Email: email,
		Role:  role,
		Iss:   cfg.JWTIssuer,
		Aud:   cfg.JWTAudience,
		Iat:   time.Now().Unix(),
		Exp:   time.Now().Add(cfg.JWTRefreshExpires).Unix(),
	}
	return signClaims(claims, cfg.JWTRefreshSecret)
}

func ParseGeneratedTokens(token string, cfg *config.Config) (ClaimsToken, error) {
	return parseTokenClaims(token, cfg.JWTAccessSecret, cfg)
}

func signClaims(claims ClaimsToken, secret string) (string, error) {
	header := JwtHeader{Alg: "HS256", Type: "JWT"}
	headerRaw, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	claimsRaw, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	encodeHeader := base64.RawURLEncoding.EncodeToString(headerRaw)
	encodeClaims := base64.RawURLEncoding.EncodeToString(claimsRaw)
	signingInput := encodeHeader + "." + encodeClaims
	encoding := hmac.New(sha256.New, []byte(secret))

	encoding.Write([]byte(signingInput))
	signature := encoding.Sum(nil)

	return signingInput + "." + base64.RawURLEncoding.EncodeToString(signature), nil
}

func parseTokenClaims(token, secret string, cfg *config.Config) (ClaimsToken, error) {

	var claim ClaimsToken
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return claim, fmt.Errorf("the given token is invalid")
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return claim, fmt.Errorf("Token Signature is invalid")
	}

	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return claim, fmt.Errorf("token signature is invalid")
	}

	encoding := hmac.New(sha256.New, []byte(secret))
	encoding.Write([]byte(parts[0] + "." + parts[1]))
	if !hmac.Equal(sig, encoding.Sum(nil)) {
		return claim, fmt.Errorf("Token Signature is invalid")
	}

	if err := json.Unmarshal(payload, &claim); err != nil {
		return claim, fmt.Errorf("token claims are invalid")
	}

	isFine := time.Now().Unix()
	if claim.Exp < isFine {
		return claim, fmt.Errorf("token has expired")
	}

	if cfg.JWTIssuer != "" && claim.Iss != cfg.JWTIssuer {
		return claim, fmt.Errorf("token issuer is invalid")
	}

	if cfg.JWTAudience != "" && claim.Aud != cfg.JWTAudience {
		return claim, fmt.Errorf("token audience is invalid")
	}

	return claim, nil
}
