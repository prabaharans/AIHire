import { Link, useRoute } from "wouter";
import type { ComponentType } from "react";
import { useGetCandidate, useListApplications } from "@workspace/api-client-react";
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
import { formatDate, formatRelativeDate } from "@/lib/format";
import { ArrowLeft, ExternalLink, FileText, Mail, Phone } from "lucide-react";

export default function CandidateDetail() {
  const [, params] = useRoute("/candidates/:id");
  const id = Number(params?.id);
  const { data: candidate, isLoading } = useGetCandidate(id, { query: { enabled: !!id } });
  const { data: applications, isLoading: applicationsLoading } = useListApplications(
    id ? { candidateId: id } : undefined,
    { query: { enabled: !!id } },
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/candidates">
          <Button variant="outline" size="icon" aria-label="Back to candidates">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          {isLoading ? (
            <Skeleton className="h-9 w-64" />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{candidate?.name ?? "Candidate"}</h1>
          )}
          <p className="text-muted-foreground mt-1">Candidate profile and application history.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : candidate ? (
              <>
                <InfoRow icon={Mail} label="Email" value={candidate.email} href={`mailto:${candidate.email}`} />
                {candidate.phone && <InfoRow icon={Phone} label="Phone" value={candidate.phone} />}
                <InfoRow icon={FileText} label="Source" value={candidate.source || "Direct"} />
                <InfoRow icon={FileText} label="Created" value={formatDate(candidate.createdAt)} />
                {candidate.resumeUrl && (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Open resume
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {candidate.notes || "No notes yet."}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Candidate not found.</p>
            )}
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
                    <TableHead>Job</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {application.job ? (
                          <Link href={`/jobs/${application.jobId}`} className="font-medium hover:text-primary">
                            {application.job.title}
                          </Link>
                        ) : (
                          `Job ${application.jobId}`
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={application.stage} type="application" />
                      </TableCell>
                      <TableCell>{formatDate(application.appliedAt)}</TableCell>
                      <TableCell>{formatRelativeDate(application.updatedAt)}</TableCell>
                      <TableCell className="max-w-xs truncate">{application.notes || "No notes"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">No applications for this candidate yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = href ? (
    <a href={href} className="font-medium hover:text-primary">{value}</a>
  ) : (
    <span className="font-medium">{value}</span>
  );

  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {content}
      </div>
    </div>
  );
}
