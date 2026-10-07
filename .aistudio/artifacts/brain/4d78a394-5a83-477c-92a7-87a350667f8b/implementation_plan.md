# Database Account Clearance & Role Synchronization Plan

A comprehensive plan to wipe all existing accounts from the `park_avenue_menswear` database, provide a clean slate for new account creation from the storefront, and ensure that assigning the `admin` role directly in MongoDB Atlas is seamlessly recognized by the application.

---

## User Review & Critical Decisions

> [!NOTE]
> **Status: Completed**
> All 8 existing accounts have been cleared from your external MongoDB Atlas database (`park_avenue_menswear`). Role normalization and plain-text fallback handling are active. You can now register your fresh account and assign role "admin" directly from Atlas.

---

## 1. Overview & Core Concept

- **The Problem**:
  - Updating a user's role to `admin` in MongoDB Atlas did not allow immediate administrator sign-in because of potential role case-sensitivity (e.g. `"Admin"` vs `"admin"`), plain-text password entries in the `passwordHash` field, or existing seed accounts conflicting with new signups.
- **The Solution**:
  1. **Account Wipe Utility**: Provide a command (`npm run clear:accounts`) that clears all documents in the `customers` collection in the `park_avenue_menswear` database.
  2. **Configurable Clean Slate Mode**: Ensure the server does not re-seed old default accounts over your clean database.
  3. **Role Normalization & Plain-Text Auto-Hashing**:
     - Normalize roles (`"Admin"`, `"admin"`, `"ADMIN"`) so modifying the record in Atlas is always recognized.
     - Auto-detect if a password in Atlas was saved as plain text instead of a Bcrypt hash, verify it, and automatically hash it securely on login.
  4. **Smooth Registration Flow**: Register your new account via the storefront, then update its role in Atlas to gain instant executive admin access.

---

## 2. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                     CLEAN SLATE & PROMOTION FLOW                       │
└────────────────────────────────────────────────────────────────────────┘

  1. Clear All Accounts:
     npm run clear:accounts  ───►  Deletes all docs in 'customers' collection
                                   in database 'park_avenue_menswear'

  2. Storefront Registration:
     User registers via UI   ───►  Saves new customer with Bcrypt password
     (/login -> Create account)    role: "customer", status: "active"

  3. MongoDB Atlas Promotion:
     You edit doc in Atlas   ───►  Set role: "admin" (or "Admin")
     (cloud.mongodb.com)

  4. Login Verification:
     User signs in           ───►  - Normalizes role to lowercase 'admin'
                                   - Verifies Bcrypt hash
                                   - Grants full Atelier & Admin Console access
```

---

## 3. Implementation Steps

### Step 1: Database Clearance Script (`server/scripts/clearAllAccounts.ts`)
- Connects to `park_avenue_menswear`.
- Removes all existing accounts from the `customers` collection.
- Logs confirmation with record count.
- Adds `"clear:accounts": "tsx server/scripts/clearAllAccounts.ts"` to `package.json`.

### Step 2: Prevent Seed Re-population on Clean Slate
- Update `server/config/seed.ts` so that when a clean slate is active (`SEED_ACCOUNTS=false` or when manually cleared), it respects your clean database and does not re-inject old sample accounts.

### Step 3: Resilient Atlas Role & Password Compatibility (`server/services/authService.ts`)
- **Role Case-Insensitivity**: Treat `"admin"`, `"Admin"`, `"ADMIN"` as valid administrator clearance.
- **Plain-Text Recovery**: If an administrator password was manually entered in plain text directly in the Atlas UI, detect it, match it, and immediately convert it to a valid Bcrypt hash.
- **Seamless Session & Token**: Issue the signed JWT with `role: 'admin'` so the frontend router navigates straight to `/admin`.

---

## 4. Verification & Testing

1. Run `npm run clear:accounts` and verify that the `customers` collection is emptied.
2. Register a new user via the storefront (`/login` -> "Create account").
3. Update the role in the database to `admin`.
4. Log in and confirm the user is granted full administrator access to the Atelier & Admin Console.
