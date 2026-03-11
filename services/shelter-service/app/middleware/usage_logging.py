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
        path = request.url.path
        method = request.method
        
        # Построение маршрута
        if path == "/route" and method == "GET":
            return "route_built"
        
        # Поиск по адресу (geocoding)
        if path == "/shelters/geocode" and method == "GET":
            return "address_search"
        
        # Поиск ближайших укрытий (по GPS)
        if path == "/shelters/nearby" and method == "GET":
            return "location_search"
        
        # Просмотр конкретного укрытия
        if path.startswith("/shelters/") and method == "GET":
            parts = path.split("/")
            if len(parts) == 3 and parts[2]:  # /shelters/{id}
                return "shelter_view"
        
        # Отправка нового укрытия
        if path == "/shelters/submit" and method == "POST":
            return "shelter_submit"
        
        # Жалоба на укрытие
        if path.startswith("/shelters/") and path.endswith("/report") and method == "POST":
            return "shelter_report"
        
        # Комментарий к укрытию
        if path.startswith("/shelters/") and path.endswith("/comments") and method == "POST":
            return "comment_post"
        
        return None
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Время начала запроса
        start_time = time.time()
        
        # Парсим IP адрес
        ip_address = request.client.host if request.client else "unknown"
        
        # Парсим User-Agent
        user_agent = request.headers.get("user-agent", "")
        
        # Определяем тип действия
        action_type = self._detect_action_type(request)
        
        # Извлекаем GPS координаты из query params (если есть)
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        
        # Для маршрутов извлекаем start/end координаты
        start_lat = request.query_params.get("start_lat")
        start_lng = request.query_params.get("start_lng")
        end_lat = request.query_params.get("end_lat")
        end_lng = request.query_params.get("end_lng")
        
        # Для поиска по адресу
        address_query = request.query_params.get("address") or request.query_params.get("query")
        
        # Выполняем запрос
        response = await call_next(request)
        
        # Время выполнения в миллисекундах
        response_time_ms = (time.time() - start_time) * 1000
        
        # Создаём лог запись
        log_entry = {
            "timestamp": datetime.utcnow(),
            "endpoint": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "response_time_ms": round(response_time_ms, 2),
            "ip_address": ip_address,
            "user_agent": user_agent
        }
        
        # Добавляем тип действия
        if action_type:
            log_entry["action_type"] = action_type
        
        # Добавляем GPS координаты если есть
        if latitude and longitude:
            try:
                log_entry["latitude"] = float(latitude)
                log_entry["longitude"] = float(longitude)
            except ValueError:
                pass
        
        # Добавляем данные маршрута если есть
        if start_lat and start_lng and end_lat and end_lng:
            try:
                log_entry["route_start_lat"] = float(start_lat)
                log_entry["route_start_lng"] = float(start_lng)
                log_entry["route_end_lat"] = float(end_lat)
                log_entry["route_end_lng"] = float(end_lng)
            except ValueError:
                pass
        
        # Добавляем адрес запроса если есть
        if address_query:
            log_entry["address_query"] = address_query
        
        # Извлекаем shelter_id из URL если это запрос к конкретному shelter
        # Например: /shelters/123 или /shelters/123/comments
        if "/shelters/" in request.url.path:
            path_parts = request.url.path.split("/")
            if len(path_parts) >= 3 and path_parts[2]:
                # Проверяем что это не служебный endpoint (submit, nearby, geocode)
                if path_parts[2] not in ["submit", "nearby", "geocode", "stats"]:
                    log_entry["shelter_id"] = path_parts[2]
        
        # Сохраняем в MongoDB асинхронно (fire-and-forget)
        try:
            db = get_database()
            await db.api_logs.insert_one(log_entry)
        except Exception as e:
            # Не ломаем запрос если логирование упало
            print(f"⚠️ Failed to log API request: {e}")
        
        return response