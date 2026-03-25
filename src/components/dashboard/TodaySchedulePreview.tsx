import { Clock, MapPin, User } from "lucide-react";
import { ScheduleSlot } from "@/types";
import { cn } from "@/lib/utils";

interface TodaySchedulePreviewProps {
  slots: ScheduleSlot[];
}

export function TodaySchedulePreview({ slots }: TodaySchedulePreviewProps) {
  const currentSlots = slots.slice(0, 5);

  return (
    <div className="glass-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Today's Schedule</h3>
        <span className="text-xs text-muted-foreground">Monday</span>
      </div>

      <div className="space-y-3">
        {currentSlots.map((slot, index) => (
          <div
            key={slot.id}
            className={cn(
              "p-3 rounded-lg border animate-slide-up",
              slot.type === 'lab' ? 'status-lab' : 'status-lecture'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{slot.courseName}</span>
              <span className="text-xs text-muted-foreground">{slot.batchName}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider opacity-70">{slot.type}</span>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {slot.startTime} - {slot.endTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {slot.roomName}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {slot.teacherName.split(' ').slice(-1)[0]}
              </span>
            </div>

            {slot.warnings && slot.warnings.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] text-warning">⚠ {slot.warnings[0]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
