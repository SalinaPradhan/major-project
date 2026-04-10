

# Erase All Sample Data

## What will be deleted

All data from every table (in dependency-safe order to avoid foreign key issues):

| Table | Rows |
|-------|------|
| schedule_entries | 6 |
| schedule_versions | 0 |
| generation_jobs | 1 |
| schedules | 1 |
| teaching_assignments | 27 |
| faculty_preferences | 1 |
| swap_requests | 4 |
| venue_requests | 0 |
| venue_bookings | 3 |
| events | 1 |
| system_alerts | 7 |
| assets | 1 |
| support_staff | 1 |
| courses | 12 |
| batches | 10 |
| faculty | 10 |
| departments | 3 |

**Preserved:** `time_slots` (11 rows) — these are structural config (Period 1–8, breaks, lunch), not sample data. Also preserved: `profiles`, `user_roles` (auth-linked).

## How

Use the database insert tool to run DELETE statements in order:
1. Child tables first (schedule_entries, generation_jobs, schedule_versions, teaching_assignments, faculty_preferences, swap_requests, venue_requests, venue_bookings, events, system_alerts, assets, support_staff)
2. Then parent tables (schedules, courses, batches, faculty, departments)

This is a data operation, not a schema change, so the insert tool is appropriate.

