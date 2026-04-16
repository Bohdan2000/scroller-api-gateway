# API Gateway

Single entry point for the Scroller mobile app. Routes requests to downstream microservices, enforces authentication, and applies rate limiting.

## Port

`3000`

## Responsibilities

- **JWT validation** — verifies access token signature and expiry at the edge
- **Routing** — proxies requests to identity-service (port 3001) and social-service (port 3002)
- **Rate limiting** — 100 requests per 60 s, keyed by user ID (falls back to IP)
- **Request tracing** — attaches `X-Request-Id` to every request and response
- **Response envelope** — wraps all responses in `{ success, data, requestId }`
- **Error mapping** — normalises upstream HTTP errors into the standard error envelope

## Quick start

```bash
cp .env.example .env
# edit .env — set JWT_ACCESS_SECRET to match identity-service
docker compose up -d
```

## API docs

Swagger UI: `http://localhost:3000/api/v1/docs`

## Local development

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | HTTP port (default `3000`) |
| `JWT_ACCESS_SECRET` | yes | Must match identity-service value exactly |
| `IDENTITY_SERVICE_URL` | yes | Base URL of identity-service (e.g. `http://localhost:3001/api/v1`) |
| `SOCIAL_SERVICE_URL` | yes | Base URL of social-service (e.g. `http://localhost:3002/api/v1`) |
| `THROTTLE_TTL_MS` | no | Rate-limit window in ms (default `60000`) |
| `THROTTLE_LIMIT` | no | Max requests per window (default `100`) |

## Request / response format

Every response is wrapped in a standard envelope:

**Success**
```json
{
  "success": true,
  "data": { },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "SOCIAL_001",
    "message": "Profile not found",
    "statusCode": 404
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Route map

| Method | Gateway path | Downstream |
|---|---|---|
| POST | `/api/v1/auth/sign-up` | identity-service |
| POST | `/api/v1/auth/sign-in` | identity-service |
| POST | `/api/v1/auth/refresh` | identity-service |
| POST | `/api/v1/auth/logout` | identity-service |
| POST | `/api/v1/auth/oauth/google` | identity-service |
| POST | `/api/v1/auth/oauth/apple` | identity-service |
| GET  | `/api/v1/me` | identity-service |
| GET  | `/api/v1/me/profile` | social-service |
| PATCH | `/api/v1/me/profile` | social-service |
| GET  | `/api/v1/me/onboarding` | social-service |
| PATCH | `/api/v1/me/onboarding/step1` | social-service |
| POST | `/api/v1/me/onboarding/step2` | social-service |
| GET  | `/api/v1/friends` | social-service |
| GET  | `/api/v1/friends/requests` | social-service |
| POST | `/api/v1/friends/requests` | social-service |
| POST | `/api/v1/friends/requests/:id/accept` | social-service |
| POST | `/api/v1/friends/requests/:id/reject` | social-service |
| DELETE | `/api/v1/friends/:profileId` | social-service |
| POST | `/api/v1/groups` | social-service |
| GET  | `/api/v1/groups/:id` | social-service |
| PATCH | `/api/v1/groups/:id` | social-service |
| DELETE | `/api/v1/groups/:id` | social-service |
| GET  | `/api/v1/groups/:id/members` | social-service |
| POST | `/api/v1/groups/:id/members` | social-service |
| PATCH | `/api/v1/groups/:id/members/:profileId` | social-service |
| DELETE | `/api/v1/groups/:id/members/:profileId` | social-service |
| GET  | `/api/v1/topics` | social-service (public) |
| GET  | `/api/v1/topics/me` | social-service |
| POST | `/api/v1/topics/me` | social-service |
| GET  | `/api/v1/health` | gateway (public) |
