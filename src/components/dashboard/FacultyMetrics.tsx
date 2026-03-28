interface FacultyMetricsProps {
  todayClasses: number;
  nextClassTime: string | null;
  weeklyLoad: number;
  maxWeeklyHours: number;
  semesterCourses: number;
  lectureCount: number;
  labCount: number;
  tutorialCount: number;
  pendingSwaps: number;
}

export function FacultyMetrics({
  todayClasses,
  nextClassTime,
  weeklyLoad,
  maxWeeklyHours,
  semesterCourses,
  lectureCount,
  labCount,
  tutorialCount,
  pendingSwaps,
}: FacultyMetricsProps) {
  const loadPercent = maxWeeklyHours > 0 ? Math.round((weeklyLoad / maxWeeklyHours) * 100) : 0;

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Today's Classes */}
      <div className="flex-1 min-w-[160px] bg-secondary rounded-xl px-4 py-3">
        <p className="text-[11px] text-muted-foreground mb-1">Today's Classes</p>
        <p className="text-[22px] font-medium text-foreground leading-tight">{todayClasses}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {nextClassTime ? `Next at ${nextClassTime}` : 'No more today'}
        </p>
      </div>

      {/* Weekly Load */}
      <div className="flex-1 min-w-[160px] bg-secondary rounded-xl px-4 py-3">
        <p className="text-[11px] text-muted-foreground mb-1">Weekly Load</p>
        <p className="text-[22px] font-medium text-foreground leading-tight">
          {weeklyLoad} / {maxWeeklyHours}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: '#3B6D11' }}>
          {loadPercent}% · On track
        </p>
      </div>

      {/* Semester Courses */}
      <div className="flex-1 min-w-[160px] bg-secondary rounded-xl px-4 py-3">
        <p className="text-[11px] text-muted-foreground mb-1">Semester Courses</p>
        <p className="text-[22px] font-medium text-foreground leading-tight">{semesterCourses}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {lectureCount} lec · {labCount} lab · {tutorialCount} tut
        </p>
      </div>

      {/* Swap Requests */}
      <div className="flex-1 min-w-[160px] bg-secondary rounded-xl px-4 py-3">
        <p className="text-[11px] text-muted-foreground mb-1">Swap Requests</p>
        <p className="text-[22px] font-medium leading-tight" style={{ color: pendingSwaps > 0 ? '#854F0B' : undefined }}>
          {pendingSwaps}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {pendingSwaps === 1 ? '1 pending' : `${pendingSwaps} pending`}
        </p>
      </div>
    </div>
  );
}
