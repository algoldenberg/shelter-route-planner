🛡️ Shelter Route Planner

Live Demo: shelternearyou.online

Web application for finding bomb shelters and building safe routes in Israel. Built during wartime as a portfolio DevOps project.

🎯 Key Features
Core Functionality

🗺️ Interactive Map — 12,639 shelters across Israel with real-time GPS tracking
🧭 Smart Navigation — Find nearest shelter with distance calculation
🚶 Safe Routes — Build routes through multiple shelters
📍 GPS Follow Mode — Live location tracking with compass heading
🎯 Route Planning Markers — Visual feedback for start/end points via address, GPS, or map click

User Contributions

➕ Submit Shelters — Add new shelters via address search or map picking
🚫 Report Issues — Flag closed shelters, wrong coordinates, or blocked entrances
💬 Comments & Ratings — Share shelter experiences with star ratings
📷 Photo Upload — Attach photos to submissions, reports, and comments (up to 5 photos, 10MB each)

Admin Panel

🔧 Full Admin Dashboard — Approve/reject new shelter submissions with photo preview
📊 API Usage Statistics — Real-time request metrics from Shelter & Route services
✅ Verified Shelters — Mark shelters with manual verification status
📸 Photo Management — View uploaded photos in submissions and reports

Mobile & UX

📱 Mobile-First Design — Optimized touch interface with bottom sheets
🌐 Multi-Language — English, Hebrew, Russian
🔄 PWA Ready — Install as native app (iOS/Android) with update notifications
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
│       ├── Comment Service          # FastAPI (port 18003)
│       │   └── Ratings & reviews
│       ├── Walking Route Service    # FastAPI (port 18004)
│       │   └── Pedestrian routing optimization
│       └── Photo Service            # FastAPI (port 18005)
│           ├── Google Drive integration
│           └── Image proxy endpoint
│
├── Data Layer
│   ├── MongoDB 7.0                  # Geospatial indexing, GeoJSON
│   ├── Redis 7.0                    # Caching
│   └── OSRM Backend (port 15000)    # OpenStreetMap routing engine
│
└── Key Services:
    ├── API Gateway (services/api-gateway/) — Central request router, port 18000
    ├── Shelter Service (services/shelter-service/) — CRUD, submissions, admin panel
    ├── Route Service (services/route-service/) — OSRM routing + usage metrics
    ├── Walking Route Service (services/walking-route-service/) — Pedestrian routing
    ├── Comment Service (services/comment-service/) — Ratings & reviews
    ├── Photo Service (services/photo-service/) — Google Drive storage + proxy
    └── Usage Logging — Middleware tracks API requests for admin dashboard
```

Tech Stack

Backend: Python 3.12, FastAPI, Pydantic
Database: MongoDB 7.0 with geospatial indexes (GeoJSON)
Cache: Redis 7.0
Storage: Google Drive API (OAuth2)
Routing: OSRM (OpenStreetMap Routing Machine)
Frontend: React 18 + Vite, Leaflet.js, React Router, TailwindCSS
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

**Local Development Access**:
- Frontend: http://localhost:13000
- API Gateway: http://localhost:18000
- MongoDB: localhost:27017

⚠️ **SECURITY WARNING**: Never expose MongoDB, API ports, or OSRM to the internet without proper authentication.

---

## 📁 Project Structure
```
shelter-route-planner/
├── frontend/               # React application (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── Map.jsx                    # Main map with markers
│   │   │   ├── ShelterPopup.jsx           # Photo gallery + comments
│   │   │   ├── PhotoUploader.jsx          # Universal photo upload
│   │   │   ├── RouteBuilder.jsx           # Route planning
│   │   │   └── PWAUpdateNotice.jsx        # PWA notifications
│   │   ├── pages/         
│   │   │   ├── AdminPage.jsx              # Admin with photo preview
│   │   │   └── InfoPage.jsx               # Documentation
│   │   ├── services/      # API clients
│   │   └── App.jsx        
│   └── Dockerfile
├── services/
│   ├── shelter-service/   # Shelter CRUD + admin
│   │   ├── app/api/admin.py          # Admin panel (photo support)
│   │   └── app/models/               # Pydantic schemas
│   ├── route-service/     # OSRM routing
│   ├── comment-service/   # Comments with photos
│   ├── photo-service/     # Google Drive integration
│   │   ├── app/google_drive.py       # OAuth2 + upload
│   │   └── app/main.py               # Proxy endpoint
│   └── api-gateway/       
│       └── nginx.conf                # /proxy/ route
├── docker-compose.yml     
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
# On server (via PuTTY SSH)
cd /root/shelter-route-planner
git pull origin main
docker-compose down
docker-compose build --no-cache 
docker-compose up -d
docker-compose ps
```

## 🎨 Recent Features

### v1.3.0 — Photo Upload System ✅ COMPLETE (23.03.26)

**Photo Upload & Display**
- ✅ **Universal PhotoUploader Component** — Drag-n-drop, camera (mobile), gallery selection
- ✅ **Google Drive Storage** — OAuth2 integration with organized folder structure
- ✅ **Photo Support Everywhere** — Submissions, reports, and comments
- ✅ **Proxy Endpoint** — `/proxy/{file_id}` bypasses CORS and rate limits
- ✅ **Photo Galleries** — Shelter popups show all photos (general + per-comment)
- ✅ **Admin Panel Integration** — Photo preview in submissions and reports tables
- ✅ **Lightbox Viewer** — Click to view full-size photos
- ✅ **Auto-Comment Photos** — Photos automatically copied to auto-comment on approval

**Technical Implementation**
- New microservice: `photo-service` (port 18005)
- Google Drive API with OAuth2 authentication
- Nginx `/proxy/` route for image serving
- Photos stored: submissions/, reports/, comments/ folders
- MongoDB stores proxy URLs for fast retrieval
- Frontend: ShelterPopup and AdminPage photo galleries

### Other Completed Features ✅

- Admin panel with submission approval/rejection
- API usage statistics dashboard
- Shelter type classification (Tel Aviv, Haifa)
- Icon colors by shelter type
- Route planning visual markers (📍🏁)
- Search center visualization (🔍)
- PWA update notifications

### In Progress 🔄

- City data enrichment: Ramat Gan, Maale Adumim, Rishon LeZion, Bat Yam, Holon, Beer Sheva
- Verified shelter marker system (checkmark icon overlay)

### Planned ⏳

- Full redesign → "IRan Shelter Map" branding
- Batch shelter import tool
- Enhanced report handling UI
- Geocoding feature (address → coordinates)


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
- GitHub: @algoldenberg
- Email: shelternearyou@gmail.com

Status: ✅ Live in Production - Active development continues
Last Updated: 23.03.26