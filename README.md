# BankOfCLI-Part3
A full-stack banking web application that connects the Bank of CLI frontend to a live backend. This project migrates the original Java CLI logic into a Spring Boot REST API and secures it with stateless JWT authentication.

| Folder | What it is |
|---|---|
| `bank-api/` | Spring Boot 4 REST API (Java 17, PostgreSQL, Flyway, JWT) |
| `React-Frontend/` | React 19 + Vite frontend |
| `Angular-Frontend/` | Angular 22 frontend |
| `docs/api-contract.md` | JSON shapes exchanged between frontend and backend |
| `postman/` | Shared Postman collection for testing the API |
| `deploy/` | CloudFront Function used for the AWS deployment |

**Live (AWS):** React at https://d15whtastc48ce.cloudfront.net, Angular at https://d1cqdxlg0av283.cloudfront.net

---

## Setup

### Requirements
- **Java 17** (the Maven wrapper `mvnw` is included, so Maven itself is not needed)
- **Docker Desktop** (runs the local PostgreSQL database)
- **Node.js 22.22+ or 24+** (the Angular CLI needs at least 22.22; React works on any Node 22+)

### 1. Clone and start the database
```bash
git clone https://github.com/PG-23/BankOfCLI-Part3.git
cd BankOfCLI-Part3
docker compose up -d
```
This starts PostgreSQL 16 on `localhost:5432` (database, user and password are all `bankofcli`). Data is kept in a Docker volume, so it survives restarts. To wipe it and start fresh: `docker compose down -v`, then `docker compose up -d`.

### 2. Install frontend dependencies
```bash
cd React-Frontend
npm install
cd ../Angular-Frontend
npm install
```

---

## Environment variables

Every setting has a local default, so **nothing needs to be set to run locally**. The env vars are for AWS (ECS sets them there).

### Backend (`bank-api/src/main/resources/application.yml`)
| Variable | Local default | What it is |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `bankofcli` | Database name |
| `DB_USERNAME` | `bankofcli` | Database user |
| `DB_PASSWORD` | `bankofcli` | Database password |
| `JWT_SECRET` | `local-dev-secret-change-me-before-deploying-0000` | Key used to sign login tokens. **Must be changed anywhere outside your own machine** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:4200` | Comma-separated frontend URLs allowed to call the API |
| `SPRING_FLYWAY_LOCATIONS` | `classpath:db/migration` | Set to `classpath:db/migration,classpath:db/seed` to also load the demo users |

### Docker Compose (`docker-compose.yml`)
`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (all default `bankofcli`) and `POSTGRES_PORT` (default `5432`). If you change these, change the matching `DB_*` variables too.

### Frontends
| App | Setting | Local | Production build |
|---|---|---|---|
| React | `VITE_API_URL` in `React-Frontend/.env.development` | `http://localhost:8080/api` | `/api` (same domain, through CloudFront) |
| Angular | `apiUrl` in `Angular-Frontend/src/environments/` | `http://localhost:8080/api` (`environment.ts`) | `/api` (`environment.prod.ts`) |

> Never commit real secrets (AWS keys, the production `JWT_SECRET`, database passwords). `.env` files are git-ignored except `.env.development` and `.env.example`.

---

## Running the backend

Make sure the database is running (`docker compose up -d`), then:

```bash
cd bank-api
mvnw spring-boot:run
```
(On macOS/Linux/Git Bash use `./mvnw`.)

The API runs at **http://localhost:8080/api**. Check it with http://localhost:8080/api/health. Flyway creates the tables automatically on startup.

### With demo data (dev profile)
```bash
mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
This also loads four demo users, all with password `password1`: `alice@bank.com`, `bob@bank.com`, `carol@bank.com` and `dan@bank.com`.

> The dev profile also **turns off endpoint security** (`DevSecurityConfig` permits every request). Use it only on your own machine, never on AWS.

### Tests
```bash
mvnw test
```
The tests use the real database, so `docker compose up -d` must be running first.

---

## Running the frontends

Start the backend first. Each frontend calls it at `http://localhost:8080/api`.

### React
```bash
cd React-Frontend
npm run dev
```
Open **http://localhost:5173**. Other scripts: `npm run lint`, `npm run build`.

### Angular
```bash
cd Angular-Frontend
npm start
```
Open **http://localhost:4200**. Other scripts: `npm test`, `npm run build`.

---

## CI/CD (GitHub Actions)
- **CI** (`.github/workflows/ci.yml`) runs on every push and PR to `develop` and `main`: backend tests, React lint + build, and Angular tests + build.
- **CD** (`.github/workflows/cd.yml`) runs on every push to `main`. It deploys the backend to ECS and both frontends to S3 + CloudFront. To ship `develop` to AWS, open a PR from `develop` into `main` and merge it.
