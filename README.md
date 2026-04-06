# 💰 Zorvyn Finance Backend System

## 🚀 Overview

Zorvyn Finance Backend System is a role-based financial data processing backend designed to power a finance dashboard.

It demonstrates:
- Clean API design
- Structured data modeling
- Role-based access control (RBAC)
- Aggregated analytics for dashboards
- Scalable backend architecture

This project was built as part of a backend engineering assessment to showcase real-world backend design and implementation skills.

---

## 🧠 Architecture Overview

Client (Dashboard UI)
        ↓
API Layer (Next.js Route Handlers)
        ↓
Business Logic (Services)
        ↓
Prisma ORM
        ↓
PostgreSQL Database

---

## 🔄 Request Flow

User → Auth API → Cookie Session  
     → Protected API → Role Validation  
     → Business Logic → Database Query  
     → Aggregation → JSON Response  

---

## 🧩 Tech Stack

- Backend: Next.js (App Router APIs)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Cookie-based
- Runtime: Node.js

---

## 👤 Role-Based Access Control (RBAC)

| Role     | Access |
|----------|--------|
| Viewer   | Dashboard (read-only) |
| Analyst  | Records + analytics |
| Admin    | Full access |

---

## 💳 Financial Data Model

### Record

- amount
- type (income / expense)
- category
- date
- notes
- userId

### User

- email
- password
- role
- status
- monthlyIncome (salary)

---

## ⚙️ Core Features

### 👤 User Management
- Register & login
- Role assignment
- Status control
- Secure access

---

### 💳 Records Management
- Create records
- Update records
- Delete records
- Filter by date, category, type

---

### 📊 Dashboard Analytics
- Monthly income (from user salary)
- Monthly expenses (from records)
- Yearly projections
- Category-wise expense breakdown
- Recent activities

---

### 🔐 Access Control

| Action            | Viewer | Analyst | Admin |
|------------------|--------|---------|-------|
| View dashboard   | ✅     | ✅      | ✅    |
| View records     | ❌     | ✅      | ✅    |
| Create records   | ❌     | ❌      | ✅    |
| Manage users     | ❌     | ❌      | ✅    |

---

### ⚠️ Validation & Error Handling
- Input validation
- Proper status codes
- Structured error responses
- Unauthorized protection

---

## 📁 Project Structure
app/
├── api/
│ ├── auth/
│ ├── records/
│ ├── analytics/
│ └── admin/
│
├── lib/
│ ├── prisma.ts
│ └── auth.ts
│
└── dashboard/

---

## 🔑 API Endpoints

### Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/verify


---

### Records

GET /api/records
POST /api/records
PATCH /api/records/:id
DELETE /api/records/:id


---

### Analytics

GET /api/analytics/user-summary


---

### Admin

GET /api/admin/user-analytics


---

## 🔄 Data Processing Logic

### Income
- Monthly income comes from User model
- Yearly income = monthlyIncome × 12

### Expense
- Calculated from records

### Balance

balance = income - expense



### Category Aggregation
Example:
Food → 5000
Travel → 2000
Shopping → 3000



---

## ⚙️ Setup Guide

### 1. Clone repository

git clone https://github.com/priti0317/Zorvyn-Finance-Backend-System.git

cd Zorvyn-Finance-Backend-System


---

### 2. Install dependencies
npm install


---

### 3. Setup environment variables

Create `.env` file:


DATABASE_URL="postgresql://user:password@localhost:5432/dbname"


---

### 4. Setup database

npx prisma generate

npx prisma db push

---

### 5. Run project
npm run dev

## 📌 Design Decisions

- ✔ Salary stored in User model (real-world approach)
- ✔ Expenses from transactions only
- ✔ Clean separation of concerns
- ✔ Role-based API enforcement
- ✔ Minimal but scalable architecture



---

## 📊 Evaluation Mapping

| Criteria        | Implementation                  |
|----------------|--------------------------------|
| Backend Design | Modular API structure          |
| Logic          | Clear business rules           |
| Functionality  | Full CRUD + analytics          |
| Code Quality   | Clean TypeScript               |
| Data Modeling  | Relational schema              |
| Validation     | Error handling                 |
| Documentation  | Detailed README                |
| Thoughtfulness | Real-world finance logic       |

---

## 🎯 Conclusion

This project reflects:

- Strong backend fundamentals  
- Real-world system thinking  
- Clean and scalable design  
- Practical financial data modeling  

It can be easily extended into a **production-ready finance platform**.

---

## 🔗 Repository

👉 https://github.com/priti0317/Zorvyn-Finance-Backend-System.git






