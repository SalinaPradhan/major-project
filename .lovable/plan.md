

# Plan: Redesign Faculty & Student Dashboards to Match New Reference

## Key Differences from Current Implementation

### Faculty Dashboard
1. **Metrics row**: Current uses icon+card layout with colored backgrounds. Reference uses plain `metric` boxes with `bg-secondary`, no icons, larger 22px values, and percentage text like "83% · On track" in green.
2. **Timeline**: Current is compact horizontal rows. Reference uses a more spacious layout with `timeline-row` borders, colored dots (blue=#185FA5, green=#3B6D11, amber=#854F0B), room capacity shown in subtitle, and "Next class" highlighted with a blue left border + label.
3. **Workload card**: Current uses shadcn Progress component. Reference uses a custom `load-bar-bg`/`load-bar-fill` with labels "0 hrs / Safe zone / 18 hrs max" below, and an "On track" badge next to the value.
4. **Swap panel**: Current is minimal. Reference shows styled swap rows with "Mon 9:00 AM → Wed 2:00 PM" titles, status badges (Pending amber, Approved green), Cancel/Details buttons, and a full-width "+ New swap request" button at bottom.
5. **Weekly grid**: Current uses `<table>`. Reference uses CSS grid (`grid-template-columns: 60px repeat(6,1fr)`) with 32px-height cells, color-coded borders (Lecture=#85B7EB, Lab=#97C459, Tutorial=#EF9F27), and "This week / Next week" tab toggle.
6. **Availability grid**: Current uses table. Reference uses CSS grid with 22px cells, three states visually distinct (available=secondary, preferred=green bg+border, unavailable=red bg+border), legend bar at top, summary text at bottom.

### Student Dashboard
1. **Metrics row**: Current has none. Reference has 4 metric boxes: Today's classes (count + breakdown), Next class in (countdown), This week (hours), Announcements (count).
2. **Today's classes**: Current uses a `<Table>`. Reference uses card-based `class-card` items with dot+time+body layout, "Next" badge on the upcoming class with blue highlight, tags showing type + seat count.
3. **Next class widget**: New component — circular SVG countdown ring (80x80) showing minutes left, course name, room + floor, instructor, "Get directions" button.
4. **Announcements**: Current is in bottom section. Reference puts it in the right column alongside the countdown widget, with colored dots (red=urgent, blue=info, green=holiday) and urgency badges.
5. **Weekly grid**: Current in bottom 2-col. Reference is a full-width card at bottom with legend + tab toggle, today's column highlighted with `wg-today` outline.

## Files to Modify

### `src/components/dashboard/FacultyMetrics.tsx`
Remove icons. Use plain divs with `bg-secondary` background, `text-[22px] font-medium` values. "Weekly load" shows `15 / 18 hrs` with green sub text. "Swap requests" value in amber when pending. No card borders — just rounded metric boxes in a flex row.

### `src/components/dashboard/ScheduleTimeline.tsx`
Restyle to match reference `timeline-row` pattern: flex rows with bottom border, `time-col` (72px, 12px font), colored dots (10px, specific hex colors), course name + subtitle (batch · room · capacity), type badge (Lecture/Lab/Tutorial with reference colors #E6F1FB/#0C447C etc). "Next class" row gets blue left border + "Next class" sub-label. Free periods at 50% opacity with gray dot.

### `src/components/dashboard/WorkloadCard.tsx`
Replace Progress component with custom bar (`h-2 rounded bg-secondary` with green fill div). Add "On track" badge. Add "0 hrs / Safe zone / 18 hrs max" labels below bar. Breakdown uses flex justify-between rows.

### `src/components/dashboard/FacultySwapPanel.tsx`
Restyle swap rows: title "Mon 9:00 AM → Wed 2:00 PM" with status badge on right. Detail line for course + reason. Cancel + Details buttons (`btn-sm` style). Full-width "+ New swap request" button at bottom.

### `src/components/dashboard/WeeklyGrid.tsx`
Switch from `<table>` to CSS grid layout. Add "This week / Next week" tab toggle (pill tabs). Cells 32px height (faculty) / 30px (student), with type-specific backgrounds AND border colors. Support `todayColumn` prop for student view highlighting. Add legend for student mode. Accept `summaryText` for footer.

### `src/components/dashboard/AvailabilityGrid.tsx`
Switch from `<table>` to CSS grid (56px + repeat(6,1fr)). Cells 22px height. Remove text labels from cells — just colored backgrounds. Legend as inline spans with colored squares. "Save ↗" button in header.

### `src/components/dashboard/StudentScheduleTable.tsx`
Complete redesign from table to card-based layout. Each class is a `class-card` div (border, rounded, flex with gap). Time column shows start/end times stacked. Colored dot (blue=lecture, green=lab, amber=tutorial). Body has title, subtitle (instructor · room + floor + block), tags row with type badge. "Next" class gets blue border + "Next" pill badge. Remove the table entirely.

### `src/pages/StudentDashboard.tsx`
Add 4 metric boxes row (Today's classes, Next class countdown, This week hours, Announcements count). Middle section: 2-col grid (1.5fr left: Today's classes cards, 1fr right: Countdown ring widget + Announcements). Bottom: full-width Weekly timetable card with legend + tab toggle. Add countdown ring SVG component inline.

### `src/pages/FacultyDashboard.tsx`
Update header text size (16px not 2xl). Metric boxes use flex row not grid. Grid gaps reduced to 14px (gap-3.5). No layout structure changes needed — just ensure components render with updated styling.

### `src/components/dashboard/AnnouncementsPanel.tsx`
Restyle to match reference: colored dots (red=#E24B4A, blue=#185FA5, green=#3B6D11) instead of generic primary dot. Notice rows with bottom border. Urgency badges use reference colors (Urgent=red bg #FCEBEB, Room change=blue #E6F1FB, Holiday=green #EAF3DE). Timestamps as inline text next to badge.

## Color Reference (exact hex from HTML)
- Lecture: bg=#E6F1FB, text=#0C447C, border=#85B7EB, dot=#185FA5
- Lab: bg=#EAF3DE, text=#27500A, border=#97C459, dot=#3B6D11
- Tutorial: bg=#FAEEDA, text=#633806, border=#EF9F27, dot=#854F0B
- Pending: bg=#FAEEDA, text=#633806
- Approved: bg=#EAF3DE, text=#27500A
- Rejected: bg=#FCEBEB, text=#791F1F
- Preferred: bg=#EAF3DE, border=#97C459
- Unavailable: bg=#FCEBEB, border=#F09595

