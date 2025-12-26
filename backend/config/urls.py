"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    return JsonResponse({'status': 'ok'})


def db_check(request):
    """DB 연결 테스트"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            result = cursor.fetchone()
        return JsonResponse({'status': 'ok', 'db': 'connected', 'result': result[0]})
    except Exception as e:
        return JsonResponse({'status': 'error', 'db': 'disconnected', 'error': str(e)}, status=500)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/db-check/', db_check),
]
