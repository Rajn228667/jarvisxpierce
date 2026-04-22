# Pierce X Hail Mery

> Премиум AI-экосистема для образования, бизнес-операций, финансовой безопасности и аналитики. Хакатон-MVP для Kazakhstan AI Hackathon.

**Стек:** ASP.NET Core 8 · Entity Framework Core · SQLite/SQL Server · React 18 + TypeScript · TailwindCSS · Recharts · Framer Motion · Groq AI (llama-3.3-70b) · MailKit + MailHog · JWT + refresh tokens

![stack](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet) ![react](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![ts](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript) ![license](https://img.shields.io/badge/license-MIT-111)

---

## 🎯 Что внутри

**Ядро платформы**
- Executive Dashboard — KPI, charts, activity feed, live metrics
- Student CRM — профили, GPA, посещаемость, стипендии, AI dropout score
- Finance — счета, оплаты, задолженности, cashflow
- Vacancies & Internships — AI-ранжирование кандидатов
- AI Assistant — мультиконтекстный чат-агент (Groq)
- Illegal Resources Monitor — AI-анализ доменов (scam/casino/phishing/pyramid), кейсы расследований
- Notifications center, Profile & device management, Settings

**Security & Auth**
- JWT + refresh tokens
- 6-значная email-верификация (MailHog в dev)
- Trusted devices, device fingerprinting
- Role-based access (SuperAdmin, Director, Manager, HR, Teacher, Curator, Student, …)
- Audit log на критические действия

**Design**
- Dark luxury UI в духе [killianherzer.com](https://killianherzer.com/): matte black, graphite, gold, brand violet
- Glass morphism, layered depth, premium анимации (Framer Motion)
- i18n: RU (default), KZ, EN
- Presentation mode с seed-данными

---

## 🚀 Быстрый старт (Docker Compose)

```bash
git clone https://github.com/Rajn228667/pierce-x-hail-mery.git
cd pierce-x-hail-mery
cp .env.example .env            # заполните JWT_SECRET и (опционально) GROQ_API_KEY
docker compose up --build
```

После запуска:

| Сервис        | URL                         |
|---------------|-----------------------------|
| Frontend      | http://localhost:8080       |
| Backend API   | http://localhost:5080       |
| Swagger       | http://localhost:5080/swagger |
| MailHog UI    | http://localhost:8025       |

### 🔑 Демо-учётка

```
email:    admin@piercex.kz
password: Admin123!
role:     SuperAdmin
```

Seed создаёт: 60 студентов, 8 преподавателей, компании + вакансии с откликами, счета/платежи, 13 подозрительных доменов, 5 fraud-кейсов, notifications, AI-чаты, audit log.

---

## 🧑‍💻 Локальная разработка (без Docker)

### Backend
```bash
cd backend/src/PierceX.Api
dotnet restore
dotnet run --urls "http://localhost:5080"
```
При старте автоматически создаётся SQLite-база `piercex.db` и накатывается seed.

### Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173 (proxy → backend :5080)
```

### Email (MailHog)
```bash
docker run --rm -p 1025:1025 -p 8025:8025 mailhog/mailhog:v1.0.1
```
Ящик входящих: http://localhost:8025

---

## ⚙️ Конфигурация

Все настройки — через `appsettings.json` и переменные окружения (двойное подчёркивание вместо `:`).

| Переменная                   | По умолчанию                     | Что делает                     |
|------------------------------|----------------------------------|--------------------------------|
| `JWT_SECRET` / `Jwt__Secret` | dev-only                         | Ключ подписи access/refresh    |
| `GROQ_API_KEY`               | —                                | AI-анализ, чат, CV-matching. Без ключа — детерминированный fallback |
| `Database__Provider`         | `sqlite`                         | `sqlite` или `sqlserver`       |
| `ConnectionStrings__Default` | `Data Source=piercex.db`         | Строка подключения             |
| `Smtp__Host` / `Smtp__Port`  | `localhost` / `1025`             | SMTP для верификации           |
| `Cors__Origins__0`           | `http://localhost:5173`          | Разрешённые origin'ы           |

### Production

- Смените `JWT_SECRET` на случайную строку ≥ 32 символов
- Переключите `Database__Provider=sqlserver` и укажите `ConnectionStrings__Default`
- Замените MailHog на реальный SMTP / SendGrid
- Выставьте `ASPNETCORE_ENVIRONMENT=Production`

---

## 🗂 Структура репозитория

```
backend/
  PierceX.sln
  src/
    PierceX.Domain/          # Entities, enums
    PierceX.Application/     # Services, DTOs, abstractions (clean architecture)
    PierceX.Infrastructure/  # EF Core, Persistence, Groq, Email
    PierceX.Api/             # Controllers, Program.cs, appsettings
frontend/
  src/
    pages/                   # Dashboard, Students, Finance, Vacancies, Security, AI, Profile, Notifications, Settings
    components/              # UI kit (Card, Button, DataTable, Badge, …)
    layouts/                 # AppShell, AuthLayout
    lib/                     # api client, utils
    store/                   # zustand (auth, ui)
    i18n/                    # ru / kz / en
docker/
  backend.Dockerfile
  frontend.Dockerfile
  nginx.conf
docker-compose.yml
```

---

## 📚 API

Swagger UI: http://localhost:5080/swagger

Ключевые группы:
- `/api/auth/*` — login, register, verify, refresh, logout, forgot/reset password
- `/api/dashboard/*` — overview, trends, activity
- `/api/students/*` — список, профиль, update, export CSV
- `/api/finance/*` — invoices, pay, overview, export
- `/api/vacancies/*` — list, detail (с AI match)
- `/api/security/*` — domains, scan, fraud-cases, overview
- `/api/ai/chats/*` — чаты и сообщения
- `/api/profile/me`, `/api/profile/devices/*` — профиль, устройства
- `/api/notifications/*`

Все защищённые ручки требуют `Authorization: Bearer <accessToken>`.

---

## 🧪 Smoke-тест

```bash
# получить токен
TOKEN=$(curl -s -X POST http://localhost:5080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@piercex.kz","password":"Admin123!"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')

# дёргаем дашборд
curl -s http://localhost:5080/api/dashboard/overview -H "Authorization: Bearer $TOKEN" | head -c 400
```

---

## 🧭 Scope / Roadmap

Это **хакатон-MVP**: 5 модулей из 12 запланированных реализованы полностью с seed-данными.
На roadmap: Teacher/Student/Parent/Employer порталы, HR, Inventory, Reporting Center, Anti-Gambling AI, Procurement AI, OpenAI Challenge, SignalR real-time, PostgreSQL DWH, Hangfire jobs.

---

## 📝 License

MIT.
