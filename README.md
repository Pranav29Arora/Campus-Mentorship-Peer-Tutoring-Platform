# CampusConnect - Campus Mentorship & Peer Tutoring Platform

CampusConnect is a modern, responsive full-stack platform designed to connect senior university students (mentors) with junior students (mentees) for academic tutoring, career advice, and live 1-to-1 video guidance.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Demo Accounts](#demo-accounts)
7. [Environment Variables](#environment-variables)
8. [Firebase Setup Integration](#firebase-setup-integration)
9. [WebRTC & Signaling Architecture](#webrtc--signaling-architecture)
10. [Future Express Backend](#future-express-backend)
11. [Future Database Migration](#future-database-migration)
12. [Project Screenshots](#project-screenshots)
13. [Team Members](#team-members)

---

## Project Overview
CampusConnect acts as a peer learning bridge, enabling senior students to share their academic experience with juniors. It features a robust booking calendar, real-time dashboard updates, video chat controls with a built-in simulation, and a full review system.

## Key Features
* **Role-Based Portals**: Personalized dashboards for Students (mentees), Mentors, and Admins.
* **Mentor Discovery**: Full text search, filter by subject department/ratings/availability, and sort by performance.
* **Booking System**: Interactive appointment selector preventing overlapping sessions.
* **Fixed Availability Slots**: Simple calendar management for mentors.
* **Peer-to-Peer Video Call**: Audio/video controls, screen sharing, and socket/PeerJS state transitions.
* **Peer Reviews**: 5-star rating scale and written reviews for finished bookings.
* **Admin Controls**: Monitoring panel tracking registered users, total bookings, active lists, and account suspensions.

## Tech Stack
* **Frontend**: React.js (Vite), Tailwind CSS, Context API, React Router, Axios, Lucide Icons, PeerJS Client.
* **Backend**: Node.js, Express.js, Socket.io (for signaling server).
* **Database**: Firebase (Firestore & Authentication) and LocalStorage fallback.

---

## Folder Structure
```text
CampusConnect/
├── frontend/             # React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Modular UI elements (common, mentors, booking, dashboard, video, admin)
│   │   ├── pages/        # Route views
│   │   ├── context/      # Global Authentication and App context states
│   │   ├── services/     # API/Firebase/Mock service layers
│   │   ├── hooks/        # Custom react hooks
│   │   ├── data/         # Mock database records
│   │   └── utils/        # Validations, formatters, and storage helpers
│   └── package.json
│
├── backend/              # Express signaling & REST server
│   ├── src/
│   │   ├── config/       # Env & firebase sdk configurations
│   │   ├── controllers/  # Route handler functions
│   │   ├── middleware/   # JWT, Role check, and Error handler configurations
│   │   ├── routes/       # Endpoint definitions
│   │   ├── services/     # Backend business logic
│   │   ├── models/       # Placeholder DB entity structures
│   │   └── server.js     # Express App boot & Socket listeners
│   └── package.json
└── package.json          # Root scripts runner
```

---

## Installation & Setup

### Prerequisites
* Node.js (v16.0 or higher)
* npm (v8.0 or higher)

### Setup Instructions
1. Clone the repository and navigate to the project directory:
   ```bash
   cd "Campus Mentorship"
   ```
2. Install all dependencies for both subprojects:
   ```bash
   npm run install-all
   ```
3. Copy environment configurations:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```
4. Run the development environments in parallel:
   ```bash
   npm run dev
   ```
   * Frontend: [http://localhost:5173](http://localhost:5173)
   * Backend: [http://localhost:5000](http://localhost:5000)

---

## Demo Accounts
To facilitate quick walkthroughs, the login screen includes **Quick Fill** buttons for the following profiles:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campusconnect.com` | `student123` |
| **Mentor** | `mentor@campusconnect.com` | `mentor123` |
| **Admin** | `admin@campusconnect.com` | `admin123` |

---

## Environment Variables

### Frontend (.env)
```env
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STUN_SERVER=stun:stun.l.google.com:19302
```

### Backend (.env)
```env
PORT=5000
JWT_SECRET=super_secret_jwt_hash
FIREBASE_PROJECT_ID=campusconnect-demo
```

---

## Firebase Setup Integration
To transition from Mock Data mode to Firebase:
1. In `frontend/.env`, set `VITE_USE_MOCK_DATA=false`.
2. Fill in your Firebase Web App credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. Install dependencies and activate the Firestore/Auth client routing inside `frontend/src/services/firebaseService.js`.

---

## WebRTC & Signaling Architecture
CampusConnect leverages WebRTC for peer-to-peer audio and video transmission:
1. **Signaling**: When a user joins a video call room, the frontend initiates a WebSocket connection via Socket.io to the Express signaling server.
2. **Peer connection**: The signaling server exchanges session descriptors (SDP) and ICE candidates.
3. **PeerJS**: Manages standard Peer connection instances.
4. **Fallback Simulation**: If environments lack public ICE network paths, the app automatically runs in a highly visual mock mode displaying active camera inputs and mic indicators.

---

## Future Express Backend
The `backend` directory is fully structured in compliance with MVC/REST routing patterns:
* **Authentication**: JWT token validation, bcrypt password hashing.
* **Controllers**: Handlers for bookmarks, reviews, users, and admin widgets.
* **Middlewares**: `authMiddleware.js` checks JWT headers; `roleMiddleware.js` handles authorization tags.

## Future Database Migration
A database migration is easily performed by:
1. Connecting Mongoose inside `backend/src/config/db.js`.
2. Replacing the backend mock service implementations with Mongoose queries.
3. Hooking the frontend API client (`apiClient.js`) directly to the active Express server.

---

## Project Screenshots
*(Place screenshots of the Landing Page, Mentor Filtering, Booking flow, and Video Call here)*

---

## Team Members
* **BTech Student 1** - Frontend UI & State Contexts
* **BTech Student 2** - Backend Express Routing & Peer Signaling
* **BTech Student 3** - Database service layers & Testing
