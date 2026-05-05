# EdgeIQ

[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-orange)](https://firebase.google.com/)
[![Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-deployed-blue)](https://cloud.google.com/run)

EdgeIQ is an AI-powered quantitative intelligence platform built for prediction market traders. It aggregates live market data, runs expected-value (EV) and calibration models, generates AI-driven trading signals via Gemini, and provides portfolio tracking and backtesting tools — all in one unified interface.

**Live URLs**
- Frontend: [https://edgeiq-frontend-981082317040.us-central1.run.app](https://edgeiq-frontend-981082317040.us-central1.run.app)
- Backend: [https://edgeiq-backend-981082317040.us-central1.run.app](https://edgeiq-backend-981082317040.us-central1.run.app)

**API Documentation**
- Swagger UI: [https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/swagger/](https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/swagger/)
- ReDoc: [https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/redoc/](https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/redoc/)
- OpenAPI Schema: `/api/schema/`

## What Problem It Solves

Prediction markets are noisy. Prices move fast, EV is hard to compute in real time, and most traders lack systematic tools to track edge, calibrate beliefs, and size positions. EdgeIQ cuts through the noise by scanning markets from the Bayse Markets API, running quant models on the backend, surfacing high-confidence signals generated with Gemini AI, and letting traders backtest strategies before they deploy capital.

## Who It's For

- Prediction market traders who want data-driven signals, not gut feel.
- Quant-oriented bettors who care about calibration, EV, and position sizing.
- Teams building systematic strategies over event-derivative markets.

## High-Level Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   React/Vite │──────▶│ Django / DRF │──────▶│   Firestore  │
│   (Cloud Run)│◀──────│  (Cloud Run) │◀──────│  (Firebase)  │
└──────────────┘      └──────────────┘      └──────────────┘
         │                     │
         │              ┌──────┴──────┐
         │              │             │
         │         ┌────┴────┐  ┌────┴────┐
         │         │ Gemini  │  │  Bayse  │
         │         │   AI    │  │ Markets │
         │         └─────────┘  └─────────┘
         │
   ┌─────┴─────┐
   │  Firebase │
   │    Auth   │
   └───────────┘
```

- **Frontend** — React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui. Deployed as a static container on Cloud Run.
- **Backend** — Django REST Framework with a Firestore-only persistence layer (via firebase-admin). Stateless, horizontally scalable.
- **Auth** — Firebase Authentication. The frontend handles sign-up/sign-in; the backend verifies ID tokens via Firebase Admin SDK middleware.
- **AI** — Gemini AI powers the market analysis engine and signal-generation pipeline. Market data and computed features are fed into Gemini to produce directional signals, confidence scores, and rationale.
- **Markets Data** — Bayse Markets API (relay.bayse.markets) is the primary source for prediction market events, order books, and resolution data.
- **Task Queue** — Celery + Redis handle async scanning, periodic signal generation, and long-running backtests.
- **API Docs** — Auto-generated via drf-spectacular; served at `/api/docs/swagger/` and `/api/docs/redoc/`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Backend | Django 5.2, Django REST Framework, drf-spectacular |
| Auth | Firebase Authentication (client + Admin SDK) |
| Database | Firestore (via firebase-admin) |
| AI | Gemini AI (google-genai / google-generativeai) |
| Task Queue | Celery + Redis + django-celery-beat |
| Deployment | Google Cloud Run |
| External API | Bayse Markets API |

## Repository Layout

- [`app/`](./app/README.md) — React frontend source, build config, and deployment scripts.
- [`backend/`](./backend/README.md) — Django backend, API routes, models, quant logic, and Celery tasks.

## Team

Built by a 4-person team: 2 frontend engineers (React, UI/UX, data visualization) and 2 backend engineers (Django, quant models, infrastructure, DevOps).
