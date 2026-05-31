# FitTrack — Fitness Tracker

A personal fitness companion web app for tracking daily steps, calories, workouts, water intake, BMI, and fitness goals.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/fitness-tracker run dev` — run the frontend (port 23863)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter (routing), TanStack React Query, Recharts, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `lib/db/src/schema/` — Drizzle ORM table definitions (profile, activity, workout, goals, waterIntake)
- `artifacts/fitness-tracker/src/` — React frontend
- `artifacts/api-server/src/routes/` — Express route handlers (profile, activities, workouts, goals, water, reports)

## Architecture decisions

- Contract-first: OpenAPI spec drives both frontend hooks (Orval → React Query) and server validation (Orval → Zod).
- Single user model: No auth — all data belongs to one profile row (typical for personal fitness apps).
- Reports computed server-side: dashboard, weekly, monthly summaries are computed on-demand from raw activity/workout data.
- BMI calculated from profile: height/weight stored in profile; `/reports/bmi` computes on request.

## Product

- Dashboard: Today's steps, calories, distance, water with goal progress bars + recent workouts + activity feed
- Activities: Log/edit daily steps, distance, calories burned
- Workouts: Add/edit/delete workouts with name, duration, calories, notes
- Goals: Set step, calorie, water, weekly workout goals
- Water: Log intake throughout the day, track daily total vs goal
- BMI: Visual BMI calculator with health category indicator
- Reports: Weekly (bar chart by day) and monthly (bar chart by week) for steps, calories, workouts
- Profile: Name, email, age, gender, height, weight

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Reports use UTC-based date comparisons; water totals grouped by `DATE(logged_at AT TIME ZONE 'UTC')`.
- Profile and Goals are single-row tables (upsert pattern, no user auth).
- After changing `openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend or server code.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
