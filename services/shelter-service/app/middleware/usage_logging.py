"""
Middleware for logging all API requests to MongoDB
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from typing import Callable, Optional
from ..db.mongodb import get_database


class UsageLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs every API request to api_logs collection
    Captures: endpoint, method, status, response time, IP, GPS coordinates, action type
    """
    
    def _detect_action_type(self, request: Request) -> Optional[str]:
        """
        Определяет тип действия на основе endpoint и параметров
        Возможные типы:
        - route_built: построение маршрута
        - address_search: поиск по адресу
        - location_search: поиск по GPS координатам (nearby)
        - shelter_view: просмотр конкретного укрытия
        - shelter_submit: отправка нового укрытия
        - shelter_report: жалоба на укрытие
        - comment_post: добавление комментария
        """
        path = request.url.path.rstrip('/')
        method = request.method
        
        
        if path == "/route/calculate" and method == "POST":
            return "route_built"
        
        
        if path == "/shelters/geocode" and method == "GET":
            return "address_search"
        
        
        if path == "/shelters/nearby" and method == "GET":
            return "location_search"
        
        
        if path.startswith("/shelters/") and method == "GET":
            parts = path.split("/")
            
            if len(parts) == 3 and parts[2] and parts[2] not in ["submit", "nearby", "geocode", "stats"]:
                return "shelter_view"
        
        
        if path == "/shelters/submit" and method == "POST":
            return "shelter_submit"
        
        
        if path.startswith("/shelters/") and path.endswith("/report") and method == "POST":
            return "shelter_report"
        
        
        if path.startswith("/comments/shelters/") and path.endswith("/comments") and method == "POST":
            return "comment_post"
        
        return None
    
    async def dispatch(self, request: Request, call_next: Callable):
        
        start_time = time.time()
        
        
        ip_address = request.client.host if request.client else "unknown"
        
        
        user_agent = request.headers.get("user-agent", "")
        
        
        action_type = self._detect_action_type(request)
        
        
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        
        
        start_lat = request.query_params.get("start_lat")
        start_lng = request.query_params.get("start_lng")
        end_lat = request.query_params.get("end_lat")
        end_lng = request.query_params.get("end_lng")
        
        
        address_query = request.query_params.get("address") or request.query_params.get("query")
        
        
        response = await call_next(request)
        
        
        response_time_ms = (time.time() - start_time) * 1000
        
        
        log_entry = {
            "timestamp": datetime.utcnow(),
            "endpoint": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "response_time_ms": round(response_time_ms, 2),
            "ip_address": ip_address,
            "user_agent": user_agent
        }
        
        if action_type:
            log_entry["action_type"] = action_type
        
        
        if latitude and longitude:
            try:
                log_entry["latitude"] = float(latitude)
                log_entry["longitude"] = float(longitude)
            except ValueError:
                pass
        
        
        if start_lat and start_lng and end_lat and end_lng:
            try:
                log_entry["route_start_lat"] = float(start_lat)
                log_entry["route_start_lng"] = float(start_lng)
                log_entry["route_end_lat"] = float(end_lat)
                log_entry["route_end_lng"] = float(end_lng)
            except ValueError:
                pass
        
        
        if address_query:
            log_entry["address_query"] = address_query
        
        
        if "/shelters/" in request.url.path:
            path_parts = request.url.path.split("/")
            if len(path_parts) >= 3 and path_parts[2]:
                
                if path_parts[2] not in ["submit", "nearby", "geocode", "stats"]:
                    log_entry["shelter_id"] = path_parts[2]
        
        
        try:
            db = get_database()
            await db.api_logs.insert_one(log_entry)
        except Exception as e:
            
            print(f"⚠️ Failed to log API request: {e}")
        
        return response