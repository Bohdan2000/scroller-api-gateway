# API Gateway

Single entry point for the Scroller mobile app. Routes requests to downstream microservices, enforces authentication, and applies rate limiting.

## Port

`3000`

## Responsibilities

- **JWT validation** — verifies access token signature and expiry at the edge
- **Routing** — proxies requests to identity-service (3001), social-service (3002), content-service (3003), and feed-service (3004)
- **Rate limiting** — 100 requests per 60 s, keyed by user ID (falls back to IP)
- **Request tracing** — attaches `X-Request-Id` to every request and response
- **Response envelope** — wraps all responses in `{ success, data, requestId }`
- **Error mapping** — normalises upstream HTTP errors into the standard error envelope

## Quick start

```bash
cp .env.example .env
# edit .env — set JWT_ACCESS_SECRET to match identity-service
npm run start:dev
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
| `IDENTITY_SERVICE_URL` | no | Base URL of identity-service (default `http://localhost:3001/api/v1`) |
| `SOCIAL_SERVICE_URL` | no | Base URL of social-service (default `http://localhost:3002/api/v1`) |
| `CONTENT_SERVICE_URL` | no | Base URL of content-service (default `http://localhost:3003/api/v1`) |
| `FEED_SERVICE_URL` | no | Base URL of feed-service (default `http://localhost:3004/api/v1`) |
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
    "code": "CONTENT_001",
    "message": "Video not found",
    "statusCode": 404
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Route map

### Identity service

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/sign-up` | Public | Register with email + password |
| POST | `/api/v1/auth/sign-in` | Public | Sign in, receive JWT pair |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| POST | `/api/v1/auth/logout` | JWT | Invalidate refresh token |
| POST | `/api/v1/auth/oauth/google` | Public | Google OAuth sign-in |
| POST | `/api/v1/auth/oauth/apple` | Public | Apple OAuth sign-in |
| GET  | `/api/v1/me` | JWT | Get current user |

### Social service

| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/v1/me/profile` | JWT | Get own profile |
| PATCH | `/api/v1/me/profile` | JWT | Update own profile |
| GET  | `/api/v1/me/onboarding` | JWT | Get onboarding status |
| PATCH | `/api/v1/me/onboarding/step1` | JWT | Complete step 1 |
| POST | `/api/v1/me/onboarding/step2` | JWT | Complete step 2 |
| GET  | `/api/v1/friends` | JWT | List friends |
| GET  | `/api/v1/friends/requests` | JWT | List friend requests |
| POST | `/api/v1/friends/requests` | JWT | Send a friend request |
| POST | `/api/v1/friends/requests/:id/accept` | JWT | Accept a friend request |
| POST | `/api/v1/friends/requests/:id/reject` | JWT | Reject a friend request |
| DELETE | `/api/v1/friends/:profileId` | JWT | Remove a friend |
| POST | `/api/v1/groups` | JWT | Create a group |
| GET  | `/api/v1/groups/:id` | JWT | Get group details |
| PATCH | `/api/v1/groups/:id` | JWT | Update a group |
| DELETE | `/api/v1/groups/:id` | JWT | Delete a group |
| GET  | `/api/v1/groups/:id/members` | JWT | List group members |
| POST | `/api/v1/groups/:id/members` | JWT | Add a member |
| PATCH | `/api/v1/groups/:id/members/:profileId` | JWT | Update member role |
| DELETE | `/api/v1/groups/:id/members/:profileId` | JWT | Remove a member |
| GET  | `/api/v1/topics` | Public | List all topics |
| GET  | `/api/v1/topics/me` | JWT | Get user topic preferences |
| POST | `/api/v1/topics/me` | JWT | Set topic preferences |

### Content service

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/videos` | JWT | Create a new video (DRAFT) |
| GET  | `/api/v1/videos/:id` | Public | Get video by ID |
| PATCH | `/api/v1/videos/:id` | JWT | Update video metadata |
| DELETE | `/api/v1/videos/:id` | JWT | Delete a video |
| POST | `/api/v1/videos/:id/upload-url` | JWT | Request a Mux direct upload URL |
| POST | `/api/v1/videos/:id/publish` | JWT | Publish a READY video |
| POST | `/api/v1/videos/:id/unpublish` | JWT | Unpublish (PUBLISHED → READY) |
| GET  | `/api/v1/me/videos` | JWT | List own videos |
| POST | `/api/v1/webhooks/mux` | Mux signature | Forward Mux webhook to content-service |

### Feed service

| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/v1/feed` | JWT | Get personalised ranked feed (includes `isLiked` per item) |
| POST | `/api/v1/feed/events/impression` | JWT | Record which videos the user saw |
| POST | `/api/v1/feed/events/watch` | JWT | Record watch duration |
| POST | `/api/v1/feed/events/like` | JWT | Like a video |
| DELETE | `/api/v1/feed/events/like/:videoId` | JWT | Unlike a video |
| POST | `/api/v1/feed/events/share` | JWT | Record a share event |

### Gateway

| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/v1/health` | Public | Health check |
