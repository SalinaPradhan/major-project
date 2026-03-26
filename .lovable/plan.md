

# Plan: Venue Management System (VMS)

## Overview
Replace the current Event Scheduler with a full **Venue Management** system featuring premier venue categorization, host-led booking with a request/approval workflow, a color-coded calendar, system-wide alerts, and sidebar renaming.

---

## Phase 1: Database Migrations

### Migration 1 — Expand `room_type` enum + new tables
```sql
-- Add new room types
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'conference_hall';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'indoor_stadium';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'cineplex';
```

### Migration 2 — Create `venue_bookings` table
Stores premier venue bookings with host ownership:
- `id`, `venue_id` (FK rooms), `host_id` (user uuid), `host_name`, `event_name`, `description`, `event_date`, `start_time`, `end_time`, `status` (confirmed/cancelled), `created_at`
- RLS: authenticated can SELECT; host can INSERT/UPDATE own; admin full access

### Migration 3 — Create `venue_requests` table
Secondary request queue for occupied slots:
- `id`, `booking_id` (FK venue_bookings), `requestor_id`, `requestor_name`, `reason`, `status` (pending/approved/rejected), `created_at`, `reviewed_at`
- RLS: authenticated can SELECT; requestor can INSERT own; **host of booking** can UPDATE (approve/reject) — enforced via security definer function

### Migration 4 — Create `system_alerts` table
Persistent alerts visible to all users:
- `id`, `alert_type` (venue_booking/general), `title`, `message`, `created_at`, `related_entity_id`
- RLS: all authenticated can SELECT; service role / edge function inserts

### Migration 5 — Enable realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
```

---

## Phase 2: Hooks & Data Layer

### `src/hooks/useVenueBookings.ts`
- `useVenueBookings(venueId?)` — fetch bookings with venue name join
- `useCreateVenueBooking()` — insert booking + auto-create system alert
- `useCancelVenueBooking()` — update status to cancelled

### `src/hooks/useVenueRequests.ts`
- `useVenueRequests(bookingId?)` — fetch requests for a booking
- `useCreateVenueRequest()` — submit request to join/swap
- `useReviewVenueRequest()` — approve/reject (only callable by host)

### `src/hooks/useSystemAlerts.ts`
- `useSystemAlerts()` — fetch all alerts, newest first
- Realtime subscription for live updates

### `src/hooks/usePremierVenues.ts`
- `usePremierVenues()` — fetch rooms where `room_type IN ('auditorium','conference_hall','indoor_stadium','cineplex')`

---

## Phase 3: UI Components

### `src/components/venue/VenueCalendar.tsx`
Month-grid calendar adapted from uploaded `VenueCalendar.tsx`:
- Color-coded pills: Auditorium=Red, Conference Hall=Green, Indoor Stadium=Amber, Cineplex=Blue
- Click date → bottom-sheet/modal showing bookings with Host Name, Event Description
- "Book" button for vacant slots → opens booking dialog
- "Request to Join/Swap" button for occupied slots → opens request dialog
- Uses existing `src/types/venue.ts` color maps

### `src/components/venue/VenueBookingDialog.tsx`
Adapted from uploaded file:
- Venue selector (premier venues only), event name, description (mandatory), date, time
- Auto-sets `host_id` to current user on create
- On success, creates a system alert

### `src/components/venue/VenueRequestsPanel.tsx`
Adapted from uploaded file:
- Shows pending requests for bookings where current user is host
- Approve/Reject buttons (only visible to host)
- Admin sees all requests but must still go through host approval

### `src/pages/VenueManagement.tsx`
Main page with tabs:
- **Calendar** tab — `VenueCalendar` with all premier venue bookings
- **My Bookings** tab — bookings where user is host
- **Requests** tab — `VenueRequestsPanel`

---

## Phase 4: Alerts Integration

### Update `src/pages/Alerts.tsx`
Replace static `AlertsPanel` with live `useSystemAlerts()` data showing real alerts.

### Update `src/pages/Index.tsx` (Dashboard)
Add a "Recent Venue Alerts" card showing latest 5 system alerts for advance notice.

### Auto-alert on booking
In `useCreateVenueBooking`, after successful insert, also insert into `system_alerts`:
> "New Event: [Event Name] at [Venue] on [Date]. Hosted by [Host Name]."

---

## Phase 5: Navigation & UI Updates

### `src/components/layout/AppSidebar.tsx`
- Rename "Events" → "Venue Management" for all roles
- Update href from `/event-scheduler` to `/venue-management`
- Keep existing Event Scheduler route as fallback redirect

### `src/App.tsx`
- Add route `/venue-management` → `VenueManagement`
- Keep `/event-scheduler` as redirect to `/venue-management`

### `src/components/forms/RoomFormDialog.tsx`
- Add `conference_hall`, `indoor_stadium`, `cineplex` to room type dropdown

### `src/pages/Rooms.tsx`
- Add "Book Venue" button next to premier venue rooms linking to `/venue-management?venue={id}`

### Room type schema in `RoomFormDialog`
- Update zod enum: `z.enum(['classroom', 'lab', 'auditorium', 'conference_hall', 'indoor_stadium', 'cineplex'])`

---

## Files Summary

| Action | File |
|--------|------|
| Migration | Add room_type enum values |
| Migration | Create `venue_bookings` table |
| Migration | Create `venue_requests` table |
| Migration | Create `system_alerts` table |
| Migration | Enable realtime |
| Create | `src/hooks/useVenueBookings.ts` |
| Create | `src/hooks/useVenueRequests.ts` |
| Create | `src/hooks/useSystemAlerts.ts` |
| Create | `src/hooks/usePremierVenues.ts` |
| Create | `src/components/venue/VenueCalendar.tsx` |
| Create | `src/components/venue/VenueBookingDialog.tsx` |
| Create | `src/components/venue/VenueRequestsPanel.tsx` |
| Create | `src/pages/VenueManagement.tsx` |
| Modify | `src/pages/Alerts.tsx` |
| Modify | `src/pages/Index.tsx` |
| Modify | `src/components/layout/AppSidebar.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/components/forms/RoomFormDialog.tsx` |
| Modify | `src/pages/Rooms.tsx` |
| Modify | `src/types/venue.ts` (already has most types) |

