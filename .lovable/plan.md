

# Plan: Add Sample Data to Student & Faculty Dashboards

## Database Changes (5 operations via insert tool)

1. **Publish the schedule** — `UPDATE schedules SET status = 'published'` for the existing schedule
2. **Link student to batch** — `UPDATE profiles SET batch_id = 'CS-2026-A batch id'` for student user
3. **Link faculty email** — `UPDATE faculty SET email = 'faculty@tros.edu'` on Dr. Sharma's record
4. **Insert ~6 schedule entries** for Mon/Tue/Thu to fill out CS-2026-A's week (need to query existing teaching_assignments and time_slots to get valid IDs)
5. **Insert 4 system alerts** — academic announcements (timetable published, room change, faculty day, exam schedule)

## Code Change

- **`src/hooks/useSwapRequests.ts`** — Replace empty array return with 3 hardcoded sample swap requests (2 pending, 1 approved) so the Faculty Dashboard swap panel renders content

## Result
- Student dashboard shows today's classes, weekly grid, countdown, announcements
- Faculty dashboard shows Dr. Sharma's schedule, workload, weekly grid, swap requests

