# Contact Manager

Contact Manager is a lightweight contact-directory application for storing, searching, filtering, and organizing personal or business contacts. The project uses a React single-page frontend, Vercel Functions for CRUD APIs, and MongoDB as the primary persistence layer when environment variables are configured. When cloud persistence is unavailable, the app gracefully falls back to browser `localStorage` so the user can continue working.

Live application:
[https://contact-app-ivory-pi.vercel.app](https://contact-app-ivory-pi.vercel.app)

## Table of Contents

- [Product Overview](#product-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Summary](#architecture-summary)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation Set](#documentation-set)
- [Current Limitations](#current-limitations)

## Product Overview

This application is designed to provide a simple contact-management experience with the following goals:

- Keep contact capture fast and straightforward.
- Support common directory workflows such as search, edit, favorite, sort, filter, import, and export.
- Work even when backend persistence is not yet configured.
- Be easy to deploy on Vercel with minimal infrastructure.

## Key Features

- Add, edit, and delete contacts.
- Mark contacts as favorites.
- Search by name, number, email, category, or note.
- Filter by favorites and category.
- Sort by recency, name, or favorites-first.
- Export contacts as JSON backup.
- Import contacts from JSON backup.
- Cloud-ready persistence through Vercel Functions and MongoDB.
- Browser-storage fallback when cloud persistence is unavailable.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Create React App |
| Styling | Plain CSS |
| API layer | Vercel Functions |
| Database | MongoDB |
| Client persistence fallback | Browser `localStorage` |
| Testing | React Testing Library, Jest |
| Deployment | Vercel |

## Architecture Summary

The application follows a thin-client plus serverless API pattern.

1. The React frontend renders the contact-management UI and manages client state.
2. The frontend calls `/api/contacts` for CRUD operations and bulk import.
3. The Vercel Function validates input, normalizes data, and persists records in MongoDB.
4. If the backend is unavailable or MongoDB is not configured, the frontend falls back to `localStorage`.

For the full design package, see:

- [Architecture Overview](./ARCHITECTURE.md)
- [Documentation Index](./docs/README.md)

## Project Structure

```text
ContactApp/
|-- api/
|   |-- contacts.mjs
|   `-- _lib/
|       |-- contacts.mjs
|       `-- mongodb.mjs
|-- public/
|   `-- index.html
|-- src/
|   |-- components/
|   |   |-- AddContacts.js
|   |   |-- App.css
|   |   |-- App.js
|   |   |-- ContactCard.js
|   |   |-- ContactList.js
|   |   |-- DirectoryToolbar.js
|   |   `-- Header.js
|   |-- services/
|   |   `-- contactsApi.js
|   |-- App.test.js
|   |-- index.css
|   |-- index.js
|   `-- setupTests.js
|-- docs/
|   |-- README.md
|   |-- API_SPEC.md
|   |-- DATA_MODEL.md
|   |-- DEPLOYMENT_RUNBOOK.md
|   |-- HLD.md
|   |-- LLD.md
|   `-- TESTING.md
|-- package.json
|-- vercel.json
`-- ARCHITECTURE.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later recommended
- npm
- Vercel CLI for serverless-local testing

### Local Frontend Only

```bash
npm install
npm start
```

### Local Full Stack

```bash
npm install
vercel dev
```

`vercel dev` is the preferred mode when validating the serverless API and MongoDB integration locally.

## Environment Variables

Create a local `.env.local` or configure these in Vercel:

```bash
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=contact_manager
```

You can use the sample file in [.env.example](./.env.example).

If these variables are not set:

- the Vercel API returns a `503` setup message
- the frontend automatically falls back to browser storage
- the application remains usable, but data is device-specific

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Starts the React development server |
| `npm test -- --watchAll=false` | Runs the automated test suite once |
| `npm run build` | Creates a production build |
| `vercel dev` | Runs frontend and serverless API locally |

## Testing

Current automated tests cover:

- create contact flow
- edit contact flow
- favorites filter flow
- delete contact flow
- backend-unavailable fallback flow

See the complete test documentation in [docs/TESTING.md](./docs/TESTING.md).

## Deployment

The project is configured for Vercel via [vercel.json](./vercel.json).

Typical deployment flow:

```bash
npm run build
vercel deploy --prod
```

Production deployment:
[https://contact-app-ivory-pi.vercel.app](https://contact-app-ivory-pi.vercel.app)

See operational steps in [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md).

## Documentation Set

This repository now contains a full engineering documentation package:

- [Architecture Overview](./ARCHITECTURE.md)
- [Documentation Index](./docs/README.md)
- [High-Level Design](./docs/HLD.md)
- [Low-Level Design](./docs/LLD.md)
- [API Specification](./docs/API_SPEC.md)
- [Data Model and ER Diagram](./docs/DATA_MODEL.md)
- [Deployment Runbook](./docs/DEPLOYMENT_RUNBOOK.md)
- [Testing Strategy](./docs/TESTING.md)

## Current Limitations

- MongoDB cloud persistence requires `MONGODB_URI` and `MONGODB_DB_NAME` to be configured.
- There is no authentication or role-based access control.
- The frontend is still based on Create React App.
- Contact import/export currently uses JSON only.
