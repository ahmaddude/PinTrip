# PinTrip 📍

PinTrip is a MERN social media web application for travelers. Users can discover places, create pins on an interactive map, upload photos, connect with friends, and share their travel experiences.

## Features

- Authentication with email/password and Google OAuth
- Email verification and password reset
- Interactive map built with Leaflet
- Create, edit, and delete travel pins
- Upload images using Supabase Storage
- User profiles with avatars and bios
- Friend requests and personalized home feed
- Explore feed for discovering public pins
- Comments on pins
- Real-time notifications with Socket.IO

## Tech Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Supabase Storage
- Socket.IO
- Leaflet Maps

## Installation

Clone the repository and install the dependencies.

```bash
git clone <repository-url>
cd PinTrip

cd backend
npm install

cd ../frontend
npm install
```

Create a `.env` file inside the backend directory and add your MongoDB, Supabase, JWT, email, and Google OAuth credentials.

Start both servers:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

This project was built to practice building a complete social media application with authentication, maps, file uploads, real-time features, and a REST API.