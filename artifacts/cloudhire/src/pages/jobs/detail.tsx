import { Link, useRoute } from "wouter";
import type { ComponentType } from "react";
import { useGetJob, useListApplications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { ArrowLeft, Briefcase, MapPin, Users } from "lucide-react";

const pipelineStages = ["applied", "screening", "interview", "offer", "hired", "rejected"];

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = Number(params?.id);
  const { data: job, isLoading } = useGetJob(id, { query: { enabled: !!id } });
  const { data: applications, isLoading: applicationsLoading } = useListApplications(
    id ? { jobId: id } : undefined,
    { query: { enabled: !!id } },
  );

  const counts = pipelineStages.reduce<Record<string, number>>((acc, stage) => {
    acc[stage] = applications?.filter((application) => application.stage === stage).length ?? 0;
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="outline" size="icon" aria-label="Back to jobs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-9 w-72" />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{job?.title ?? "Job"}</h1>
              {job && <StatusBadge status={job.status} type="job" />}
            </div>
          )}
          <p className="text-muted-foreground mt-1">Role details and candidate pipeline.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-48" />
                </>
              ) : job ? (
                <>
                  <InfoRow icon={Briefcase} label="Department" value={job.department} />
                  <InfoRow icon={MapPin} label="Location" value={job.location} />
                  <InfoRow icon={Briefcase} label="Type" value={labelize(job.type)} />
                  <InfoRow icon={Briefcase} label="Created" value={formatDate(job.createdAt)} />
                  <InfoRow icon={Briefcase} label="Compensation" value={salaryRange(job.salaryMin, job.salaryMax)} />
                  <Link href={`/board/${job.id}`}>
                    <Button variant="outline" className="w-full">View public posting</Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Job not found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelineStages.map((stage) => (
                <div key={stage} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm font-medium">{labelize(stage)}</span>
                  <span className="text-sm text-muted-foreground">{counts[stage] ?? 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
              {job?.description || "No description has been added."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
              {job?.requirements || "No requirements have been added."}
            </CardContent>
          </Card>

          <Card className="p-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {applicationsLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : applications && applications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          {application.candidate ? (
                            <Link href={`/candidates/${application.candidateId}`} className="font-medium hover:text-primary">
                              {application.candidate.name}
                            </Link>
                          ) : (
                            `Candidate ${application.candidateId}`
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={application.stage} type="application" />
                        </TableCell>
                        <TableCell>{formatDate(application.appliedAt)}</TableCell>
                        <TableCell>{formatRelativeDate(application.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">Share the public posting to start collecting candidates.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function salaryRange(min?: number | null, max?: number | null) {
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `From ${formatCurrency(min)}`;
  if (max) return `Up to ${formatCurrency(max)}`;
  return "Not listed";
}

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
