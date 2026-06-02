# API Specification

## Overview

The backend exposes a single serverless endpoint:

- `GET /api/contacts`
- `POST /api/contacts`
- `PUT /api/contacts`
- `DELETE /api/contacts?id=<contactId>`

The endpoint is implemented in `api/contacts.mjs`.

## Common Behavior

- request and response content type: `application/json`
- all successful responses return JSON
- validation errors use `4xx`
- setup or infrastructure problems use `5xx`
- duplicate phone-number conflicts return `409`

## Contact Object

```json
{
  "id": "contact-1712345678901-abc123",
  "name": "Priya Nair",
  "mobile": "+91 98765 43210",
  "email": "priya@company.com",
  "category": "Work",
  "notes": "Prefers email updates.",
  "favorite": true,
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:30:00.000Z"
}
```

## Endpoints

### `GET /api/contacts`

Returns all contacts sorted by `updatedAt` descending.

#### Success Response

```json
{
  "contacts": [
    {
      "id": "contact-1",
      "name": "Priya Nair",
      "mobile": "+91 98765 43210",
      "email": "priya@company.com",
      "category": "Work",
      "notes": "Prefers email updates.",
      "favorite": true,
      "createdAt": "2026-06-03T10:00:00.000Z",
      "updatedAt": "2026-06-03T10:30:00.000Z"
    }
  ]
}
```

### `POST /api/contacts`

Creates a single contact.

#### Request Body

```json
{
  "name": "Priya Nair",
  "mobile": "+91 98765 43210",
  "email": "priya@company.com",
  "category": "Work",
  "notes": "Prefers email updates.",
  "favorite": true
}
```

#### Success Response

```json
{
  "contact": {
    "id": "contact-1712345678901-abc123",
    "name": "Priya Nair",
    "mobile": "+91 98765 43210",
    "email": "priya@company.com",
    "category": "Work",
    "notes": "Prefers email updates.",
    "favorite": true,
    "createdAt": "2026-06-03T10:00:00.000Z",
    "updatedAt": "2026-06-03T10:00:00.000Z"
  }
}
```

### `POST /api/contacts` for Batch Import

If the request body contains a `contacts` array, the endpoint runs bulk import logic.

#### Request Body

```json
{
  "contacts": [
    {
      "name": "Priya Nair",
      "mobile": "+91 98765 43210",
      "email": "priya@company.com",
      "category": "Work",
      "notes": "Prefers email updates.",
      "favorite": true
    }
  ]
}
```

#### Success Response

```json
{
  "contacts": [],
  "importedCount": 1,
  "skippedCount": 0
}
```

### `PUT /api/contacts`

Updates an existing contact by `id`.

#### Request Body

```json
{
  "id": "contact-1712345678901-abc123",
  "name": "Priya Nair",
  "mobile": "+91 98765 43210",
  "email": "priya.updated@company.com",
  "category": "Work",
  "notes": "Updated note",
  "favorite": false
}
```

#### Success Response

```json
{
  "contact": {
    "id": "contact-1712345678901-abc123",
    "name": "Priya Nair",
    "mobile": "+91 98765 43210",
    "email": "priya.updated@company.com",
    "category": "Work",
    "notes": "Updated note",
    "favorite": false,
    "createdAt": "2026-06-03T10:00:00.000Z",
    "updatedAt": "2026-06-03T10:45:00.000Z"
  }
}
```

### `DELETE /api/contacts?id=<contactId>`

Deletes an existing contact.

#### Success Response

```json
{
  "success": true
}
```

## Validation Rules

| Field | Rule |
| --- | --- |
| `name` | required |
| `mobile` | required |
| `mobile` | must match `^[+\\d\\s()-]{7,20}$` |
| `email` | optional, valid email if present |
| `phoneNormalized` | generated internally |

## Error Responses

### Validation Error

```json
{
  "error": "Name and mobile number are required."
}
```

### Duplicate Error

```json
{
  "error": "That mobile number is already saved in your contact list."
}
```

### MongoDB Not Configured

```json
{
  "error": "Cloud sync is not configured yet. Contacts will stay available on this device until the database is connected."
}
```

## Status Code Reference

| Status | Meaning |
| --- | --- |
| `200` | successful read, update, delete, or import |
| `201` | successful create |
| `400` | invalid input |
| `404` | contact not found |
| `409` | duplicate mobile number |
| `500` | unexpected server error |
| `503` | MongoDB not configured or setup not available |
