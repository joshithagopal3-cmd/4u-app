# 4U App — Engineering College Platform

A centralized platform for engineering colleges that solves fragmented communication, improves student participation tracking, and encourages coding activity.

---

## Quick Start

```bash
# 1. Clone or download the project
cd 4u-app

# 2. Setup Backend
cd backend
npm install
cp .env.example .env          # Edit with your MongoDB URI
npm run seed                  # Load demo data
npm run dev                   # Start on http://localhost:5000

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
npm start                     # Start on http://localhost:3000
```

**Demo Credentials (after seeding):**
| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Student | student1@4uapp.edu      | student1234  |
| Teacher | priya@4uapp.edu         | teacher1234  |
| Admin   | admin@4uapp.edu         | admin1234    |

---

## Features

- **Event Management** — Create, filter, register for events
- **Smart Eligibility** — Auto-checks dept/year eligibility; "Attend Anyway" request flow
- **Coding Tracker** — LeetCode + CodeChef stats with mock fallback
- **Reward System** — Points, badges, leaderboard
- **Resume Generator** — Auto-generates resume from profile data; print to PDF
- **Teacher Dashboard** — Student activity, performance charts, override approvals
- **Student Profiles** — Public/private/college visibility toggle

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/events | Get all events (with filters) |
| POST | /api/events | Create event (teacher/admin) |
| GET | /api/events/:id | Get single event |
| PUT | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |
| GET | /api/events/:id/registrations | Event registrations |
| PUT | /api/events/:id/attendance/:sid | Mark attendance |
| POST | /api/registrations | Register for event |
| GET | /api/registrations/my | My registrations |
| GET | /api/registrations/pending-overrides | Pending requests |
| PUT | /api/registrations/:id/override | Approve/reject request |
| GET | /api/users/dashboard | Student dashboard data |
| GET | /api/users/teacher-dashboard | Teacher dashboard data |
| GET | /api/users/students | List students |
| GET | /api/users/leaderboard | Points leaderboard |
| GET | /api/users/:id/profile | Student profile |
| GET | /api/coding/stats | My coding stats |
| GET | /api/coding/leaderboard | Coding leaderboard |
| GET | /api/resume/data | Resume data |

---

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, React Router v6, Recharts, Axios
- **Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database:** MongoDB
- **APIs:** LeetCode Stats API, CodeChef API (mock fallback included)
