import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApplicationStage,
  ApplicationUpdateStage,
  ListApplicationsStage,
  useListApplications,
  useUpdateApplication,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatRelativeDate } from "@/lib/format";
import { FileText } from "lucide-react";

const stages = Object.values(ApplicationStage);

export default function ApplicationsList() {
  const [stageFilter, setStageFilter] = useState<"all" | ListApplicationsStage>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: applications, isLoading } = useListApplications(
    stageFilter === "all" ? undefined : { stage: stageFilter },
  );
  const updateApplication = useUpdateApplication({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast({ title: "Application updated", description: "The pipeline stage was changed." });
      },
    },
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Review applicants and move them through the hiring pipeline.</p>
        </div>
        <div className="w-full md:w-56">
          <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as "all" | ListApplicationsStage)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>{stageLabel(stage)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : applications && applications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
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
                    {application.candidate ? (
                      <Link href={`/candidates/${application.candidateId}`} className="font-medium hover:text-primary">
                        {application.candidate.name}
                      </Link>
                    ) : (
                      `Candidate ${application.candidateId}`
                    )}
                    {application.candidate?.email && (
                      <p className="text-xs text-muted-foreground">{application.candidate.email}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {application.job ? (
                      <Link href={`/jobs/${application.jobId}`} className="font-medium hover:text-primary">
                        {application.job.title}
                      </Link>
                    ) : (
                      `Job ${application.jobId}`
                    )}
                    {application.job?.department && (
                      <p className="text-xs text-muted-foreground">{application.job.department}</p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-44">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={application.stage} type="application" />
                      <Select
                        value={application.stage}
                        onValueChange={(stage) =>
                          updateApplication.mutate({
                            id: application.id,
                            data: { stage: stage as ApplicationUpdateStage },
                          })
                        }
                        disabled={updateApplication.isPending}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage}>{stageLabel(stage)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(application.appliedAt)}</TableCell>
                  <TableCell>{formatRelativeDate(application.updatedAt)}</TableCell>
                  <TableCell className="max-w-xs truncate">{application.notes || "No notes"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-sm text-muted-foreground">Applications will appear here when candidates apply.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function stageLabel(stage: string) {
  return stage
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
