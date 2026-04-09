from __future__ import annotations

import threading
import time
from typing import Callable, TypeVar

T = TypeVar("T")

_CACHE: dict[str, tuple[float, object]] = {}
_LOCK = threading.Lock()


def _now() -> float:
    return time.time()


def get_cached(key: str) -> object | None:
    with _LOCK:
        record = _CACHE.get(key)
        if not record:
            return None
        expires_at, value = record
        if expires_at < _now():
            _CACHE.pop(key, None)
            return None
        return value


def set_cached(key: str, value: object, *, ttl_seconds: int = 60) -> object:
    with _LOCK:
        _CACHE[key] = (_now() + ttl_seconds, value)
    return value


def get_or_set(key: str, builder: Callable[[], T], *, ttl_seconds: int = 60) -> T:
    cached = get_cached(key)
    if cached is not None:
        return cached  # type: ignore[return-value]
    value = builder()
    set_cached(key, value, ttl_seconds=ttl_seconds)
    return value


def invalidate_prefix(prefix: str) -> int:
    removed = 0
    with _LOCK:
        for key in list(_CACHE.keys()):
            if key.startswith(prefix):
                _CACHE.pop(key, None)
                removed += 1
    return removed
