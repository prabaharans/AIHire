import { useGetDashboardStats, useGetPipelineOverview, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, FileText, CheckCircle2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/format";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineOverview();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your hiring pipeline and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Jobs" value={stats?.totalJobs} icon={Briefcase} loading={statsLoading} />
        <StatCard title="Open Jobs" value={stats?.openJobs} icon={Briefcase} loading={statsLoading} />
        <StatCard title="Total Candidates" value={stats?.totalCandidates} icon={Users} loading={statsLoading} />
        <StatCard title="Hired This Month" value={stats?.hiredThisMonth} icon={CheckCircle2} loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <PipelineBar label="Applied" value={pipeline?.applied || 0} max={pipeline?.applied || 1} />
                <PipelineBar label="Screening" value={pipeline?.screening || 0} max={pipeline?.applied || 1} />
                <PipelineBar label="Interviewing" value={pipeline?.interview || 0} max={pipeline?.applied || 1} />
                <PipelineBar label="Offered" value={pipeline?.offer || 0} max={pipeline?.applied || 1} />
                <PipelineBar label="Hired" value={pipeline?.hired || 0} max={pipeline?.applied || 1} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {activity?.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.candidateName && <span className="font-medium text-foreground">{item.candidateName}</span>}
                        {item.candidateName && item.jobTitle && " applied for "}
                        {item.jobTitle && <span className="font-medium text-foreground">{item.jobTitle}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4">No recent activity.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading }: { title: string; value?: number; icon: any; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${Math.max(percentage, 2)}%` }} 
        />
      </div>
    </div>
  );
}