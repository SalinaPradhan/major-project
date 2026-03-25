import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ResourceUtilization } from '@/components/dashboard/ResourceUtilization';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TodaySchedulePreview } from '@/components/dashboard/TodaySchedulePreview';
import { SwapRequestsPanel } from '@/components/dashboard/SwapRequestsPanel';
import { Building2, Users, BookOpen, DoorOpen, GraduationCap, Calendar } from 'lucide-react';

export default function Index() {
  const { user, role, isAdminOrAbove, isFaculty } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'User';

  const statItems = [
    { label: 'Departments', value: stats?.departments ?? 0, icon: Building2, variant: 'default' as const, link: '/departments' },
    { label: 'Faculty', value: stats?.faculty ?? 0, icon: Users, variant: 'primary' as const, link: '/faculty' },
    { label: 'Courses', value: stats?.courses ?? 0, icon: BookOpen, variant: 'success' as const, link: '/courses' },
    { label: 'Rooms', value: stats?.rooms ?? 0, icon: DoorOpen, variant: 'warning' as const, link: '/rooms' },
    { label: 'Batches', value: stats?.batches ?? 0, icon: GraduationCap, variant: 'default' as const, link: '/batches' },
    { label: 'Schedules', value: stats?.schedules ?? 0, icon: Calendar, variant: 'primary' as const, link: '/scheduler' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdminOrAbove
            ? 'Manage your university resources, schedules and allocations'
            : isFaculty
            ? 'View your schedule and manage your preferences'
            : 'View your class schedule and timetable'}
        </p>
      </div>

      {isAdminOrAbove && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statItems.map((item) => (
              <StatCard
                key={item.label}
                title={item.label}
                value={isLoading ? '...' : item.value}
                icon={item.icon}
                variant={item.variant}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ResourceUtilization />
              <TodaySchedulePreview />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <AlertsPanel />
              <SwapRequestsPanel />
            </div>
          </div>
        </>
      )}

      {isFaculty && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TodaySchedulePreview />
          <AlertsPanel />
        </div>
      )}

      {role === 'student' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TodaySchedulePreview />
        </div>
      )}
    </div>
  );
}
