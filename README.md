# BER Guardian

BER Guardian is a secure, FERPA-conscious workspace for creating, storing, and reporting
California-compliant Behavior Emergency Reports (BERs). The application mirrors Nonviolent Crisis
Intervention® (CPI/NCI) workflows with role-aware access, automated compliance reminders, live
metrics, and a complete audit history.

## Features

- **Role-aware workspace** – Staff authenticate with their district role so dashboards, compliance
  tasks, and audit visibility align with responsibilities.
- **Interactive executive dashboard** – Monitor daily incident trends, site hotspots, CPI
  interventions, and outstanding follow-up tasks with rich visualizations.
- **Report management** – Search, filter, and update BERs in real time while tracking follow-up task
  completion and status changes.
- **Guided BER creation** – Capture all California-mandated data points, CPI intervention details,
  and debrief documentation with an intuitive wizard-style form.
- **Compliance center** – Automate reminders for guardian notification, debriefs, district
  submissions, and other follow-up actions.
- **Immutable audit trail** – Every login, BER update, and reminder change is logged for accountability.
- **Local-first storage** – Demo data is persisted in the browser via `localStorage` so the workspace
  remains functional without a backend service.

## Getting started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run type-safe production build
npm run build
```

The Vite development server starts on [http://localhost:5173](http://localhost:5173).

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Recharts](https://recharts.org/) for accessible data visualizations
- Custom state management backed by localStorage for demo persistence

## Project structure

```
src/
  components/      # Reusable UI primitives and feature modules
  context/         # Data provider handling reports, reminders, and audit history
  hooks/           # Shared React hooks
  types/           # Domain models for BERs, audit events, compliance tasks
  utils/           # Helper utilities (if needed)
```

> **Note:** This project is currently front-end only. For production use, connect the data layer to a
> secure FERPA-compliant backend with appropriate authentication, authorization, and retention
> policies.
