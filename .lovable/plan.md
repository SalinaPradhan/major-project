

# Import Full College Timetable Data

## What I Found in the Spreadsheet

The Excel file contains the complete B.Tech 2022 Batch, 3rd Semester timetable for NIST with:

| Data | Count |
|------|-------|
| Departments | 8 (CSE, ECE, EE&EEE, ME, CE, MBA, Mathematics, Chemistry) |
| Courses | 19 (DSUC, DBMS, CNDC, DLD, OB, MATH, EEC, CT, DCMT, AEC, SS, NT, MOS, IPMEM, TD, MM, SURV, CMT, ES) |
| Sections (Batches) | 13 (CSE A-E, CST, IT A-B, ECS, ECE, EE/EEE, CE, ME) |
| Faculty | 56 members with section assignments |
| Rooms | ~15 classrooms + ~14 labs |
| Teaching Assignments | ~80+ faculty-course-batch mappings |

## Plan

### Step 1: Insert Departments
Insert 8 departments with codes: CSE, ECE, EE, ME, CE, MBA, MATH, CHEM

### Step 2: Insert Courses
Insert 19 courses with proper codes, names, credit hours, and lab flags. Examples:
- DSUC (Data Structure Using C) — has lab
- DBMS (Database Management System) — has lab
- DLD (Digital Logic Design) — has lab
- MATH (Mathematics-III) — no lab

### Step 3: Insert Batches
Insert 13 batches with section names, strengths (from roll number ranges), and department linkage.

### Step 4: Insert Rooms
Insert classrooms (ATR-305, ATR-306, etc.) and labs (CNDC Lab, DBMS Lab, DS Lab, DLD Lab, etc.) with proper room types.

### Step 5: Insert Faculty
Insert all 56 faculty members with department linkage, extracted from Page 2 of the spreadsheet.

### Step 6: Create Teaching Assignments
Map each faculty to their course(s) and batch(es) as specified in the spreadsheet — approximately 80+ assignments including lab flags.

### Technical Approach
- Write a Python script that uses the Supabase REST API to insert data in dependency order (departments first, then courses/batches/rooms, then faculty, then teaching assignments)
- Each insert will capture returned IDs for use in subsequent foreign key references
- After import, the system will be ready to generate timetables via the AI Scheduler

### What Won't Be Imported
- The actual schedule grid itself — the purpose is to populate the system with the right data so the GA engine can **generate** an optimized timetable from scratch
- Library periods and ATTP (non-course activities)

