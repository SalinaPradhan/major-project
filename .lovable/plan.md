

## Step 5: Three-Role System (Admin, Faculty, Student)

Currently the system has two roles (`admin`, `viewer`). The plan requires three distinct roles — **admin**, **faculty**, **student** — each with their own signup flow and dashboard.

### Database Changes

1. **Update `app_role` enum**: Add `faculty` and `student` values, remove `viewer`
2. **Update `handle_new_user` trigger**: Remove auto-role assignment — role comes from signup selection
3. **Add `student_id` / `faculty_code` fields to `profiles`** table for role-specific profile data

### Auth & Signup Changes

4. **Redesign Auth page** with 3 signup tabs/options:
   - **Admin signup** — email + password + display name (first user auto-admin, subsequent admin signups require approval or invite)
   - **Faculty signup** — email + password + name + department selection + faculty code
   - **Student signup** — email + password + name + batch selection + student ID
   - Login tab stays universal (role detected from `user_roles` after login)

5. **Update `AuthContext`** — change role type from `"admin" | "viewer"` to `"admin" | "faculty" | "student"`

### Role-Based Routing & Dashboards

6. **Create 3 dashboard pages**:
   - **`/admin`** — existing dashboard with stats, recent schedules, full system overview (all nav items visible)
   - **`/faculty`** — faculty-specific: "My Schedule", "My Courses", "Set Preferences", profile
   - **`/student`** — student-specific: "My Timetable" (by batch), announcements, profile

7. **Update routing in `App.tsx`**:
   - After login, redirect to `/admin`, `/faculty`, or `/student` based on role
   - Protect admin routes from faculty/student access
   - Faculty and student get limited sidebar navigation

8. **Update `AppSidebar`** — show different nav items based on role:
   - Admin: all current items
   - Faculty: Dashboard, My Schedule, My Courses, Preferences, Settings
   - Student: Dashboard, My Timetable, Settings

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...` | ALTER enum, update trigger |
| `src/pages/Auth.tsx` | Add role-based signup forms |
| `src/contexts/AuthContext.tsx` | Update role types |
| `src/pages/AdminDashboard.tsx` | New — move current Index content |
| `src/pages/FacultyDashboard.tsx` | New — my schedule, courses, preferences |
| `src/pages/StudentDashboard.tsx` | New — my timetable view |
| `src/App.tsx` | Role-based redirects and route guards |
| `src/components/layout/AppSidebar.tsx` | Role-filtered navigation |

### Technical Details

- The `app_role` enum alteration: `ALTER TYPE app_role ADD VALUE 'faculty'; ALTER TYPE app_role ADD VALUE 'student';`
- Remove `viewer` cannot be done easily with enums; we'll keep it but stop using it, or create a new enum
- Signup will pass `role` in `raw_user_meta_data`, and the trigger will read it to assign the correct role
- Faculty signup will optionally link to existing `faculty` table record by email match
- Student signup stores batch reference for timetable filtering

