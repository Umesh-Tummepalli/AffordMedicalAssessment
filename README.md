# Afford Medical Assessment

A full-stack project built for the Afford Medical Campus Hiring Evaluation.

## Technology Stack

### Backend
- **Node.js**: The core runtime used to build scalable, non-blocking APIs.
- **Express.js**: Used as the web framework to define structured, clean, and modular API routes (`/auth`, `/urls`, `/register`, `/health`).
- **Axios**: Used to perform HTTP requests to external APIs (e.g., AffordMed test API for authentication, registration, and remote logging).
- **Crypto (Native)**: Used securely to generate cryptographically strong `UUID`s for request tracking and short `base64url` strings for URL shortening.
- **JSON File Store**: Instead of a heavy relational database, a simple in-memory cache synchronized with a local JSON file (`data/urls.json`) was used. This demonstrates understanding of disk IO limits without requiring heavy external dependencies like Postgres/MongoDB.

### Frontend
- **React (Vite)**: Used as the core UI library. Vite was chosen over Create-React-App due to its lightning-fast Hot Module Replacement (HMR) and optimized build speeds.
- **Material UI (MUI)**: A robust component library used to implement stunning, modern aesthetics (glassmorphism, dynamic animations, deep dark mode) effortlessly.
- **Axios**: Handled frontend-to-backend API communication efficiently.

---

## Architecture & Improvements Implemented

We built this project focusing on **Enterprise-Grade Clean Architecture**. The backend uses isolated layers:
- **Controllers** map HTTP requests to services.
- **Services** handle core business logic (`urlShortenerService`, `affordmedAuthService`).
- **Repositories** handle data persistence (`urlRepository`).
- **State** handles ephemeral in-memory state securely (`runtimeAuthStore`).

To make the backend completely flawless and resilient, we implemented three major architectural upgrades:

1. **Mutex Authentication Lock (Thundering Herd Prevention)**
   - **Why:** If the AffordMed access token expired, 50 simultaneous incoming requests would cause the server to dispatch 50 identical authentication calls to the upstream API, risking rate limits and crashing.
   - **How:** We implemented a `Promise` lock (`authPromise`) in `affordmedAuthService.js`. Now, the first request locks the refresh cycle, and all 49 subsequent requests securely `await` the identical active Promise.

2. **Asynchronous Background Log Flushing**
   - **Why:** External API logging requests can fail due to network drops or unconfigured credentials. Dropping logs is unacceptable in production environments.
   - **How:** We built a local `bufferedLogs` queue in `logService.js`. An asynchronous background `setInterval` sweeps the queue every 10 seconds and re-transmits failed logs gracefully without blocking the main event loop.

3. **In-Memory O(1) Data Caching**
   - **Why:** Reading a JSON file synchronously on every `GET /urls` request creates a severe disk IO bottleneck.
   - **How:** We cached the database inside an in-memory array (`memoryCache`) in `urlRepository.js`. API reads resolve instantly. Disk writes are dispatched asynchronously in the background as a fire-and-forget Promise.

---

## How to Run the Project

### Prerequisites
- Node.js (v18+ recommended)
- NPM

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:3000`. It will automatically generate `urls.json` internally upon the first request.

### 2. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The stunning modern UI will start on `http://localhost:5173` (or `5175`). You can access it in your browser to test the API integrations.