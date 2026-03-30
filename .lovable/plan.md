

# Plan: Make Venue Management Read-Only for Students

## Problem
The Venue Management page (`/venue-management`) currently allows all users—including students—to book venues. Students should only be able to **view** the calendar and bookings, not create bookings or send requests.

## Changes

### `src/pages/VenueManagement.tsx`
1. Use `isStudent` from `useAuth()` to determine read-only mode
2. **Hide** the "Book Venue" button in the header for students
3. **Hide** the "My Bookings" and "Requests" tabs for students (they have nothing to manage)
4. Pass a `readOnly` prop to `VenueCalendar` so the "Book" and "Request" buttons inside the calendar day-detail dialog are hidden for students
5. Don't render `VenueBookingDialog` or `VenueRequestDialog` for students

### `src/components/venue/VenueCalendar.tsx`
1. Add a `readOnly` prop (already exists as a pattern in `EventCalendar`)
2. When `readOnly` is true, hide the "Book This Date" button in the day-detail modal and hide the "Request to Join" button on existing bookings
3. Students can still click dates and view event details (host name, description, time, venue) — just no action buttons

## Files Modified
- `src/pages/VenueManagement.tsx` — conditional rendering based on `isStudent`
- `src/components/venue/VenueCalendar.tsx` — add `readOnly` prop support

