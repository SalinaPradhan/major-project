

# Plan: Add Sample Data & Test

## What We'll Do
Insert realistic sample data into all empty tables so you can immediately test the full workflow — from dashboard stats to timetable generation.

## Sample Data to Insert

### 1. Departments (3)
- Computer Science (CS)
- Electronics & Communication (ECE)  
- Mathematics (MATH)

### 2. Rooms (4 more, keeping existing LHC-100)
- LHC-101 (classroom, 60 cap)
- LHC-102 (classroom, 40 cap)
- CS-Lab-1 (lab, 30 cap)
- ECE-Lab-1 (lab, 30 cap)

### 3. Faculty (6)
- Dr. Sharma (CS), Dr. Gupta (CS), Dr. Patel (ECE), Dr. Singh (ECE), Dr. Rao (MATH), Dr. Joshi (MATH)

### 4. Courses (6)
- CS101 Data Structures, CS201 Algorithms (CS)
- ECE101 Circuits, ECE201 Signals (ECE)
- MATH101 Calculus, MATH201 Linear Algebra (MATH)

### 5. Batches (4)
- CS-2026-A (Sem 3, 45 students), CS-2026-B (Sem 3, 40 students)
- ECE-2026-A (Sem 3, 50 students), MATH-2026-A (Sem 1, 35 students)

### 6. Teaching Assignments (8)
Map each faculty to their courses and batches (including one lab assignment for CS-Lab)

## Technical Details
- Use the database insert tool for all data operations (no migrations needed)
- Foreign keys will be linked by inserting departments first, then referencing their IDs in faculty/courses/batches
- All data uses existing enum values (`classroom`, `lab`, `auditorium` for rooms; correct day values)
- After insertion, you can test: Dashboard stats, CRUD on each page, Teaching Assignments page, and eventually timetable generation

