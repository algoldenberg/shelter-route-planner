"""
Middleware for logging all API requests to MongoDB
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from typing import Callable
from ..db.mongodb import get_database


class UsageLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs every API request to api_logs collection
    Captures: endpoint, method, status, response time, IP, GPS coordinates
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Время начала запроса
        start_time = time.time()
        
        # Парсим IP адрес
        ip_address = request.client.host if request.client else "unknown"
        
        # Парсим User-Agent
        user_agent = request.headers.get("user-agent", "")
        
        # Извлекаем GPS координаты из query params (если есть)
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        
        # Для маршрутов извлекаем start/end координаты
        start_lat = request.query_params.get("start_lat")
        start_lng = request.query_params.get("start_lng")
        end_lat = request.query_params.get("end_lat")
        end_lng = request.query_params.get("end_lng")
        
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
        
        # Извлекаем shelter_id из URL если это запрос к конкретному shelter
        # Например: /shelters/123/comments
        if "/shelters/" in request.url.path:
            path_parts = request.url.path.split("/")
            if len(path_parts) >= 3 and path_parts[2].isdigit():
                log_entry["shelter_id"] = path_parts[2]
        
        # Сохраняем в MongoDB асинхронно (fire-and-forget)
        try:
            db = get_database()
            await db.api_logs.insert_one(log_entry)
        except Exception as e:
            # Не ломаем запрос если логирование упало
            print(f"⚠️ Failed to log API request: {e}")
        
        return response