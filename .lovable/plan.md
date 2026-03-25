
# Bug Fix Guide — Implementation Status

All fixes from the roadmap have been implemented.

## Completed Fixes

| Fix | Description | Status |
|-----|-------------|--------|
| 1 | Migration conflicts | DONE (Cloud handles) |
| 2 | teaching_assignments table | DONE (pre-existing) |
| 3 | Load-aware faculty in GA | DONE (uses teaching_assignments) |
| 4 | Faculty workload tracking | DONE — `current_load` column + GA writeback |
| 5 | GA early termination fix | DONE — stagnation detection (20 gen limit) |
| 6 | Staff role normalization | N/A (no support_staff table) |
| 7 | Crossover length guard | DONE — uniform crossover + length check |
| 8 | Batch time window | N/A (no batch time columns) |
| 9 | Server-side conflict RPC | DONE — `check_schedule_conflicts` function |
| 10 | Composite indexes | DONE — 3 indexes on schedule_entries |
| 11 | Schedule versioning | DONE — `schedule_versions` table + snapshot logic |
| 12 | Concurrent GA mutex | DONE — `generation_jobs` table + 409 guard |
| 13 | Enum inconsistency | DONE — underscore format in types + StatusBadge |
| 14 | Mock data removal | DONE (no mock data existed) |
| 15 | Pagination hook | DONE — `usePaginatedQuery.ts` created |
| 16 | PDF export | Deferred (no PDF export exists yet) |
| 17 | Academic calendar | DONE — table created with RLS |
| 18 | Room utilization | DONE — `utilization_target` column + hook |
| 19 | GA progress streaming | DONE — realtime via generation_jobs + Progress UI |
