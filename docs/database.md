# Database Architecture & Mongoose Schemas

- **User**: Name, Email, Password (Bcrypt), Role (`admin`, `trainer`, `member`), Refresh Tokens.
- **WorkoutPlan**: Title, Member ID, Trainer ID, Exercises (Name, Sets, Reps).
- **DietPlan**: Title, Member ID, Calorie Target, Meals, Macros.
- **Attendance**: Member ID, Check-in Time, Method (`QR_CODE`, `MANUAL`).
- **Payment**: Invoice Number, Member ID, Amount, Payment Method, Status (`paid`, `pending`).
- **Class**: Title, Trainer ID, Timing, Max Capacity, Booked Members.
