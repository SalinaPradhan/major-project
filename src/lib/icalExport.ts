/**
 * iCal (.ics) export utility for timetable schedule entries.
 */

export interface ICalEntry {
  courseName: string;
  roomName: string;
  instructorName?: string;
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  isLab?: boolean;
}

const DAY_TO_ICAL: Record<string, string> = {
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
  sunday: 'SU',
};

const DAY_TO_JS: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function getNextOccurrence(dayName: string): Date {
  const today = new Date();
  const target = DAY_TO_JS[dayName] ?? 1;
  const current = today.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next;
}

function formatICalDate(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
}

function escapeICalText(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@timetable`;
}

export function generateICalString(entries: ICalEntry[], calendarName = 'My Timetable'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//University Timetable//EN',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const entry of entries) {
    const icalDay = DAY_TO_ICAL[entry.day];
    if (!icalDay) continue;

    const nextDate = getNextOccurrence(entry.day);
    const dtStart = formatICalDate(nextDate, entry.startTime);
    const dtEnd = formatICalDate(nextDate, entry.endTime);
    const summary = entry.isLab ? `🔬 ${entry.courseName} (Lab)` : entry.courseName;
    const description = entry.instructorName ? `Instructor: ${entry.instructorName}` : '';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTAMP:${formatICalDate(new Date(), `${new Date().getHours()}:${new Date().getMinutes()}`)}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${icalDay}`,
      `SUMMARY:${escapeICalText(summary)}`,
      `LOCATION:${escapeICalText(entry.roomName)}`,
      ...(description ? [`DESCRIPTION:${escapeICalText(description)}`] : []),
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICalFile(entries: ICalEntry[], fileName = 'timetable.ics', calendarName?: string) {
  const icsContent = generateICalString(entries, calendarName);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
