
# 🧾 Pick & Go

**Pick & Go** is a progressive web application (PWA) designed to streamline food ordering during school breaks.  
Employees define which products are available each day based on ingredients, and clients place orders to avoid unnecessary queues.

---

## 🚀 Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- PWA support via `vite-plugin-pwa`

### Backend
- ASP.NET Core Web API
- Entity Framework Core (SQL Server)
- Swagger for API testing

---

## 🔧 Local Setup

### 0. Prerequisites

- **Node.js** (recommended LTS version)  
  https://nodejs.org/

- **.NET 8.0 SDK**  
  https://dotnet.microsoft.com/en-us/download/dotnet/8.0

- **SQL Server 2019**  
  https://www.visual-expert.com/ES/visual-expert-blog/posts2020/guia-instalacion-sql-server-2019-visual-expert.html

- **SQL Server Management Studio (SSMS) 19**  
  https://learn.microsoft.com/en-us/sql/ssms/release-notes-ssms?view=sql-server-ver15#more-downloads

---

### 1. Clone the repo

```bash
git clone https://github.com/IvanGonzalo22/pick-and-go.git
cd pick-and-go
```

### 2. Environment variables

Create a `.env` file based on this template:

```env
# Frontend (client)
VITE_API_URL=https://localhost:5001/api

# Backend (server)
DB_CONNECTION=Server=YOUR_SERVER;Database=PickAndGoDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;
```

---

## ▶️ Run the app

### Frontend

```bash
cd client
npm install
npm run dev
npm run build
npm run preview
```

### Backend

```bash
cd server
dotnet restore
dotnet ef database update
dotnet run
```

Then visit:

Frontend:
https://localhost:5173

Backend Endpoints:
https://localhost:5001/auth
https://localhost:5001/products
https://localhost:5001/cart
https://localhost:5001/orders
https://localhost:5001/payments
https://localhost:5001/history

Swagger UI:
https://localhost:5001/swagger

---

## 📌 Notes

- HTTPS may need to be configured in `launchSettings.json`
- `.cert` and `appsettings.json` are git-ignored for security
