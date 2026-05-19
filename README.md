# TurnoApp
> SaaS platform for shift management, sick leave tracking, and team administration
> for small businesses in Germany.
![Status](https://img.shields.io/badge/status-in%20development-orange)
![Stack](https://img.shields.io/badge/stack-Angular%2017%20%7C%20Node.js%20%7C%20PostgreSQL-blue)

---
## Problem
Small businesses in Germany (restaurants, supermarkets, retail stores) still manage
shifts via WhatsApp groups and Excel sheets. This leads to:
- Scheduling conflicts and last-minute confusion
- No structured sick leave (Krankmeldung) workflow
- Zero visibility for managers on team availability
**TurnoApp solves this** with a clean, role-based SaaS built specifically for the
German SMB market - DSGVO compliant by design.
---
## Features (MVP)
| Feature | Status |
|------------------------------------------|-----------------|
| Authentication (JWT + roles) | In progress |
| Employee management | Planned |
| Weekly shift planner (Dienstplan) | Planned |
| Sick leave management (Krankmeldung) | Planned |
| Manager dashboard | Planned |
| Email notifications | Planned |
| Subscription billing (Stripe) | Planned |
---
## Architecture
### Tech Stack
**Frontend**
- Angular 17+ (standalone components, signals, OnPush change detection)
- TypeScript 5+
- Angular Material + custom design system
- Deployed on Vercel
**Backend**
- Node.js + Express
- PostgreSQL (with node-postgres)
- JWT authentication with role-based access control
- RESTful API design
- Deployed on Railway
### Roles
| Role | Permissions |
|----------|--------------------------------------------------|
| admin | Full access, billing, organization settings |
| manager | Create/edit schedules, approve sick leave |
| employee | View own schedule, submit sick leave |
TurnoApp/
 |-- frontend/ # Angular 17+ SPA
 | +-- src/
 | +-- app/
 | |-- core/ # Auth, guards, interceptors
 | |-- features/
 | | |-- auth/
 | | |-- dashboard/
 | | |-- employees/
 | | |-- schedule/
 | | +-- sick-leave/
 | +-- shared/ # Reusable UI components
 |-- backend/ # Node.js + Express API
 | +-- src/
 | |-- modules/
 | | |-- auth/
 | | |-- employees/
 | | |-- schedules/
 | | +-- sick-leave/
 | |-- middleware/ # Auth, roles, error handling
 | |-- config/ # DB, JWT, environment
 | +-- shared/ # Utils, validators, types
 +-- docs/ # Architecture decisions
---
## Getting Started
### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Angular CLI 17+
### Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Fill in your environment variables
npm run db:migrate # Run database migrations
npm run dev # Starts on http://localhost:3000
```
### Frontend Setup
```bash
cd frontend
npm install
ng serve # Starts on http://localhost:4200
```
---
## Database Schema (Core)
```sql
-- Organizations (one per business)
organizations: id, name, plan, created_at
-- Users with roles
users: id, org_id, email, password_hash, role, first_name, last_name
-- Shifts
shifts: id, org_id, employee_id, date, start_time, end_time, role_label
-- Sick leave reports
sick_leaves: id, employee_id, start_date, end_date, note, status
```
---
## API Design
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET /api/employees [manager, admin]
POST /api/employees [admin]
PUT /api/employees/:id [admin]
DELETE /api/employees/:id [admin]
GET /api/schedules/week [all roles]
POST /api/schedules [manager, admin]
PUT /api/schedules/:id [manager, admin]
POST /api/sick-leave [employee]
GET /api/sick-leave [manager, admin]
PATCH /api/sick-leave/:id [manager, admin] -- approve / reject
```
---
## Security
- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15min) + refresh tokens (7d)
- Role-based middleware on every protected route
- DSGVO-compliant data handling (Germany)
- Environment variables - no secrets in code
- Input validation with express-validator on all endpoints
---
## Developer
**Leon** - Fachinformatiker fur Anwendungsentwicklung
- Portfolio: cleon113.github.io
- GitHub: @Cleon113
- Repo: github.com/Cleon113/TurnoApp
---
## License
MIT License - see LICENSE for details.
