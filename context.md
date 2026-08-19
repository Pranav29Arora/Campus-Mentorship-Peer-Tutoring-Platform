# CampusConnect - System Context & Agent Handover Document

> [!IMPORTANT]
> **To the Incoming AI Agent:** 
> This document preserves the "soul" and technical specifications of **CampusConnect**. Read this first to align with the core philosophy, understand the current implementation state, and follow the exact instructions for next-step integrations. Do not deviate from the architectural rules established here.

---

## 1. Core Vision & Philosophy ("The Soul")

CampusConnect is built not as a complex enterprise SaaS, but as a **BTech BEE/MERN-stack Academic Viva Project**. The code must remain:
1. **Understandable & Explorable**: A BTech student must be able to explain every line of JS, React, Express, and WebRTC code during a viva/vocal examination.
2. **Pedagogical**: Modern JavaScript concepts (arrow functions, destructurings, array methods like `map`, `filter`, `reduce`, `sort`, promises, and async/await) must be highly visible and cleanly utilized.
3. **Architecturally Sound**: A clean separation between frontend and backend workspaces. No mixing of database logic with UI components. Strict adherence to:
   `Route` ➔ `Middleware` ➔ `Controller` ➔ `Service` ➔ `Database Model/Store`.
4. **Highly Aesthetic & Responsive**: Premium Outfit/Inter fonts, smooth dark mode templates with indigo/violet glassmorphism cards (`glass-panel`), loading spinners, retry errors, and alerts.

---

## 2. original Specification Reference (The 56 Rules Checklist)

The platform is designed around 56 core rules defined in the initial specification. Below is the active tracking of these guidelines:

*   **[Rule 1-2] Data Abstraction & Stack**: Abstraction of services (`authService`, `bookingService`, etc.) to run mock local localStorage data or transition to Express/Firebase backend without modifying React UI views.
*   **[Rule 3-4] Roles & Pages**: Supports Student, Mentor, and Admin roles. Routes are divided into Public (`/`, `/login`, `/register`, `/mentors`, `/mentor/:id`), Student (`/student/dashboard`, etc.), Mentor (`/mentor/dashboard`, etc.), and Admin (`/admin/dashboard`, etc.).
*   **[Rule 5-6] Landing & Navbar**: Elegant hero section ("Learn From Experience. Grow Together."), How It Works, testimonials, responsive navbar, role-based tabs, and profile dropdown.
*   **[Rule 7-8] Mentor Discovery & Profile**: Card components displaying department, star ratings, bios, and subjects. The profile shows a large avatar and grouped slots calendar.
*   **[Rule 9-10] Booking & Student Dashboard**: Selecting slot sets status as `booked`, checks for student timetable overlaps, and logs session in Student Dashboard stats.
*   **[Rule 11-12] Mentor Dashboard & Availability**: Mentor slot builder (`date`, `startTime`, `endTime`, `subject`). Prevents deleting slots that are already booked by students.
*   **[Rule 13] Video Call**: Double viewports (remote participant large, local pip frame small) with mute mic, camera toggle, screen sharing simulation, and connection overlays.
*   **[Rule 14] Reviews**: 1-to-5 star feedback form. Prevents reviews before session is completed. Recalculates mentor rating automatically.
*   **[Rule 15] Admin Dashboard**: Total metrics stats cards, visual CSS/SVG trend charts, users listing with account suspension buttons, and booking logs.
*   **[Rule 16-17] Auth & Access Guards**: Validated forms, demo quick-fill logins, AuthContext state, and role guards redirecting unauthorized access to Home with Access Denied panels.
*   **[Rule 18-20] Database Schemas & Services**: Blueprint schemas (User, Mentor, Booking, Availability, Review) with service query mappings.
*   **[Rule 21-24] React Architecture**: Reusable common cards and utilities wrapper matching the directory tree.
*   **[Rule 25-26] Express Backend**: Organized folders containing controllers, middlewares, services, and routes.
*   **[Rule 27-35] UX, Error, Loading, & Demo Accounts**: Beautiful Saas feel, retry loaders, in-app notifications, and demo emails (`student@campusconnect.com`, etc.).
*   **[Rule 36-39] Demo Flow & WebRTC Priority**: End-to-end flow checks and WebRTC signaling servers.
*   **[Rule 40-42] Syllabus Showcase**: Direct usage of array functions and hooks. No overengineering.
*   **[Rule 43-56] Clean Code & Arch**: Direct instructions on folder separation, route bindings, controllers, and services.

---

## 3. Current Implementation State

The workspaces are fully structured and compiled:
*   **Root Folder**: `/Users/pranav/Desktop/Campus Mentorship`
*   **Frontend**: `http://localhost:5174/` (React/Vite). Compiled and runs.
*   **Backend**: `http://localhost:5001/` (Express REST server + Socket.io WebRTC signaling). Active daemon.

