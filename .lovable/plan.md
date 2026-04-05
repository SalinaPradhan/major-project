

# Production Readiness Evaluation — TROS

## Evaluation Summary

As a senior engineer reviewing this project before hosting, here is a comprehensive audit across security, reliability, UX, data integrity, and code quality.

---

## CRITICAL Issues (Must Fix Before Hosting)

### 1. Security: Anyone Can Register as Admin
**Auth.tsx line 99-110** — The signup form sends the selected role (`admin`, `faculty`, `student`) as user metadata. The `handle_new_user` trigger only blocks admin if one already exists. This means:
- The very first user to sign up as "admin" gets full admin access — including strangers.
- After that, subsequent "admin" signups become "viewer", but the first-admin gate is a race condition.

**Fix:** Remove the admin role option from the public signup form entirely. Admin accounts should only be created via invite or a seeded super-admin. At minimum, add an admin approval workflow.

### 2. Security: Signup Immediately Signs In (Bypasses Email Verification)
**Auth.tsx line 120** — After `signUp`, the code immediately calls `signIn(signupEmail, signupPassword)`. If auto-confirm is disabled (which it should be), this will fail silently. If auto-confirm is enabled, anyone can create accounts without email verification.

**Fix:** After signup, show a "check your email" message. Do not auto-sign-in.

### 3. Security: No Delete Confirmation on Destructive Actions
**Departments.tsx line 124** — Delete is called directly on button click with no confirmation dialog. Same pattern exists in other CRUD pages. A misclick permanently deletes data.

**Fix:** Wrap all delete actions in `DeleteConfirmDialog` (which already exists in the project).

### 4. Settings Page is Non-Functional
**Settings.tsx** — All switches (email notifications, conflict alerts, compact view) are UI-only. They don't persist any state — toggling them does nothing. This will confuse users.

**Fix:** Either connect to a `user_preferences` table or remove the non-functional toggles.

---

## HIGH Priority Issues

### 5. Dashboard Stats are Incomplete
**useDashboardStats.ts** — `totalStaff`, `assignedStaff`, `totalAssets`, `workingAssets`, and `conflicts` are all hardcoded to `0`. Now that assets and support_staff tables exist, these should query real data.

### 6. No Foreign Keys in Database
None of the tables have foreign key constraints. This means:
- `batches.department_id` can reference a non-existent department
- `schedule_entries.room_id` can point to a deleted room
- `teaching_assignments.faculty_id` can reference deleted faculty

This is a **data integrity risk** in production. Orphaned references will cause silent UI bugs.

### 7. No Loading/Error States on Several Pages
**Departments.tsx** — No error state if the query fails. Just shows "Loading..." forever.
**Profile.tsx** — Uses raw `useEffect` + `supabase` call instead of React Query, no loading skeleton, no error handling.

### 8. Timetable Page Shows All Schedules (Including Drafts) to All Roles
**Timetable.tsx line 68-80** — The schedule selector dropdown shows ALL schedules (draft, published, archived) to every user including students. Students should only see published schedules.

### 9. Edge Function Has No Auth Check
**generate-timetable/index.ts** — Uses `SUPABASE_SERVICE_ROLE_KEY` but never validates the calling user's JWT or role. Any authenticated user (including students) could invoke the generation endpoint if they know the URL.

### 10. `viewer` Role Has No Route Access
The `handle_new_user` function assigns `viewer` role to users who pick admin (when one already exists) or provide no role. But the app has no UI or routes for `viewer` — these users hit "Access Denied" on most pages and see an empty dashboard.

---

## MEDIUM Priority Issues

### 11. No Pagination on Any List Page
All CRUD pages (Departments, Rooms, Faculty, Courses, Batches, Assets, Staff) fetch all rows at once. With growth, this will cause performance issues. The project has a `usePaginatedQuery` hook that isn't used anywhere.

### 12. No Mobile Responsiveness for Sidebar
**AppSidebar.tsx** — The sidebar is a fixed `w-64` column with no mobile hamburger menu. On mobile viewports, it will squeeze the main content area.

### 13. Stale `useEffect` for Auto-Select on Timetable
**Timetable.tsx line 27-31** — The `useEffect` depends on `published` array reference, which changes on every render since it's created inline with `.filter()`. This could cause unnecessary re-renders.

### 14. Hardcoded "Good Morning" Greeting
**StudentDashboard.tsx line 141, FacultyDashboard.tsx line 141** — Always says "Good morning" regardless of time of day.

### 15. No Rate Limiting on Timetable Generation
The edge function has a mutex check for concurrent runs on the same schedule, but a user can still spam-generate across different schedules, consuming server resources.

---

## LOW Priority / Polish

### 16. Inconsistent Toast Libraries
Some pages use `toast` from `sonner`, others use `useToast` from `@/hooks/use-toast`. Should standardize on one.

### 17. Type Safety
Heavy use of `any` casts throughout (e.g., `(s as any).departments?.name` in Scheduler.tsx, `profile as any` in StudentDashboard). These hide potential runtime errors.

### 18. No 404 Handling for Invalid Schedule/Entity IDs
If a user bookmarks a URL with an entity ID that gets deleted, there's no graceful handling.

### 19. PDF Export Button is Disabled
**StudentDashboard.tsx line 153** — "Export PDF" button exists but is permanently disabled with no tooltip explaining why.

---

## Recommended Fix Priority for Hosting

| Priority | Issue | Effort |
|----------|-------|--------|
| **P0** | Remove admin from public signup | Small |
| **P0** | Don't auto-sign-in after signup | Small |
| **P0** | Add delete confirmations on all CRUD pages | Small |
| **P1** | Filter timetable dropdown by role (students see published only) | Small |
| **P1** | Fix dashboard stats to query real data | Small |
| **P1** | Add foreign key constraints via migration | Medium |
| **P1** | Add auth check to edge function | Small |
| **P1** | Remove or implement Settings toggles | Small |
| **P2** | Add mobile sidebar responsiveness | Medium |
| **P2** | Use `usePaginatedQuery` on list pages | Medium |
| **P2** | Standardize toast usage | Small |
| **P2** | Fix greeting based on time of day | Trivial |

---

## Verdict

The app has solid architecture (proper RLS, role-based routing, GA edge function, React Query caching) but has **3 critical security gaps** and several data integrity risks that must be addressed before production hosting. The P0 items are all small fixes that can be done in a single session.

Shall I proceed with fixing all P0 and P1 items?

