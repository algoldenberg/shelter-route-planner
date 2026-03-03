# 🛡️ Shelter Route Planner

Web application for building safe routes through bomb shelters in Israel with GPS tracking and automatic emergency mode.

## 🎯 Key Features

- **GPS Live Tracking** — real-time movement tracking
- **Safe Routes** — route planning through shelters
- **Emergency Mode** 🚨 — automatic activation during attacks with navigation to nearest shelter
- **Circular Walks** — walking routes based on user preferences (parks, cafes)
- **Comments** — user reviews for shelters
- **Offline Mode** — works without internet (PWA)
- **Compass** — shows direction to shelter

## 📊 Database

**12,234 shelters** across Israel

**Data Source**: [Public Shelters in Israel](https://maps.app.goo.gl/Kf5x3LqHqiKh4vPM6)  
**Telegram Channel**: https://t.me/+w1e0O207iQkxYTcy

## 🏗️ Architecture

### Microservices
- **API Gateway** (FastAPI) — entry point
- **Shelter Service** — CRUD operations for shelters
- **Route Service** — route calculation
- **Comment Service** — user comments
- **Walking Route Service** — circular routes
- **Alert Service** — Pikud HaOref API integration

### Tech Stack
- **Backend**: Python 3.12, FastAPI
- **Database**: MongoDB + geospatial indexes
- **Cache**: Redis
- **Frontend**: React 18, Leaflet.js
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions

## 🚀 Quick Start
```bash
# Start all services via Docker Compose
docker-compose up -d

# Load shelter data
docker-compose exec shelter-service python /app/data/load_to_mongodb.py
```

## 📄 Documentation

- [BACKLOG.md](./BACKLOG.md) — Project backlog

---

**Status**: 🚧 In development - Sprint 1.1