

# Plan: Add Sample Data for Multiple Timetables

## Current State
- 3 departments (CS, ECE, MATH)
- 4 batches (CS-A, CS-B, ECE-A, MATH-A)
- 6 courses, 6 faculty, 8 teaching assignments
- 6 rooms (3 classrooms, 2 labs, 1 cineplex)

## What to Add

### New Batches (6 more)
- CS-2026-C (Sem 3, 38 students), CS-2026-D (Sem 5, 42 students)
- ECE-2026-B (Sem 3, 45 students), ECE-2026-C (Sem 5, 40 students)
- MATH-2026-B (Sem 1, 30 students), MATH-2026-C (Sem 3, 35 students)

### New Courses (6 more)
- CS301 (OS, 3 lec + 2 lab), CS401 (DBMS, 3 lec)
- ECE301 (VLSI, 3 lec + 2 lab), ECE401 (Microprocessors, 3 lec)
- MATH301 (Probability, 3 lec), MATH401 (Discrete Math, 3 lec)

### New Faculty (4 more)
- Dr. Kumar (CS), Dr. Reddy (ECE), Dr. Verma (MATH), Dr. Iyer (CS)

### New Rooms (3 more)
- LHC-103 (classroom, 50), LHC-104 (classroom, 45), CS-Lab-2 (lab, 40)

### New Teaching Assignments (~20 more)
Map the new courses and faculty to the new batches, ensuring each batch has 3-4 courses assigned. This gives enough data for 6+ independent scoped timetable generations.

## Execution
1. Insert new batches, courses, faculty, rooms via the Supabase insert tool
2. Insert teaching assignments linking them together
3. No schema changes needed — all tables already exist

## Files
No file changes — data-only inserts via the database insert tool.

