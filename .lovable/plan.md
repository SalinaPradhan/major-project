

# Round 5: Final Routing, Cleanup & Polish

## Current State
Rounds 1-4 are complete. The project has all pages, components, hooks, and form dialogs created. What remains is cleanup and verification.

## What Needs to Be Done

### 1. Remove Duplicate/Stale Files
- Delete `src/components/MainLayout.tsx` (old version) -- the active one is `src/components/layout/MainLayout.tsx`, but `App.tsx` imports from `@/components/MainLayout` which points to the root-level one that uses `<Outlet />`. This is actually the correct one being used. The `layout/MainLayout.tsx` is the stale duplicate.
- Delete `src/components/NavLink.tsx` (unused legacy component)
- Delete `src/components/ProtectedRoute.tsx` (unused, replaced by `src/components/auth/ProtectedRoute.tsx`)

### 2. Fix Role Enum Mismatch
The database has `app_role: "admin" | "viewer" | "faculty" | "student"` -- note `viewer` not `super_admin`. The `AuthContext` references `super_admin` which does not exist in the enum. Need to:
- Update `AuthContext.tsx` to use `viewer` instead of `super_admin`, OR
- Add a database migration to replace `viewer` with `super_admin` in the enum (depends on your intent)
- Update `isSuperAdmin` and `isAdminOrAbove` helpers accordingly

### 3. Fix `super_admin` References in Sidebar & Routes
- `AppSidebar.tsx` likely references `super_admin` role for nav visibility -- update to match actual enum
- Route guards in `App.tsx` that use `allowedRoles` with `'admin'` should also include the correct elevated role

### 4. Add Missing Edge Function for Timetable Generation
- Create `supabase/functions/generate-timetable/index.ts` -- the `useGenerateTimetable` hook calls this endpoint but it doesn't exist yet
- Implements the Genetic Algorithm scheduler logic (population init, crossover, mutation, fitness evaluation)

### 5. Verify All Imports Compile
- Scan for any broken imports referencing files that don't exist
- Ensure all hook files export what the pages expect

## Technical Details

**Role enum fix**: The simplest path is to update all frontend code to treat `viewer` as the "super admin" equivalent, since changing the DB enum is more disruptive. Alternatively, run a migration to rename `viewer` to `super_admin`.

**Edge function**: The generate-timetable function will accept schedule config (population size, mutation rate, generations) and query rooms, faculty, batches, teaching_assignments, time_slots, and faculty_preferences to produce schedule_entries.

**Files to delete**: `src/components/MainLayout.tsx` (layout version is unused), `src/components/NavLink.tsx`, `src/components/ProtectedRoute.tsx`

**Estimated scope**: ~5-8 file edits + 1 new edge function + 1 optional migration

