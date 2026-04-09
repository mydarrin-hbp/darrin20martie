from __future__ import annotations

import logging
import time
from typing import Any

from fastapi import FastAPI, Request
from sqlalchemy import event
from sqlalchemy.engine import Engine


LOGGER = logging.getLogger("mydarrin.observability")
SLOW_QUERY_MS = 200
SLOW_REQUEST_MS = 600


def _configure_logging() -> None:
    if LOGGER.handlers:
        return
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def setup_observability(app: FastAPI, engine: Engine) -> None:
    _configure_logging()

    @app.middleware("http")
    async def _request_logger(request: Request, call_next):
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            LOGGER.exception("Unhandled exception on %s %s", request.method, request.url.path)
            raise
        duration_ms = (time.perf_counter() - start) * 1000
        if duration_ms >= SLOW_REQUEST_MS:
            LOGGER.warning(
                "Slow request %s %s (%.1f ms)",
                request.method,
                request.url.path,
                duration_ms,
            )
        return response

    @event.listens_for(engine, "before_cursor_execute")
    def _before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        context._query_start_time = time.perf_counter()

    @event.listens_for(engine, "after_cursor_execute")
    def _after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        start_time = getattr(context, "_query_start_time", None)
        if start_time is None:
            return
        duration_ms = (time.perf_counter() - start_time) * 1000
        if duration_ms >= SLOW_QUERY_MS:
            snippet = " ".join(str(statement).split())[:300]
            LOGGER.warning("Slow SQL (%.1f ms): %s", duration_ms, snippet)
