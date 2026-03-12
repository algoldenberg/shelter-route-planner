🛡️ Shelter Route Planner

Live Demo: shelternearyou.online

Web application for finding bomb shelters and building safe routes in Israel. Built during wartime as a portfolio DevOps project.

🎯 Key Features
Core Functionality

🗺️ Interactive Map — 12,639 shelters across Israel with real-time GPS tracking
🧭 Smart Navigation — Find nearest shelter with distance calculation
🚶 Safe Routes — Build routes through multiple shelters
📍 GPS Follow Mode — Live location tracking with compass heading

User Contributions

➕ Submit Shelters — Add new shelters via address search or map picking
🚫 Report Issues — Flag closed shelters, wrong coordinates, or blocked entrances (reviewed via DB)
💬 Comments & Ratings — Share shelter experiences with star ratings

Admin Panel

🔧 Full Admin Dashboard — Approve/reject new shelter submissions
📊 API Usage Statistics — Real-time request metrics from Shelter & Route services
✅ Verified Shelters — Mark shelters with manual verification status

Mobile & UX

📱 Mobile-First Design — Optimized touch interface with bottom sheets
🌐 Multi-Language — English, Hebrew, Russian
🔄 PWA Ready — Install as native app (iOS/Android)
🎨 Clean UI — Modern, accessible interface


📊 Database
12,639 verified shelters with geospatial indexing

Data by City (Detailed Classification):
- **Tel Aviv** — ~500 shelters (typed by category: public, school, parking, parking_storage, etc.)
- **Haifa** — ~205 shelters (typed by category)
- **In Development** — Ramat Gan, Maale Adumim, Rishon LeZion, Bat Yam, Holon, Beer Sheva

Data Sources:

Public Shelters Dataset
Community submissions (manual review via Admin panel)
Municipal databases (partial verification tracking)

Telegram Updates: https://t.me/+w1e0O207iQkxYTcy

🏗️ Architecture

Microservices Stack:

```
shelter-route-planner/
├── Nginx (port 80)                  # Reverse Proxy
│   ├── Frontend                     # React 18 + Vite (port 13000)
│   └── API Gateway                  # FastAPI (port 18000)
│       ├── Shelter Service          # FastAPI (port 18001)
│       │   ├── CRUD operations
│       │   ├── Admin panel
│       │   └── Submission management
│       ├── Route Service            # FastAPI (port 18002)
│       │   ├── OSRM routing
│       │   └── Usage statistics
│       ├── Walking Route Service    # FastAPI (port 18004)
│       │   └── Pedestrian routing optimization
│       └── Comment Service          # FastAPI (port 18003)
│           └── Ratings & reviews
│
├── Data Layer
│   ├── MongoDB 7.0                  # Geospatial indexing, GeoJSON
│   ├── Redis 7.0                    # Caching
│   └── OSRM Backend (port 15000)    # OpenStreetMap routing engine
│
└── Key Services:
    ├── API Gateway (services/api-gateway/) — Central request router, port 18000
    ├── Shelter Service (services/shelter-service/app/api/admin.py) — CRUD, submissions, admin panel
    ├── Route Service (services/route-service/) — OSRM routing + usage metrics
    ├── Walking Route Service (services/walking-route-service/) — Pedestrian routing optimization
    ├── Comment Service (services/comment-service/) — Ratings & reviews
    └── Usage Logging — Middleware tracks API requests for admin dashboard
```

Tech Stack

Backend: Python 3.12, FastAPI, Pydantic
Database: MongoDB 7.0 with geospatial indexes (GeoJSON)
Cache: Redis 7.0
Routing: OSRM (OpenStreetMap Routing Machine)
Frontend: React 18 + Vite, Leaflet.js, React Router
Deployment: Docker Compose, Nginx
CI/CD: GitHub Actions (planned)

Infrastructure

Hosting: VPS (1and1.com) at 83.229.70.64
Domain: shelternearyou.online
SSL: Let's Encrypt (nginx-certbot)
Monitoring: Docker logs, MongoDB metrics


🚀 Quick Start
Prerequisites

Docker 24.0+
Docker Compose 2.20+
4GB RAM minimum

Local Development
```bash
# Clone repository
git clone https://github.com/algoldenberg/shelter-route-planner.git
cd shelter-route-planner

# Start all services
docker-compose up -d

# Load shelter data (one-time)
docker-compose exec shelter-service python /app/data/load_to_mongodb.py

# Check services
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f api-gateway
```

**Local Development Access** (only on your machine):
- Frontend: http://localhost:13000
- API Gateway: http://localhost:18000 (localhost only)
- MongoDB: localhost:27017 (localhost only, development credentials)

⚠️ **SECURITY WARNING**: Never expose MongoDB, API ports, or OSRM to the internet without proper authentication and firewall rules.

---

## 📁 Project Structure
```
shelter-route-planner/
├── frontend/               # React application (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # AdminPage, InfoPage (paginated)
│   │   ├── services/      # API clients
│   │   └── utils/
│   └── Dockerfile
├── services/
│   ├── shelter-service/   # Shelter CRUD + submissions + admin
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── admin.py          # Admin panel logic
│   │   │   ├── models/
│   │   │   │   ├── shelter.py        # Shelter schema + location (GeoJSON)
│   │   │   │   └── usage_stats.py    # API usage tracking
│   │   │   └── middleware/
│   │   │       └── usage_logging.py  # Request logging
│   │   └── Dockerfile
│   ├── route-service/     # OSRM routing + statistics
│   │   ├── app/
│   │   │   └── middleware/
│   │   │       └── usage_logging.py  # Route request tracking
│   │   └── Dockerfile
│   └── comment-service/   # Comments & ratings
├── nginx/                 # Reverse proxy config
├── docker-compose.yml     # Local development
└── README.md
```

## 🔧 Development
Add New Feature

Create feature branch: git checkout -b feature/your-feature
Develop with hot reload (React + FastAPI auto-restart)
Test locally: docker-compose restart <service>
Commit: git commit -m "feat: add your feature"
Push and create PR

Deployment (Production)
```bash
# On server
cd /root/shelter-route-planner
git pull origin main
docker-compose down
docker system prune -af
docker-compose build --no-cache
docker-compose up -d
```

🐛 Known Issues & Roadmap

**Completed** ✅
- Admin panel with submission approval/rejection
- API usage statistics dashboard
- Shelter type classification (Tel Aviv, Haifa)
- Icon colors by shelter type

**In Progress** 🔄
- City data enrichment: Ramat Gan, Maale Adumim, Rishon LeZion, Bat Yam, Holon, Beer Sheva
- Verified shelter marker system (checkmark icon overlay)
- Verification status in shelter cards
- Pin placement UI (visual marker when user clicks on map)

**Planned** ⏳
- Full redesign → "IRan Shelter Map" branding
- Color scheme redesign
- Verification system (automated DB tracking for manually verified shelters)
- Batch shelter import tool
- Enhanced report handling UI (currently DB-only)



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

GitHub: @algoldenberg
Telegram: @goldenberga
WhatsApp: +972-50-696-7370


Status: ✅ Live in Production - Active development continues
Last Updated: 11.03.26
