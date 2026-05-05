# EdgeIQ Frontend

React single-page application for the EdgeIQ trading platform. Provides market exploration, AI signal feeds, portfolio tracking, backtesting, calibration tools, and user management — all behind Firebase Authentication.

## Tech Stack

- **Framework** — React 19 + Vite
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Components** — shadcn/ui (Radix primitives + class-variance-authority)
- **State** — Zustand
- **Routing** — React Router DOM v7
- **Auth** — Firebase Authentication
- **Charts** — Recharts
- **Forms** — React Hook Form + Zod

## Project Structure

```
src/
  components/       # Reusable UI components (shadcn + custom)
  hooks/            # Custom React hooks (e.g., use-mobile)
  lib/              # Utilities, Firebase init, API helpers
  pages/            # Top-level route components
  stores/           # Zustand stores (auth, UI state)
  types/            # Shared TypeScript types
  App.tsx           # Route definitions + auth listener
  main.tsx          # Entry point
```

## Setup

```bash
cd app
npm install
```

Create `.env` from the example below and place it in `app/.env`:

```env
# Firebase Web Config (get from Firebase Console → Project Settings → Your Apps)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend API URL
VITE_API_URL=http://localhost:8000/api
# For production:
# VITE_API_URL=https://edgeiq-backend-981082317040.us-central1.run.app/api
```

Run locally:

```bash
npm run dev
```

The Vite dev server will start (default `http://localhost:5173`).

## Build & Docker

Build for production:

```bash
npm run build
```

The Docker image compiles the app and serves static files with Nginx on port `8080`:

```bash
cd app
docker build \
  --build-arg VITE_API_URL=https://edgeiq-backend-981082317040.us-central1.run.app/api \
  -t edgeiq-frontend .
docker run -p 8080:8080 edgeiq-frontend
```

## Deploy to Cloud Run

```bash
cd app
docker build \
  --build-arg VITE_API_URL=https://edgeiq-backend-981082317040.us-central1.run.app/api \
  -t us-central1-docker.pkg.dev/your-project/your-repo/frontend:v1 .
docker push us-central1-docker.pkg.dev/your-project/your-repo/frontend:v1
gcloud run deploy edgeiq-frontend \
  --image=us-central1-docker.pkg.dev/your-project/your-repo/frontend:v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080
```

## Key Pages & Features

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Public landing overview |
| `/auth` | AuthPage | Firebase sign-up / sign-in |
| `/onboarding` | Onboarding | New user onboarding flow |
| `/home` | HomePage | Authenticated dashboard home |
| `/markets` | MarketsExplorer | Browse and filter prediction markets |
| `/market/:id` | MarketDeepDive | Individual market analysis, price history, AI deep dive |
| `/signals` | SignalFeed | AI-generated trading signals with confidence & rationale |
| `/backtest` | Backtester | Run historical strategy simulations |
| `/portfolio` | Portfolio | Track positions, PnL, and exposure |
| `/calibration` | Calibration | Belief calibration metrics and scoring |
| `/settings` | Settings | Account preferences and app configuration |
| `/profile` | ProfilePage | User profile and stats |

Protected routes render inside `DashboardLayout`, which provides the persistent sidebar navigation and top bar.

## Authentication

Users authenticate via Firebase (email/password or OAuth providers). On successful login, the frontend obtains a Firebase ID token and sends it on every API request in the `Authorization: Bearer <token>` header. The backend verifies the token with Firebase Admin SDK and scopes all data to the authenticated user's UID.

The `initAuthListener` utility in `src/lib/firebase.ts` handles token refresh and auth-state sync with the Zustand auth store automatically.
