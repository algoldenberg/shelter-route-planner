🛡️ Shelter Route Planner
Live Demo: shelternearyou.online
Web application for finding bomb shelters and building safe routes in Israel. Built during wartime as a portfolio DevOps project.

🎯 Key Features
Core Functionality

🗺️ Interactive Map — 12,234+ shelters across Israel with real-time GPS tracking
🧭 Smart Navigation — Find nearest shelter with distance calculation
🚶 Safe Routes — Build routes through multiple shelters
📍 GPS Follow Mode — Live location tracking with compass heading

User Contributions

➕ Submit Shelters — Add new shelters via address search or map picking
🚫 Report Issues — Flag closed shelters, wrong coordinates, or blocked entrances
💬 Comments & Ratings — Share shelter experiences with star ratings

Mobile & UX

📱 Mobile-First Design — Optimized touch interface with bottom sheets
🌐 Multi-Language — English, Hebrew, Russian
🔄 PWA Ready — Install as native app (iOS/Android)
🎨 Clean UI — Modern, accessible interface


📊 Database
12,234 verified shelters with geospatial indexing
Data Sources:

Public Shelters Dataset
Community submissions (manual review)

Telegram Updates: https://t.me/+w1e0O207iQkxYTcy

🏗️ Architecture
Microservices Stack
┌─────────────────┐
│   Nginx (80)    │ ← Reverse Proxy
└────────┬────────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
┌───▼──────┐              ┌────────▼──────┐
│ Frontend │              │   API Gateway │
│  (React) │              │   (FastAPI)   │
└──────────┘              └───────┬───────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
      ┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
      │ Shelter Service│  │Route Service│  │Comment Service  │
      │   (FastAPI)    │  │  (FastAPI)  │  │   (FastAPI)     │
      └───────┬────────┘  └──────┬──────┘  └────────┬────────┘
              │                   │                   │
         ┌────┴───────────────────┴───────────────────┴────┐
         │                                                  │
    ┌────▼─────┐                                      ┌────▼────┐
    │ MongoDB  │                                      │  Redis  │
    │ (Geo)    │                                      │ (Cache) │
    └──────────┘                                      └─────────┘
Tech Stack

Backend: Python 3.12, FastAPI, Pydantic
Database: MongoDB 7.0 with geospatial indexes (GeoJSON)
Cache: Redis 7.0
Routing: OSRM (OpenStreetMap Routing Machine)
Frontend: React 18 + Vite, Leaflet.js, React Router
Deployment: Docker Compose, Nginx
CI/CD: GitHub Actions (planned)

Infrastructure

Hosting: VPS (1and1.com)
Domain: shelternearyou.online
SSL: Let's Encrypt (nginx-certbot)
Monitoring: Docker logs, MongoDB metrics


🚀 Quick Start
Prerequisites

Docker 24.0+
Docker Compose 2.20+
4GB RAM minimum

Local Development
bash# Clone repository
git clone https://github.com/yourusername/shelter-route-planner.git
cd shelter-route-planner

# Start all services
docker-compose up -d

# Load shelter data (one-time)
docker-compose exec shelter-service python /app/data/load_to_mongodb.py

# Check services
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f shelter-service
```

**Access**:
- Frontend: http://localhost:3000
- API: http://localhost:18001
- MongoDB: localhost:27017

---

## 📁 Project Structure
```
shelter-route-planner/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   └── services/      # API clients
│   └── Dockerfile
├── services/
│   ├── shelter-service/   # Shelter CRUD + submissions
│   ├── route-service/     # OSRM route calculation
│   └── comment-service/   # Comments & ratings
├── nginx/                 # Reverse proxy config
├── docker-compose.yml     # Local development
└── README.md

🔧 Development
Add New Feature

Create feature branch: git checkout -b feature/your-feature
Develop with hot reload (React + FastAPI auto-restart)
Test locally: docker-compose restart <service>
Commit: git commit -m "feat: add your feature"
Push and create PR

Database Operations
bash# MongoDB shell
docker exec -it shelter-mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

# View pending submissions
use shelter_planner
db.shelter_submissions.find({status: "pending"}).pretty()

# Approve submission
db.shelter_submissions.updateOne({_id: ObjectId("ID")}, {$set: {status: "approved"}})
Deployment (Production)
bash# On server
cd /root/shelter-route-planner
git pull origin main
docker-compose down
docker system prune -af
docker-compose build --no-cache
docker-compose up -d

🐛 Known Issues

✅ Fixed: iOS double-tap on report form (disabled Leaflet Popup on mobile)
⏳ Planned: Admin panel for reviewing submissions
⏳ Planned: Batch shelter import tool


📚 Documentation

BACKLOG.md — Project backlog (7 phases)
API Docs — Interactive Swagger UI
MongoDB Admin Guide — Database operations


🤝 Contributing
This is a portfolio project, but suggestions are welcome!

Open an issue with your idea
Fork the repository
Create a feature branch
Submit a pull request

Community submissions (new shelters, reports) go through manual review.

📝 License
MIT License - feel free to use for learning/portfolio purposes.

👨‍💻 Author
Alex Goldenberg
Portfolio Project - DevOps & Full-Stack Development
Built during conflict in Israel 🇮🇱
Contact:

Telegram: @goldenberga
WhatsApp: +972-50-696-7370


Status: ✅ Live in Production - Active development continues
Last Updated: 06.03.26