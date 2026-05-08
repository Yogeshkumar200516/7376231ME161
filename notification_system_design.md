# Campus Notice Hub

A full-stack role-based notification management system built with:

- `Node.js + Express`
- `MySQL`
- `React + Vite`
- `Material UI`

This project supports two roles:

- `HR/Admin`
- `Student`

HR users can create users, send notifications, and view notification history. Students can log in, browse notifications, view a priority inbox, and open notification details that automatically mark notifications as read.

## Project Goal

The application was built around a campus notification workflow where:

- HR needs to broadcast placement, result, and event notifications
- Students need a clean inbox experience with read/unread handling
- Priority notifications should rank important unread items first
- The system should support both desktop and mobile layouts
- Dark mode and light mode should both work across the app

## Roles and Features

### HR/Admin

HR users can:

- log in
- create new users in the system
- send notifications to all students
- send notifications to selected students
- view notification history
- review delivery counts for `pending`, `sent`, and `failed`

### Student

Students can:

- log in
- view all notifications in a paginated feed
- filter notifications by type
- distinguish new vs read notifications
- view a priority inbox ranked by weight and recency
- open a single notification detail page
- automatically mark a notification as read when opening detail view

## Frontend Routes

### Shared

- `/login`
- `/`

### HR

- `/hr/dashboard`
- `/hr/users`
- `/hr/history`

### Student

- `/notifications`
- `/notifications/priority`
- `/notifications/:id`

## Backend API Routes

### Auth

Base path: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /me`

### HR

Base path: `/api/hr`

- `POST /notify-all`
- `POST /notify-selected`
- `GET /history`
- `GET /students`
- `GET /users`
- `POST /users`

### Student Notifications

Base path: `/api/notifications`

- `GET /`
- `GET /priority`
- `GET /:id`
- `PATCH /:id/read`
- `PATCH /read-all`

### Student Utility

Base path: `/api/student`

- `GET /profile`
- `GET /unread-count`

## Notification Types

The system supports these notification types:

- `Placement`
- `Result`
- `Event`

These are used in:

- HR notification creation
- student notification filtering
- priority ranking logic

## Priority Inbox Logic

The student priority inbox ranks unread notifications by:

- notification weight
- recency

Current weight order:

- `Placement` > `Result` > `Event`

The backend computes a `priority_score` so the student sees the top `n` unread notifications first.

## Authentication and Access Control

The system uses:

- JWT tokens
- session records stored in the database
- protected Express middleware
- role-based route protection in both backend and frontend

Frontend route protection:

- unauthenticated users are redirected to `/login`
- HR users are redirected to HR pages
- students are redirected to student pages
- users cannot access pages belonging to another role

## Theme Support

The frontend includes:

- light theme
- dark theme
- responsive layout for mobile and desktop
- role-based sidebar navigation

Theme state is stored locally in the browser, so the selected mode persists across refreshes.

## Database Design

Main tables used in the backend:

- `users`
- `notifications`
- `student_notifications`
- `notification_delivery_log`
- `notification_queue`
- `sessions`

High-level purpose:

- `users`: stores HR and student accounts
- `notifications`: stores each broadcast notification
- `student_notifications`: stores per-student read state
- `notification_delivery_log`: stores per-channel delivery status
- `notification_queue`: stores async delivery tasks
- `sessions`: stores active login sessions

## Current Project Structure

```text
7376231ME161/
├── Backend/
│   ├── db_schema.sql
│   ├── server.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
├── Frontend/
│   └── src/
│       ├── AppLayout/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── ToggleTheme/
├── resources
└── README.md
```

## How To Run

### Backend

1. Open the `Backend` folder
2. Configure `.env`
3. Make sure MySQL is running
4. Import `db_schema.sql`
5. Start the server

Example:

```powershell
cd Backend
npm install
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### Frontend

1. Open the `Frontend` folder
2. Install dependencies
3. Start Vite

Example:

```powershell
cd Frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:3000
```

## Important Implementation Notes

### Password Handling

The current implementation stores raw passwords directly because that was explicitly requested during development.

This is acceptable only for a demo or assignment environment.

For any real production system, this should be changed back to hashed passwords using `bcrypt`.

### Session Validation

The backend does not rely only on JWT verification. It also validates the token against the `sessions` table so logout properly invalidates access.

### Notification Read Behavior

Opening:

```text
/notifications/:id
```

marks that notification as read automatically.

## What Is Already Completed

- backend auth flow
- role-based access control
- HR notification sending flow
- HR user creation flow
- student notification feed
- student priority inbox
- single notification detail page
- dark/light theme support
- responsive layout
- frontend protected routes

## Suggested Future Improvements

- add backend validation library such as `zod` or `joi`
- restore secure password hashing
- add tests for backend controllers and frontend pages
- add refresh-token or session-expiry UX
- add real queue workers for email and in-app delivery processing
- split frontend bundle to reduce build size warning

## Summary

This project is a complete role-based notification platform for HR and students. It includes authentication, protected routing, user creation, notification broadcasting, history tracking, read-state handling, and a responsive themed frontend for both roles.
