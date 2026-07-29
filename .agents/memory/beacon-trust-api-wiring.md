---
name: Beacon Trust API wiring
description: The frontend was wired from direct Supabase calls to the Express API; field name mapping and added routes.
---

# Beacon Trust API wiring

## The rule
All customer-facing pages use `apiFetch` from `src/lib/api.ts` — never `supabase.from(...)` directly in page components.

**Why:** The Express API (`artifacts/api-server`) has auth middleware, business logic (balance checks, pending state), and is the single source of truth. Direct Supabase calls bypass JWT auth and all server-side validation.

## Field name mapping
Drizzle returns camelCase; Supabase returned snake_case. Pages now expect:
- `accountNumber` (not `account_number`)
- `createdAt` (not `created_at`)
- `cardholderName`, `last4`, `expiryMonth`, `expiryYear` (not snake variants)
- `recipientName`, `accountId` (not snake variants)
- `bankName` (not `bank_name`)

## Added API endpoints
- `POST /api/accounts` — request a new account (type + currency)
- `GET /api/beneficiaries` — list user's beneficiaries
- `POST /api/beneficiaries` — add a beneficiary
- `DELETE /api/beneficiaries/:id` — remove a beneficiary

## Pages rewired
dashboard, accounts, cards, transfer, transactions, account-detail — all 6 customer pages now use apiFetch exclusively.

## How to apply
Any new customer page that reads/writes banking data must call `apiFetch('/api/...')` with a Bearer token. The `getToken()` helper in `use-auth.ts` is used by `apiFetch` automatically.
