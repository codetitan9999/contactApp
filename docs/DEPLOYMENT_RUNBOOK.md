# Deployment Runbook

## Objective

This runbook documents how to configure, deploy, validate, and operate Contact Manager in local and hosted environments.

## Runtime Environments

### Local Frontend Only

Use when working only on UI behavior:

```bash
npm install
npm start
```

### Local Full Stack

Use when testing the Vercel Function locally:

```bash
npm install
vercel dev
```

### Hosted Production

Hosted on Vercel:

[https://contact-app-ivory-pi.vercel.app](https://contact-app-ivory-pi.vercel.app)

## Required Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes for cloud mode | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | recommended | database name for contact records |

## MongoDB Activation Steps

1. Create or select a MongoDB Atlas project and cluster.
2. Create a database user with read/write access.
3. Add the application IP rules required by Atlas.
4. Copy the connection string.
5. Add `MONGODB_URI` and `MONGODB_DB_NAME` in Vercel project settings.
6. Redeploy the application.
7. Verify that `GET /api/contacts` returns `200` instead of `503`.

## Vercel Deployment Steps

```bash
npm run build
vercel deploy --prod
```

## Post-Deployment Validation

After deployment, verify the following:

### UI Checks

- home page loads
- add contact works
- edit contact works
- delete contact works
- search and filters work
- export downloads a file
- import accepts a valid backup

### API Checks

- `GET /api/contacts` returns `200` in cloud mode
- `POST /api/contacts` creates a record
- `PUT /api/contacts` updates a record
- `DELETE /api/contacts?id=<id>` removes a record

### Fallback Checks

- if MongoDB is not configured, UI still loads
- device-mode message is shown
- contact creation still works in local fallback mode

## Operational Modes

### Cloud Mode

Triggered when:

- Vercel Function is reachable
- MongoDB is configured
- API requests succeed

Behavior:

- contacts are loaded from MongoDB
- writes go to MongoDB
- UI shows cloud storage messaging

### Local Fallback Mode

Triggered when:

- MongoDB env vars are missing
- API is unreachable
- server returns recoverable backend errors

Behavior:

- contacts are loaded from `localStorage`
- writes persist locally only
- UI indicates device-only behavior

## Monitoring and Diagnosis

### Common Failure: `503` from `/api/contacts`

Likely causes:

- `MONGODB_URI` is missing
- `MONGODB_DB_NAME` is missing or incorrect
- MongoDB access rules prevent connection

### Common Failure: Duplicate Phone Number

Likely cause:

- another contact already exists with the same normalized mobile number

### Common Failure: Frontend Works but Data Is Not Shared

Likely cause:

- app is running in local fallback mode rather than cloud mode

## Rollback Guidance

If a release causes issues:

1. Identify the last known good production deployment in Vercel.
2. Roll back using Vercel dashboard or CLI.
3. Revalidate API and UI behavior.

Example CLI:

```bash
vercel rollback
```

## Security Notes

- never commit real MongoDB credentials
- keep `MONGODB_URI` in Vercel environment variables only
- add authentication before treating the product as multi-user or sensitive-data ready
