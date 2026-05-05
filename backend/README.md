# EdgeIQ Backend

Django REST Framework API for the EdgeIQ trading platform. Handles Firebase-authenticated requests, integrates with the Bayse Markets API for prediction market data, persists user-scoped data to Firestore, runs quant models, and orchestrates AI-driven signal generation via Gemini.

## What It Does

- **Market Data** — Fetches and caches prediction market events from Bayse Markets API.
- **Signals** — Runs EV, calibration, and sentiment pipelines; generates actionable trade signals using Gemini AI.
- **Portfolio** — Tracks user positions, computes live PnL, and records trade history (all scoped by Firebase UID).
- **Backtesting** — Replays historical signals against market outcomes to measure strategy performance.
- **Users** — Stores per-user preferences, calibration scores, and onboarding state in Firestore.
- **Health & Observability** — Lightweight health-check endpoint for Cloud Run probes.

## Architecture

```
Request
   │
   ▼
Firebase Token Verification (auth_app middleware)
   │
   ▼
DRF ViewSets / API Views
   │
   ├──▶ Bayse Markets API (fetch markets, prices)
   ├──▶ Gemini AI (generate signals, analysis)
   └──▶ Firestore (read/write user-scoped documents)
   │
   ▼
Response (JSON)
```

All write operations to Firestore pass through `utils/firebase_client.py`, which adds deterministic document IDs, retries, and structured logging. The `users`, `markets`, `signals`, `portfolio`, and `backtesting` apps each own their Firestore collection namespace and enforce Firebase UID scoping at the service layer.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Django 5.2 + Django REST Framework |
| API Docs | drf-spectacular (OpenAPI 3) |
| Auth | Firebase Admin SDK (token verification) |
| Database | Firestore (via `firebase-admin`) |
| AI | Gemini AI (`google-genai`, `google-generativeai`) |
| Task Queue | Celery + Redis + `django-celery-beat` |
| HTTP Client | `requests`, `httpx` |
| Numerics | NumPy, SciPy |
| Server | Gunicorn (WSGI) |

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` in `backend/.env`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=sqlite:///db.sqlite3

BAYSE_API_BASE_URL=https://relay.bayse.markets
BAYSE_PUBLIC_KEY=your-bayse-public-key
BAYSE_SECRET_KEY=your-bayse-secret-key

GEMINI_API_KEY=your-gemini-api-key

REDIS_URL=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CREDENTIALS_PATH=/path/to/your/service-account.json
```

### Firebase Service Account

1. Go to **Firebase Console** → Project Settings → Service Accounts.
2. Click **Generate New Private Key**.
3. Save the JSON file securely.
4. Set `FIREBASE_CREDENTIALS_PATH` to its absolute path.

> **Never commit the service account JSON or `.env` into version control.**

Run locally:

```bash
python manage.py migrate --run-syncdb
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

## API Documentation

All endpoints are self-documented via `drf-spectacular`. You can explore and test them directly in the browser:

- **Interactive testing** — Swagger UI at `/api/docs/swagger/`
- **Full reference** — ReDoc at `/api/docs/redoc/`
- **Raw schema** — OpenAPI JSON at `/api/schema/`

Deployed docs:
- Swagger: [https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/swagger/](https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/swagger/)
- ReDoc: [https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/redoc/](https://edgeiq-backend-981082317040.us-central1.run.app/api/docs/redoc/)

## Celery Workers

Celery is used for async tasks: market scanning, periodic signal generation, and backtest execution.

Start a worker:

```bash
cd backend
celery -A config worker --loglevel=info
```

Start the beat scheduler (for periodic tasks):

```bash
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

> Note: Ensure `REDIS_URL` points to a running Redis instance before starting workers.

## Deploy to Cloud Run

Build and push:

```bash
cd backend
docker build -t us-central1-docker.pkg.dev/your-project/your-repo/backend:v1 .
docker push us-central1-docker.pkg.dev/your-project/your-repo/backend:v1
```

Deploy with secrets mounted from Google Secret Manager:

```bash
gcloud run deploy edgeiq-backend \
  --image=us-central1-docker.pkg.dev/your-project/your-repo/backend:v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --set-secrets="SECRET_KEY=django-secret-key:latest,BAYSE_PUBLIC_KEY=bayse-public-key:latest,BAYSE_SECRET_KEY=bayse-secret-key:latest,GEMINI_API_KEY=gemini-api-key:latest,/secrets/firebase-credentials.json=firebase-credentials:latest" \
  --set-env-vars="DEBUG=False,ALLOWED_HOSTS=*,CORS_ALLOWED_ORIGINS=*,BAYSE_API_BASE_URL=https://relay.bayse.markets,FIREBASE_PROJECT_ID=your-project-id,FIREBASE_CREDENTIALS_PATH=/secrets/firebase-credentials.json"
```

## Security Notes

- `.env` and service account JSON files are excluded from Git via `.gitignore`.
- In production, secrets are injected via Google Secret Manager (`--set-secrets`), never baked into the image.
- The backend validates Firebase ID tokens on every request and rejects unauthenticated or expired tokens immediately.
- `DEBUG` is forced to `False` in Cloud Run deployments.
