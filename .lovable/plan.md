

# Plan: Recreate Original GitHub Project

Your original project (`access-my-code`) has a much richer architecture than what currently exists in this remix. Here's what needs to change to match it.

## What's Different

Your original has:
- **4 roles**: `super_admin`, `admin`, `faculty`, `student` (current project only has `admin`, `faculty`, `student`)
- **18 pages** vs the current 7: missing Alerts, Assets, EventScheduler, FacultyDashboard, StudentDashboard, Staff, Scheduler, Settings, ResetPassword, Profile, Timetable
- **20+ custom hooks** vs 2: useAlerts, useAssets, useBatches, useConflictCheck, useCoordinatorAssignments, useCourses, useDashboardStats, useFaculty, useFacultyAvailability, useGenerateTimetable, useResourceFilters, useRooms, useSchedules, useStaff, useSwapRequests, useVenueBookings, etc.
- **8 component directories**: auth, dashboard, forms, layout, resources, settings, timetable, venue
- **Type definitions**: `types/index.ts`, `types/timetable.ts`, `types/venue.ts`, `types/facultyAvailability.ts`
- **Different layout**: `AppSidebar` with collapsible nav, `Header` component with search/bell/UserMenu, role-based nav with secondary items (AI Scheduler, Alerts, Settings)
- **Dashboard components**: StatCard, AlertsPanel, ResourceUtilization, QuickActions, TodaySchedulePreview, SwapRequestsPanel
- **Resource components**: ResourceTable, ResourceFilters, StatusBadge
- **Form dialogs**: RoomFormDialog, FacultyFormDialog, FacultyAvailabilityDialog, ScheduleFormDialog, DeleteConfirmDialog

## Approach

Since this is a large codebase (~50+ files), I'll recreate it in batches, reading each file from GitHub and writing it here. Due to message size limits, this will take **4-5 rounds**.

### Round 1: Foundation
- Rewrite `AuthContext.tsx` to match original (add `super_admin`, helper booleans like `isAdminOrAbove`, `signUp` method)
- Create `types/index.ts`, `types/timetable.ts`, `types/venue.ts`, `types/facultyAvailability.ts`
- Create `components/layout/AppSidebar.tsx`, `Header.tsx`, `UserMenu.tsx`, `MainLayout.tsx`
- Rewrite `components/auth/ProtectedRoute.tsx` (add `redirectStudents`, super_admin logic)
- Rewrite `pages/Auth.tsx` (add role selection cards, forgot password, validation)

### Round 2: Shared Components & Hooks (Part 1)
- Create `components/dashboard/*` (StatCard, AlertsPanel, ResourceUtilization, QuickActions, TodaySchedulePreview, SwapRequestsPanel)
- Create `components/resources/*` (ResourceTable, ResourceFilters, StatusBadge)
- Create hooks: useRooms, useFaculty, useCourses, useBatches, useStaff, useAssets, useResourceFilters, useDashboardStats

### Round 3: Form Dialogs & More Hooks
- Create `components/forms/*` (RoomFormDialog, FacultyFormDialog, FacultyAvailabilityDialog, ScheduleFormDialog, DeleteConfirmDialog)
- Create hooks: useAlerts, useSchedules, useSwapRequests, useConflictCheck, useCoordinatorAssignments, useFacultyAvailability, useGenerateTimetable, useStudentSchedules, useVenueBookings, useUserManagement

### Round 4: Pages
- Rewrite pages to match original: Index, Rooms, Faculty, Courses, Batches
- Create missing pages: Staff, Assets, Timetable, Scheduler, FacultyDashboard, StudentDashboard, Alerts, Settings, Profile, ResetPassword, EventScheduler
- Create timetable components (ConfigurableTimetable, TimetableConfigPanel)
- Create venue/settings components

### Round 5: Routing & Polish
- Update `App.tsx` to match original routing with all role guards
- Verify all imports resolve correctly
- Fix any build errors

## Technical Notes
- Each file will be read from your GitHub repo and recreated here with the exact same code
- The database schema in this project may differ from your original -- I'll adapt the hooks to work with the current schema
- Edge functions from the original will also need to be recreated