### Current File Tree & Links
*   **Root Configs**: [package.json](file:///Users/pranav/Desktop/Campus%20Mentorship/package.json), [.gitignore](file:///Users/pranav/Desktop/Campus%20Mentorship/.gitignore), [README.md](file:///Users/pranav/Desktop/Campus%20Mentorship/README.md)
*   **Frontend Configs**: [package.json](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/package.json), [vite.config.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/vite.config.js), [tailwind.config.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/tailwind.config.js), [postcss.config.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/postcss.config.js), [.env](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/.env)
*   **Frontend Core & Contexts**: [index.css](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/index.css), [main.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/main.jsx), [App.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/App.jsx), [AuthContext.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/context/AuthContext.jsx), [AppContext.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/context/AppContext.jsx)
*   **Frontend Navigation & Guards**: [Navbar.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/components/common/Navbar.jsx), [Footer.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/components/common/Footer.jsx), [ProtectedRoute.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/components/common/ProtectedRoute.jsx), [AppRoutes.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/routes/AppRoutes.jsx)
*   **Frontend Pages**: [Home.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Home.jsx), [Login.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Login.jsx), [Register.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Register.jsx), [Mentors.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Mentors.jsx), [MentorDetails.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/MentorDetails.jsx), [StudentDashboard.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/StudentDashboard.jsx), [MentorDashboard.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/MentorDashboard.jsx), [AdminDashboard.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/AdminDashboard.jsx), [Availability.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Availability.jsx), [Bookings.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Bookings.jsx), [VideoCall.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/VideoCall.jsx), [Profile.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/Profile.jsx), [NotFound.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/NotFound.jsx)
*   **Frontend Service Layer**: [apiClient.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/apiClient.js), [authService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/authService.js), [mentorService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/mentorService.js), [bookingService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/bookingService.js), [availabilityService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/availabilityService.js), [reviewService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/reviewService.js), [notificationService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/notificationService.js), [firebaseService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/services/firebaseService.js), [storage.js](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/utils/storage.js)
*   **Backend Server Setup**: [package.json](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/package.json), [server.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/server.js), [app.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/app.js), [.env](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/.env), [env.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/config/env.js), [firebase.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/config/firebase.js)
*   **Backend Routes & Middlewares**: [authRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/authRoutes.js), [mentorRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/mentorRoutes.js), [bookingRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/bookingRoutes.js), [availabilityRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/availabilityRoutes.js), [reviewRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/reviewRoutes.js), [adminRoutes.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/routes/adminRoutes.js), [authMiddleware.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/middleware/authMiddleware.js), [roleMiddleware.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/middleware/roleMiddleware.js), [errorMiddleware.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/middleware/errorMiddleware.js), [validationMiddleware.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/middleware/validationMiddleware.js)
*   **Backend Controllers**: [authController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/authController.js), [mentorController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/mentorController.js), [bookingController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/bookingController.js), [availabilityController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/availabilityController.js), [reviewController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/reviewController.js), [adminController.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/controllers/adminController.js)
*   **Backend Memory Database & Services**: [dbStore.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/dbStore.js), [authService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/authService.js), [mentorService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/mentorService.js), [bookingService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/bookingService.js), [availabilityService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/availabilityService.js), [reviewService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/reviewService.js)
*   **Backend Schemas & Utils**: [User.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/models/User.js), [Mentor.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/models/Mentor.js), [Booking.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/models/Booking.js), [Availability.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/models/Availability.js), [Review.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/models/Review.js), [jwt.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/utils/jwt.js), [password.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/utils/password.js), [validators.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/utils/validators.js)

---

## 4. How the Project Operates in Mock Mode
Initially, `VITE_USE_MOCK_DATA=true` is set.
*   **Initial Seeding**: The first time the application loads, `storage.js` evaluates if mock users are present in the browser's local storage. If not, it seeds 15+ student accounts, 10 detailed mentors, 20+ availability slots, 15+ bookings, and 15+ reviews.
*   **Live Persistence**: Actions like logging in, scheduling availability, bookings validation, and posting reviews write back to `cc_bookings` or `cc_reviews` keys in the local storage, which makes data persistent across page reloads.

---

## 5. Instructions for the Next AI Agent

When you resume development of this project, you must follow these specific implementation guidelines:

### Phase 1: Activate JWT & bcrypt (Authentications)
1. Navigate to the backend service [authService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/authService.js).
2. Wire up the password validation comparison checks to call the bcrypt helper [password.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/utils/password.js), replacing the placeholder password matching checks (`student123`, etc.).
3. Update [authMiddleware.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/middleware/authMiddleware.js) to enforce verification of signed JSON Web Tokens using [jwt.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/utils/jwt.js).

### Phase 2: Database Migration (Mongoose MongoDB)
1. Add `db.js` in `backend/src/config/` to initialize `mongoose` connection scripts.
2. In the models folder `backend/src/models/`, convert the class models definitions into active Mongoose Schemas.
3. In each backend service file (e.g. [bookingService.js](file:///Users/pranav/Desktop/Campus%20Mentorship/backend/src/services/bookingService.js)), swap local array pushes with standard database queries:
   * `Booking.find(...)`
   * `new Booking(...).save()`
   * `Booking.findByIdAndUpdate(...)`
4. Toggle the frontend settings: in [frontend/.env](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/.env), set `VITE_USE_MOCK_DATA=false` so the service layer routes requests directly to Axios endpoints.

### Phase 3: PeerJS & WebRTC Signaling
1. Ensure the PeerJS client script in [VideoCall.jsx](file:///Users/pranav/Desktop/Campus%20Mentorship/frontend/src/pages/VideoCall.jsx) correctly initializes and connects to the Express signaling server on port 5001.
2. In production, configure environment variables for the STUN/TURN servers to allow media streams to traverse strict university firewall rules.
