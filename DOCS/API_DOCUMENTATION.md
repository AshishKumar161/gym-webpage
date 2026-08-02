# A² ReVamp Gym — REST API Documentation v1

Base URL: `http://localhost:5000/api/v1`

---

## 🔑 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Register a new member or trainer account.
- **Body**: `{ "name": "String", "email": "String", "password": "String", "phone": "String", "role": "member|trainer" }`
- **Response**: `201 Created` with User data and JWT token.

### `POST /auth/login`
Authenticate user credentials.
- **Body**: `{ "email": "String", "password": "String" }`
- **Response**: `200 OK` with Access Token & `httpOnly` Refresh Token cookie.

### `POST /auth/verify-otp`
Verify 6-digit numeric OTP code sent to user email.
- **Body**: `{ "email": "String", "otp": "123456" }`

---

## 🛡️ 2. Admin Endpoints (`/admin`)

### `GET /admin/analytics` (Protected: Admin)
Retrieves total revenue, active member count, trainer count, and daily attendance totals.

### `GET /admin/users?role=member` (Protected: Admin)
Lists all users filtered by role.

---

## 🤖 3. AI Suite Endpoints (`/ai`)

### `POST /ai/generate-workout`
Generates customized workout routine.
- **Body**: `{ "targetMuscle": "Chest", "fitnessLevel": "Intermediate", "equipment": "Dumbbells" }`

### `POST /ai/generate-diet`
Generates macro & calorie diet schedule.
- **Body**: `{ "calorieTarget": 2200, "goal": "Weight Loss", "dietType": "High Protein" }`

---

## 🏋️ 4. Class & Attendance Endpoints (`/classes`, `/attendance`)

### `GET /classes`
Returns scheduled group fitness classes.

### `POST /attendance/check-in`
Logs digital QR Code check-in timestamp.
