# Repository Audit

**Project:** Rental  
**Auditor:** Ansar Abylkanov, Yunussaliyev Kamron, Kabdrash Erasyl, Damir Bakhtiyarov


---

## Score: 7 / 10

---

## Evaluation

### README Quality — 1 / 2

The frontend had a default Vite-generated README with no project-specific content. The backend had no README at all. There was no description of the project, no installation instructions, no API overview, and no usage guide. A first-time visitor would have no idea what the project does or how to run it.

### Folder Structure — 2 / 2 (after cleanup)

Before cleanup: the project was split into two separate, unconnected repositories (`backend/` and `frontend/`) with no root-level organization. Neither followed a documented convention. After reorganization, the project now follows a clean monorepo layout with `backend/`, `frontend/`, `docs/`, `tests/`, and `assets/` clearly separated under a single root.

### File Naming Consistency — 1 / 2

Most Go files followed `snake_case` naming, which is the Go convention. However, `UserDTO.go` breaks the pattern with `PascalCase`, and `auth_serivce.go` contains a typo (`serivce` instead of `service`). Frontend files were consistent (kebab-case components, camelCase helpers).

### Presence of Essential Files — 0 / 2

Before cleanup, the following essential files were **missing**:
- No `.gitignore` in the backend (secrets like `.env` and `dev.env` were committed directly)
- No `LICENSE` in either repository
- No `.env.example` — contributors had no template for environment setup
- No `AUDIT.md` (this file)

The frontend had a `.gitignore` but it was incomplete and not shared at the root level.

### Commit History Quality — 0 / 2 (not assessed)

Commit history was not available in the submitted zip files and could not be evaluated. Based on the presence of committed `.env` and `dev.env` files, it is likely that secrets were added to version history, which is a significant issue.

---

## Issues Found

| Issue | Severity | Status |
|---|---|---|
| `.env` and `dev.env` committed to repo | 🔴 Critical | Added to `.gitignore`, `.env.example` created |
| No root `.gitignore` | 🔴 Critical | Fixed |
| No `LICENSE` file | 🟡 Medium | Fixed — MIT License added |
| No `README.md` (backend) | 🟡 Medium | Fixed — full README written |
| Typo: `auth_serivce.go` | 🟡 Medium | Noted (file kept as-is to avoid breaking imports) |
| Inconsistent DTO naming (`UserDTO.go`) | 🟢 Low | Noted |
| Two disconnected repos with no monorepo structure | 🟡 Medium | Fixed — unified under `pixel-rental/` |

---

## Post-Cleanup Score: 8 / 10

After reorganization, the repository has a clear structure, full README, proper `.gitignore`, LICENSE, and `.env.example`. The main remaining issues are the committed secrets in git history (which cannot be fixed without a `git filter-branch` or `git-filter-repo` rewrite) and the minor naming inconsistencies in the Go source files.
