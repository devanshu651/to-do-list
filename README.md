# Taskflow — MERN To-Do App

A full-stack task manager with a React dashboard and a REST API built with Express and MongoDB.

## Run locally

1. Install Node.js 20+.
2. Run `npm install` from the project root.
3. Open `server/.env` and set `MONGODB_URI` to your Atlas URI. Use the hostname `cluster0.e4al3mv.mongodb.net`, database `taskflow`, and URL-encode the username and password separately if they contain reserved URL characters. The `JWT_SECRET` is generated locally when this project is set up; keep it private.
4. Run `npm run dev` and open the Vite URL shown in the terminal.

The frontend has a browser-local demo mode when no account is connected, so you can explore the UI without a database. Signed-in task changes always go through the API; if the API is unavailable, the UI reports the error and does not claim the change was saved. API requests use `/api`; Vite proxies them to Express on port 5000. The API health endpoint reports unavailable when MongoDB is disconnected.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/tasks?status=&priority=&search=&sort=&page=&limit=`
- `POST /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`

Protected task routes require `Authorization: Bearer <token>`. Task list responses include `data` and pagination `meta`. Errors use `{ success: false, error: { code, message, details? } }`.
