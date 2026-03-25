

# Plan: Fix Build Error & Build Phase 1 + 2

## Build Error Fix
The `@supabase/supabase-js` package is missing from `package.json`. This must be added as a dependency.

## Phase 1: Core Infrastructure

### 1. Auth Page (`src/pages/Auth.tsx`)
- Login/signup form with role selection (admin, faculty, student)
- Uses Supabase auth with metadata for role assignment
- Redirects to dashboard on success

### 2. Auth Context (`src/contexts/AuthContext.tsx`)
- Manages session state via `onAuthStateChange`
- Fetches user role from `user_roles` table
- Fetches profile from `profiles` table
- Exposes `user`, `role`, `profile`, `signOut`

### 3. Protected Route (`src/components/ProtectedRoute.tsx`)
- Wraps routes requiring authentication
- Optional `allowedRoles` prop for role-based access
- Redirects unauthenticated users to `/auth`

### 4. Main Layout (`src/components/MainLayout.tsx`)
- Sidebar with role-based navigation links
- Admin: all management pages
- Faculty: dashboard, timetable, preferences
- Student: dashboard, timetable
- Header with user info and sign-out

### 5. Update App.tsx
- Add `@supabase/supabase-js` dependency
- Add all routes wrapped in `ProtectedRoute`
- Auth page as public route

## Phase 2: Dashboard & Resource Management

### 6. Admin Dashboard (`src/pages/Index.tsx`)
- Stats cards showing counts of departments, faculty, courses, rooms, batches, assignments
- Quick-action links to management pages

### 7. Departments Page (`src/pages/Departments.tsx`)
- Table listing all departments (name, code)
- Add/Edit/Delete dialogs
- CRUD via Supabase client

### 8. Faculty Page (`src/pages/Faculty.tsx`)
- Table with name, email, department, max hours
- Add/Edit/Delete with department dropdown
- CRUD via Supabase client

### 9. Courses Page (`src/pages/Courses.tsx`)
- Table with code, name, credits, lecture/lab hours, department
- Add/Edit/Delete dialogs
- CRUD via Supabase client

### 10. Rooms Page (`src/pages/Rooms.tsx`)
- Table with name, type, capacity, building, floor, projector
- Add/Edit/Delete dialogs
- Room type enum: classroom, lab, seminar_hall

### 11. Batches Page (`src/pages/Batches.tsx`)
- Table with name, semester, section, strength, department
- Add/Edit/Delete dialogs

## Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `package.json` — add `@supabase/supabase-js` |
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/components/ProtectedRoute.tsx` |
| Create | `src/components/MainLayout.tsx` |
| Create | `src/pages/Auth.tsx` |
| Modify | `src/pages/Index.tsx` — admin dashboard |
| Create | `src/pages/Departments.tsx` |
| Create | `src/pages/Faculty.tsx` |
| Create | `src/pages/Courses.tsx` |
| Create | `src/pages/Rooms.tsx` |
| Create | `src/pages/Batches.tsx` |
| Modify | `src/App.tsx` — add routes |

## Technical Notes
- All CRUD operations use the existing Supabase client at `@/integrations/supabase/client`
- RLS policies are already configured — admins can manage all tables, authenticated users can read
- The `handle_new_user` trigger auto-creates profiles and assigns roles on signup
- UI uses existing shadcn/ui components (Dialog, Table, Button, Input, Select, Card)

