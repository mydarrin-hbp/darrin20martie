# Hybrid Sync Architecture

## Scope

This document captures the first practical synchronization layer between:

- public marketplace pages
- backoffice content management
- dynamic deviz pricing
- live order allocation status

## Phase 1

### Content and Design Sync

- Source of truth: `site_content_pages`
- Public API:
  - `GET /api/v1/public/pages/{slug}`
  - `GET /api/v1/public/sync/manifest`
  - `GET /api/v1/public/sync/site-content/stream`
- Admin save:
  - `PUT /api/v1/backoffice/site-content/{slug}`
- Behavior:
  - each save updates `updated_at`
  - manifest exposes a cache/version token via `content_version`
  - SSE stream emits `site_content.updated`

### Dynamic Catalog Pricing

- Source of truth:
  - catalog services
  - price analysis recipes
  - deviz rules
  - geography context
- Public API:
  - `GET /api/v1/public/sync/catalog-price/{slug}`
- Behavior:
  - public pages can fetch a live price preview
  - pricing is derived from the deviz engine, not hardcoded catalog text
  - fallback remains the static frontend catalog when local data is incomplete

### Allocation Status Sync

- Public APIs:
  - `GET /api/v1/public/sync/order-status/{order_ref}`
  - `GET /api/v1/public/sync/order-status/stream/{order_ref}`
- Admin API:
  - `POST /api/v1/backoffice/sync/order-status/{order_ref}`
- Behavior:
  - current implementation is an in-memory SSE broker
  - suitable for local integration and UI wiring
  - should be replaced with persistent order/event storage in cloud phase

## Phase 2

### Cloud Runtime

- Frontend: Cloud Run or GKE
- Backend: Cloud Run or GKE
- Database: Cloud SQL
- Attachments/media: GCS

### Production Hardening

- replace in-memory order status with persisted event log
- move cache/version invalidation to Redis or Pub/Sub
- add background worker for invoice and warranty generation
- expose AI-safe read APIs for RAG validation of:
  - service taxonomy
  - material availability
  - subcontractor availability
  - dynamic pricing context

### CI/CD

- Cloud Build pipeline gates:
  - backend tests
  - frontend typecheck/build
  - API contract validation for public sync endpoints
  - smoke checks against public pages and sync endpoints
