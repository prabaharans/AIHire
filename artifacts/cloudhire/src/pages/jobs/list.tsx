import { useGetJobsSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Users, LayoutList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsList() {
  const { data: jobsSummary, isLoading } = useGetJobsSummary();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage active job postings and view high-level pipeline stats.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid gap-4">
          {jobsSummary?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover-elevate cursor-pointer transition-shadow p-6 group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                      <StatusBadge status={job.status} type="job" />
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium text-foreground">{job.department}</span>
                      <span>•</span>
                      {job.totalApplications} total applications
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <LayoutList className="h-4 w-4 mr-2" />
                    View Pipeline
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center gap-6 overflow-x-auto pb-2">
                  <PipelineStat label="Applied" count={job.applied} />
                  <PipelineStat label="Screening" count={job.screening} />
                  <PipelineStat label="Interview" count={job.interview} />
                  <PipelineStat label="Offer" count={job.offer} />
                  <PipelineStat label="Hired" count={job.hired} />
                </div>
              </Card>
            </Link>
          ))}
          
          {jobsSummary?.length === 0 && (
            <div className="text-center p-12 border rounded-lg bg-card border-dashed">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first job posting to start hiring.</p>
              <Link href="/jobs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PipelineStat({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[80px]">
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">{label}</span>
    </div>
  );
}