# AffordMed Backend Submission

This backend now implements the core pieces expected in the campus hiring backend pre-test:

- `POST /api/v1/register` to obtain `clientID` and `clientSecret`
- `POST /api/v1/auth/token` to obtain and cache an AffordMed bearer token
- `POST /api/v1/auth/refresh` to refresh the cached bearer token
- Centralized structured logging to `POST /evaluation-service/logs`
- Protected backend APIs for a URL shortener module
- Reusable middleware, controllers, services, validators, and a global error handler

## Setup

1. Copy `.env.example` to `.env`
2. Fill in `AFFORDMED_*` values if you want the app to auto-authenticate for logging
3. Install dependencies: `npm install`
4. Start the server: `npm run dev`

If you leave `AFFORDMED_*` values empty, call these endpoints in order:

1. `POST /api/v1/register`
2. `POST /api/v1/auth/token`

That will seed the in-memory auth store and allow the centralized logger to authenticate itself for subsequent log calls.

## Endpoint Summary

### Health

- `GET /api/v1/health`

### Registration

- `POST /api/v1/register`

Request body:

```json
{
  "email": "student@college.edu",
  "name": "Student Name",
  "mobileNo": "9999999999",
  "githubUsername": "studentgithub",
  "rollNo": "22ABC123",
  "accessCode": "AFFORDMEDCODE"
}
```

### Authentication

- `POST /api/v1/auth/token`
- `POST /api/v1/auth/refresh`

Request body:

```json
{
  "email": "student@college.edu",
  "name": "Student Name",
  "rollNo": "22ABC123",
  "clientID": "client-id-from-register",
  "clientSecret": "client-secret-from-register"
}
```

### Protected URL Shortener APIs

Use `Authorization: Bearer <access_token>` from `/api/v1/auth/token`.

- `POST /api/v1/urls`
- `GET /api/v1/urls`
- `GET /api/v1/urls/:shortCode`
- `GET /api/v1/urls/:shortCode/stats`
- `DELETE /api/v1/urls/:shortCode`
- `GET /r/:shortCode` is public and redirects to the original URL

Create request body:

```json
{
  "originalUrl": "https://example.com/articles/backend-review",
  "customCode": "backend01",
  "expiryMinutes": 1440
}
```

## Logging Design

All application logs flow through `src/services/logService.js` and use this payload shape:

```json
{
  "stack": "backend",
  "level": "info",
  "package": "middleware",
  "message": "request completed method=GET path=/api/v1/health status=200 durationMs=10 requestId=..."
}
```

Logging is used in:

- Controllers
- Middleware
- Error handling
- Startup hooks
- URL shortener service events

## Tests

Run:

```bash
npm test
```

The included tests cover the URL shortener service behavior without needing the external AffordMed APIs.
