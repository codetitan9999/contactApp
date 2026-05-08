# Contact Manager

A contact manager built with Create React App, Vercel Functions, and MongoDB-ready persistence.

## Live Demo

Open the deployed app here:

[https://contact-app-ivory-pi.vercel.app](https://contact-app-ivory-pi.vercel.app)

## Features

- Cloud-ready contact storage through Vercel API functions and MongoDB
- Graceful fallback to browser storage when the API is unavailable
- Add, edit, delete, favorite, search, filter, sort, import, and export flows
- Contact records with name, mobile number, email, category, and notes
- Responsive interface optimized for desktop and mobile
- Interaction tests covering API-backed CRUD flows and offline fallback

## Scripts

In the project directory, you can run:

### `npm start`

Runs the CRA frontend at [http://localhost:3000](http://localhost:3000).

### `vercel dev`

Runs the frontend and Vercel Functions together for full local development.

### `npm test`

Runs the test suite.

### `npm run build`

Creates an optimized production build in the `build` directory.

## Deployment

This project is set up for Vercel with:

```bash
npm run build
```

and a static output directory of:

```bash
build
```

## MongoDB Setup

Add these server-side environment variables to Vercel:

```bash
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=contact_manager
```

You can also copy the template from [.env.example](/Users/sumanth/Desktop/CodexApps/ContactApp/.env.example).

Until these variables are added, the app will keep working in device-only mode with browser storage.

Recommended setup flow:

1. Create a MongoDB Atlas database and get the connection string.
2. Add `MONGODB_URI` and `MONGODB_DB_NAME` in the Vercel project environment variables.
3. Pull the variables locally with `vercel env pull .env.local --yes`.
4. Use `vercel dev` for local testing of both the frontend and API functions.
