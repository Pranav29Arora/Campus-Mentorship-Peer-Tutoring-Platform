# CampusConnect - Project Development Context

This document traces the requirements under which **CampusConnect** was created, the technical details of the current implementation, and the outstanding roadmap tasks.

---

## 1. Implemented Prompts & Requirements
CampusConnect was designed from the ground up as a polished BTech BEE/MERN-stack academic showcase. The prompt requirements met in this version include:

* **Role-Based Portals**:
  * **Students**: Can search, filter, and sort mentors; schedule sessions; join video calls; manage active appointments; submit peer reviews; and edit profiles.
  * **Mentors**: Can publish available time slots, track incoming appointments, join video calls, review ratings, and update biography stats.
  * **Admins**: Can view platform-wide metrics (ratios, columns, activity totals), search users, disable/enable student accounts, and view all bookings.
* **Routing & Protected Access**: Fully guarded navigation redirects guest users to login pages, restricts pages by role types, and displays a premium "Access Denied" interface if students try to enter admin portals.
* **Discovery & Filters System**: Search bar with real-time text input matching, department dropdowns, subject category tags, rating caps, and sort filters based on sessions experience or rating.
* **Double Booking Check**: Booking slot scheduler checks for time conflicts on the student's active calendar before permitting bookings, marking slot status as booked and disabling double bookings.
* **Signaling Video Call & fallbacks**: Implements PeerJS and Socket.io WebRTC SDP candidate relays, including audio/video control toggles, screen sharing indicators, and a mock stream simulator fallback for environments without accessible camera devices.
* **Peer Reviews**: 1-to-5 star rating selector with review comment textarea fields. Submitting a review recalculates the mentor's average star count to 1 decimal place.
* **Demo accounts Quick Fill**: Embedded buttons on the login screen to sign in as Student, Mentor, or Admin instantly for fast viva reviews.

---

## 2. Current Architecture & Tech Stack Used

The project is structured with a clean separation of concerns between `frontend` and `backend`:

### Frontend (React v18 + Vite)
* **Tailwind CSS Styling**: Premium glassmorphism backgrounds (`glass-panel`), outfit typography, gradient borders, and responsive grid layouts.
* **State Contexts**:
  * `AuthContext`: Handles authentication, persistent sessions, registration payloads, and logout routines.
  * `AppContext`: Handles active lists (mentors, bookings, slots, reviews, notifications) and coordinates state mutations.
* **Local Storage Persistence**: Helper script `storage.js` intercepts data calls in mock mode to read/write state records from the browser's `localStorage`, keeping bookings, reviews, and profiles intact on refresh.
* **Service Abstraction**: Abstracted services (`authService`, `mentorService`, `bookingService`, etc.) check if mock mode (`VITE_USE_MOCK_DATA=true`) is active. This allows shifting data sources from mock local arrays to live Express REST backend or Firebase Client SDKs without changing any UI components.

### Backend (Node + Express v4)
* **REST API Endpoints**: Endpoints configured for `/api/auth`, `/api/mentors`, `/api/bookings`, `/api/availability`, `/api/reviews`, and `/api/admin` mapping route calls to controllers and mock memory database stores (`dbStore.js`).
* **WebRTC Socket.io Signaling**: Exposes socket event hooks (`join-room`, `signal`, `media-state-change`) to bridge PeerJS WebRTC connections.
* **Guards & Middlewares**: `authMiddleware.js` parses JWT Bearer tokens; `roleMiddleware.js` filters allowed groups; `errorMiddleware.js` maps raw errors to formatted JSON.
* **Port Bindings**: Port **5001** (backend) to bypass conflict with macOS receiver default settings, and Port **5174** (frontend).

---

## 3. Future Roadmap (To Be Done Further)

To transition from the current demo configuration to a production MERN deployment, the following steps are required:

### Phase 1: Authentication & Encryption Integration
* **bcrypt Password Hashing**: Integrate `bcryptjs` password hashing inside the backend `authService.js` registration pipeline, replacing mock plain comparison checks.
* **JWT Tokens Signing**: Activate JSON Web Token verification inside `authMiddleware.js`, validating signed payloads against `JWT_SECRET`.
* **Cookie Sessions**: Store tokens in HttpOnly secure cookies to safeguard client sessions against XSS attacks.

### Phase 2: Database Migration (MongoDB)
* **Database Connection**: Set up a MongoDB cluster connection inside `backend/src/config/db.js` using Mongoose.
* **Schema Bindings**: Replace JS class models (`User.js`, `Mentor.js`, `Booking.js`, etc.) with Mongoose Schemas.
* **Data Services Update**: Refactor backend services (e.g. `bookingService.js`) to perform Mongoose queries (`find`, `create`, `findByIdAndUpdate`) rather than mutating `dbStore.js` memory arrays.
* **Frontend Toggle**: Set `VITE_USE_MOCK_DATA=false` inside the frontend configuration to point Axios requests (`apiClient.js`) directly to the Express REST API port.

### Phase 3: Firebase Activation
* **SDK Initialization**: Import Firebase Web App configurations inside `frontend/src/services/firebaseService.js` using standard firebase firestore collections queries.
* **Client Routing Integration**: Hook direct Firebase Authentication login triggers into `authService.js`.

### Phase 4: Production WebRTC & Hosting
* **ICE Turn Server**: Configure active TURN credentials in the environments to bypass strict symmetric campus NAT blocks during video calls.
* **Production PeerJS Server**: Deploy a dedicated PeerJS cloud signaling instance rather than port-forwarding local sockets.
* **Hosting**: Deploy frontend assets to static hosts (Vercel / Netlify) and the Node Express backend to web services (Render / Heroku / AWS EC2).
