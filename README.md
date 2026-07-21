# PinTrip

A social platform where travelers share the places that moved them — pinned on real maps, backed by real stories.

---

## What is this?

PinTrip is a full-stack MERN application built around one idea: **travel memories deserve more than a phone gallery**. Drop a pin on an interactive Leaflet map, attach a photo, write about the moment, and share it with people who actually care about where you've been.

It's not a review site. It's not a travel blog. It's a place to say *"I was here, and it mattered."*

---

## Features

### For travelers
- **Interactive map** — Drop pins directly on a Leaflet map with automatic reverse geocoding. No need to type an address when the map knows where you clicked.
- **Photo uploads** — Every pin gets a hero image, stored on Supabase with a clean upload flow.
- **Your profile, your story** — Bio, avatar, and a map filled with everywhere you've pinned.

### For the community
- **Friend connections** — Send follow requests, accept them, and build a feed of people whose journeys inspire you.
- **Two feeds** — A Home feed showing only your friends' pins, and an Explore feed showing everything.
- **Search** — Find people by name, email, or bio.
- **Comments** — Talk about the places that catch your eye.

### For the paranoid (in a good way)
- **Google OAuth** — Sign in with one click if you trust Google more than forms.
- **Email verification** — 6-digit code flow with auto-expiry.
- **Password reset** — Same code-based flow, no sketchy token URLs.
- **Rate limiting** — Auth endpoints are throttled. The general API is too. Your server stays up.
- **Helmet + CORS** — Security headers out of the box, origins locked down.
- **File upload limits** — 5MB for avatars, 10MB for pins. No one's uploading a 4K RAW.

---

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Vite 8, Tailwind CSS 3, React Router 7 |
| Maps | Leaflet + react-leaflet |
| Backend | Express 5, Node.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP-only cookies), Google OAuth, bcryptjs |
| Storage | Supabase (file uploads, "Pins" bucket) |
| Real-time | Socket.IO |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, express-rate-limit, express-validator |

---

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string
- A Supabase project (for file storage)
- A Gmail app password (for email sending)
- Optional: A Google OAuth client ID

### 1. Clone and install

```bash
git clone <your-repo-url>
cd SyncLab

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up environment variables

Create `backend/.env`:

```env
MONGO_DB=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
CLIENT_URL=http://localhost:5173

supabaseUrl=your_supabase_project_url
supabaseKey=your_supabase_service_role_key

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The app runs at `http://localhost:5173`. The API proxies to `http://localhost:5000`.

---

## Project structure

```
SyncLab/
├── backend/
│   ├── controllers/        # Auth, pins, users
│   ├── lib/                # MongoDB connection, Supabase client
│   ├── middleWare/         # Auth middleware, file upload (multer)
│   ├── modles/             # Mongoose models (User, Pin, Notification)
│   ├── routes/             # Express route definitions
│   ├── utils/              # Token/cookie helpers, email, Google verify, socket
│   └── index.js            # Entry point — middleware, limits, health, shutdown
│
├── frontend/
│   ├── src/
│   │   ├── components/     # PinCard, MapMarker, layout (Navbar, Sidebar)
│   │   ├── context/        # AuthContext (login, signup, Google, profile update)
│   │   ├── pages/          # 15 pages — Home, Explore, Map, Profile, Friends...
│   │   └── utils/          # Axios instance with 401 interceptor
│   └── vite.config.js
```

---

## API at a glance

| Endpoint | What it does |
|----------|-------------|
| `POST /api/auth/signup` | Register + send verification code |
| `POST /api/auth/login` | Email/password login |
| `POST /api/auth/google` | Google OAuth login |
| `POST /api/auth/forgot-password` | Send reset code |
| `POST /api/auth/reset-password` | Reset with code |
| `GET /api/pin/pins` | All public pins (paginated) |
| `POST /api/pin/create` | Create a pin (image + map data) |
| `GET /api/pin/:id/comments` | Get comments for a pin |
| `GET /api/user/profile/:id` | User profile + friend status |
| `POST /api/user/follow-request/:id` | Send a follow request |
| `GET /api/health` | Health check |

Full API lives in `backend/routes/`.

---

## A note on the code

This project started as a learning build and evolved organically. You'll find some misspelled folder names (`modles/` instead of `models/`), and that's fine — it works, it's secure, and it ships. The architecture is straightforward: controllers handle logic, routes define paths, middleware guards endpoints, and the frontend just fetches and renders.

If you're reading this code for the first time, start with `backend/index.js` to see how the server is wired, then `frontend/src/App.jsx` for the routing, then `frontend/src/context/AuthContext.jsx` for how auth flows through the app.

---

## License

MIT
