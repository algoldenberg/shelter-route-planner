"""
Middleware for logging all API requests to MongoDB
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from typing import Callable, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os


class UsageLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs every API request to api_logs collection
    Captures: endpoint, method, status, response time, IP, GPS coordinates, action type
    """
    
    def __init__(self, app):
        super().__init__(app)
        # Подключаемся к MongoDB
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://admin:changeme123@shelter-mongodb:27017")
        self.client = AsyncIOMotorClient(mongodb_url)
        self.db = self.client.shelter_planner
    
    def _detect_action_type(self, request: Request) -> Optional[str]:
        """
        Определяет тип действия на основе endpoint и параметров
        """
        path = request.url.path.rstrip('/')  # Убираем слеш в конце
        method = request.method
        
        # Построение маршрута (POST /route/calculate)
        if path == "/route/calculate" and method == "POST":
            return "route_built"
        
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
        
        # Сохраняем в MongoDB асинхронно (fire-and-forget)
        try:
            await self.db.api_logs.insert_one(log_entry)
        except Exception as e:
            # Не ломаем запрос если логирование упало
            print(f"⚠️ Failed to log API request: {e}")
        
        return response