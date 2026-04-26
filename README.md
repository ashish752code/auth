# ⚡ NexAuth — Full-Stack Auth Template

A production-ready full-stack web application with real user authentication, database integration, and one-click deployment support.

![CI](https://github.com/YOUR_USERNAME/nexauth/actions/workflows/ci.yml/badge.svg)

---

## 📸 Features

| Feature | Details |
|---|---|
| 🔐 **Authentication** | JWT-based login & signup with bcrypt password hashing |
| 🗄️ **Database** | SQLite (via `better-sqlite3`) — embedded, no external service needed |
| 🛡️ **Security** | Helmet.js, CORS, rate limiting, input validation |
| 📋 **CRUD** | Full Create/Read/Update/Delete for user notes |
| 🚀 **Deploy** | Render, Railway, and Fly.io configs included |
| 🎨 **UI** | Dark-mode dashboard, toast notifications, responsive design |
| 🔌 **API** | RESTful JSON API with auth middleware |
| ⚙️ **CI/CD** | GitHub Actions workflow |

---

## 🗂️ Project Structure

```
nexauth/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── routes/
│   │   ├── auth.js            # /api/auth/* routes
│   │   └── notes.js           # /api/notes/* routes
│   ├── middleware/
│   │   └── auth.js            # JWT verify middleware
│   └── database/
│       └── db.js              # SQLite setup + schema
├── public/                    # Static frontend files
│   ├── index.html             # Landing page
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── dashboard.html         # Protected dashboard
│   ├── css/
│   │   └── style.css          # Full design system
│   └── js/
│       └── app.js             # Auth helpers, API client, toasts
├── data/                      # SQLite DB (auto-created, gitignored)
├── .env.example               # Environment variables template
├── .gitignore
├── render.yaml                # Render.com deploy config
├── railway.toml               # Railway deploy config
├── fly.toml                   # Fly.io deploy config
└── package.json
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- npm (comes with Node.js)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nexauth.git
cd nexauth
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_string
CORS_ORIGINS=http://localhost:5000
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### 5. Open the app

Visit **http://localhost:5000** 🎉

---

## 🌐 API Reference

All API routes return JSON. Protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

### Auth Routes

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Log in, get token |
| `GET`  | `/api/auth/me` | ✅ | Get current user |
| `PUT`  | `/api/auth/profile` | ✅ | Update name / password |

#### POST `/api/auth/signup`
```json
// Request
{ "name": "Jane Smith", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "message": "Account created successfully!", "token": "eyJ...", "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com", "role": "user" } }
```

#### POST `/api/auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{ "message": "Logged in successfully!", "token": "eyJ...", "user": { ... } }
```

### Notes Routes (all require auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/notes` | Get all user notes |
| `POST`   | `/api/notes` | Create a note |
| `GET`    | `/api/notes/:id` | Get single note |
| `PUT`    | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `GET`    | `/api/notes/user/stats` | User stats |

### Other

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/health` | ❌ | Health check |

---

## 🚢 Deployment

### Option A: Render.com (Recommended — Free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo — Render reads `render.yaml` automatically
4. In Environment → add `CORS_ORIGINS` = your Render app URL (e.g. `https://nexauth.onrender.com`)
5. Click **Deploy** ✅

### Option B: Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Add environment variables:
   - `JWT_SECRET` = (generate a long random string)
   - `CORS_ORIGINS` = your Railway URL
   - `NODE_ENV` = `production`
4. Railway reads `railway.toml` automatically ✅

### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (first time)
fly launch --no-deploy

# Set secrets
fly secrets set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
fly secrets set CORS_ORIGINS=https://nexauth.fly.dev

# Deploy
fly deploy
```

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,          -- bcrypt hash
  role       TEXT    NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Notes table
CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  content    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs |
| `CORS_ORIGINS` | No | `http://localhost:5000` | Allowed origins (comma-separated) |

---

## 🛡️ Security Features

- **Passwords** hashed with bcrypt (cost factor 12)
- **JWT tokens** expire after 7 days
- **Rate limiting**: 20 req/15min on auth routes, 100 req/min on API
- **Helmet.js** sets secure HTTP headers
- **CORS** restricts cross-origin access
- **SQL injection** impossible — `better-sqlite3` uses parameterized queries
- **Input validation** on all endpoints

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Hashing | bcryptjs |
| Security | Helmet, express-rate-limit, CORS |
| Frontend | Vanilla HTML/CSS/JS |
| Fonts | Google Fonts (Syne + DM Sans) |
| CI/CD | GitHub Actions |

---

## 📝 License

MIT — free to use, modify, and deploy.

---

**Built with Node.js · Express · SQLite · JWT**
