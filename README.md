
# 🧾 Pick & Go — TFG 2025

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

### 1. Clone the repo

```bash
git clone https://github.com/your-username/pick-and-go.git
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
```

### Backend

```bash
cd server
dotnet run
```

Then visit:

- Swagger UI: [http://localhost:5210/swagger](http://localhost:5210/swagger)
- Test endpoint: [http://localhost:5210/weatherforecast](http://localhost:5210/weatherforecast)

---

## 📌 Notes

- HTTPS may need to be configured in `launchSettings.json`
- `.env` and `appsettings.Development.json` are git-ignored for security
