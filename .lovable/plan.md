

# Plan: Fix Build Errors & Verify End-to-End

## Problem

The project has **two critical issues** preventing it from running:

1. **`vite: command not found`** — The `node_modules` directory needs reinstalling (likely caused by a recent lockfile edit).

2. **Radix UI TypeScript errors** — The Radix UI packages (dialog, alert-dialog, select, label, scroll-area, etc.) were updated to versions that changed their type signatures. Standard props like `className`, `children`, `onClick`, `disabled`, `htmlFor` are no longer recognized on Radix primitive components because newer Radix versions dropped `forwardRef` in favor of a new composition pattern.

## Root Cause

The `bun.lock` file was edited in a previous change, which likely resolved newer Radix UI package versions. These newer versions (`@radix-ui/*` v1.2+) use a different component API that doesn't expose HTML props directly through `ComponentPropsWithoutRef`.

## Fix Strategy

### Step 1: Pin Radix UI packages to compatible versions

Downgrade Radix UI packages in `package.json` to the last stable versions that use the `forwardRef` pattern (the v1.0.x / v1.1.x line). This is safer than rewriting every UI component.

Key packages to pin:
- `@radix-ui/react-alert-dialog`: `"1.1.4"`
- `@radix-ui/react-dialog`: `"1.1.4"`
- `@radix-ui/react-select`: `"2.1.4"`
- `@radix-ui/react-label`: `"2.1.1"`
- `@radix-ui/react-scroll-area`: `"1.2.2"`
- `@radix-ui/react-popover`: `"1.1.4"`
- `@radix-ui/react-tooltip`: `"1.1.6"`
- And all other `@radix-ui/*` packages to their pre-breaking-change versions

### Step 2: Reinstall dependencies

After pinning versions, reinstall to regenerate `node_modules` and fix the `vite: command not found` error.

### Step 3: Verify build compiles

Confirm zero TypeScript errors and the dev server starts.

### Step 4: Test end-to-end

Once the app builds, test the following flows:
- Admin dashboard loads with stats
- Faculty dashboard shows timeline, metrics, weekly grid
- Student dashboard shows class cards, announcements, weekly timetable
- Rooms page loads and displays room list
- Venue Management calendar works
- Authentication (login/logout) works

## Files to Modify

- **`package.json`** — Pin all `@radix-ui/*` dependencies to compatible versions (remove `^` caret, use exact versions)

## Regarding "Connect to Supabase"

This project **already runs on Lovable Cloud**, which uses the same Supabase technology under the hood. Your database, authentication, edge functions, and RLS policies are all fully connected and working. There is no separate connection step needed — it's the same infrastructure.

