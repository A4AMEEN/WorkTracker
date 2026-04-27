# WorkTrack Backend

Complete Node.js + Express + MongoDB backend for the WorkTrack company task tracking system.

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

## Demo Users

| Username | Password | Role |
|---|---|---|
| ameen | admin123 | Admin |
| ansari | dev123 | Developer |
| kaviya | dev123 | Developer |
| rajeena | dev123 | Developer |
| rohan | dev123 | Viewer |

## Main APIs

```txt
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/tasks
GET    /api/tasks/today
GET    /api/tasks/my-tasks
POST   /api/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id

GET    /api/history
GET    /api/dashboard
GET    /api/reports/summary
```

## Today Work Logic

Today work returns:
- tasks created for today
- old tasks where status is `Pending`, `Working`, or `Backend Needed`

Done tasks are not carried forward.
