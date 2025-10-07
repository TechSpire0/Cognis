# backend/tests/test_auth.py
import pytest
from app.core.security import create_access_token, decode_access_token


def test_create_and_decode_token():
    payload = {"sub": "user-123", "role": "admin"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "user-123"
    assert decoded["role"] == "admin"
