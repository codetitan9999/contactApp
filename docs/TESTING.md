# Testing Strategy

## Objective

This document explains how Contact Manager is tested today and what should be validated before release.

## Automated Testing Stack

- Jest
- React Testing Library
- `@testing-library/user-event`

## Current Automated Coverage

The existing suite in `src/App.test.js` covers:

- contact creation
- contact editing
- favorite flag flow
- filter interaction
- contact deletion
- API-backed happy path behavior through mocked `fetch`
- backend-unavailable fallback to `localStorage`

## Test Design

### API Mocking

The tests mock `fetch` rather than calling a live server. This keeps the suite fast and deterministic.

### Behavior Focus

Tests are written from the user perspective:

- fill inputs
- click buttons
- observe UI output

This is appropriate for the current app size and architecture.

## Commands

Run tests once:

```bash
npm test -- --watchAll=false
```

Run production build validation:

```bash
npm run build
```

## Recommended Manual Test Checklist

### Contact Management

- add a contact with valid data
- edit an existing contact
- delete a contact
- favorite and unfavorite a contact

### Validation

- try saving without name
- try saving without mobile
- try an invalid email address
- try a duplicate mobile number

### Directory Controls

- search by contact name
- filter by category
- filter by favorites
- filter by has-email
- switch sort options

### Backup

- export a backup
- import a valid backup
- import a malformed file
- import duplicate contacts and verify skip behavior

### Fallback Behavior

- run without MongoDB configuration
- verify that the UI still loads
- verify that data saves locally

## Current Gaps

- no integration test against a real MongoDB instance
- no end-to-end browser automation suite
- no performance or load testing
- no accessibility audit automation

## Recommended Next Testing Improvements

1. Add API-level tests for `api/contacts.mjs`
2. Add end-to-end browser tests with Playwright
3. Add a real test environment for MongoDB-backed validation
4. Add accessibility smoke checks
