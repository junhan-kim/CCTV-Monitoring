"""
초기 admin 계정 생성 스크립트
컨테이너 시작 시 실행됨
"""
import os
import sys

# 프로젝트 루트를 path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

username = os.environ.get('DJANGO_ADMIN_USER', 'admin')
password = os.environ.get('DJANGO_ADMIN_PASSWORD', 'admin')
email = os.environ.get('DJANGO_ADMIN_EMAIL', 'admin@test.com')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser "{username}" created.')
else:
    print(f'Superuser "{username}" already exists.')
