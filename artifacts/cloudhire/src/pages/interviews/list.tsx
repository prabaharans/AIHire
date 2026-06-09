import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  InterviewStatus,
  InterviewUpdateStatus,
  ListInterviewsStatus,
  useListApplications,
  useListInterviews,
  useUpdateInterview,
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
import { formatDateTime } from "@/lib/format";
import { CalendarClock, Star } from "lucide-react";

const statuses = Object.values(InterviewStatus);

export default function InterviewsList() {
  const [statusFilter, setStatusFilter] = useState<"all" | ListInterviewsStatus>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: interviews, isLoading } = useListInterviews(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const { data: applications } = useListApplications();
  const applicationMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof applications>[number]>();
    applications?.forEach((application) => map.set(application.id, application));
    return map;
  }, [applications]);
  const updateInterview = useUpdateInterview({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast({ title: "Interview updated", description: "The interview status was changed." });
      },
    },
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Interviews</h1>
          <p className="text-muted-foreground mt-1">Track scheduled interviews, outcomes, and feedback.</p>
        </div>
        <div className="w-full md:w-56">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ListInterviewsStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>
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
        ) : interviews && interviews.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => {
                const application = applicationMap.get(interview.applicationId);
                return (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{formatDateTime(interview.scheduledAt)}</TableCell>
                    <TableCell>
                      {application?.candidate ? (
                        <Link href={`/candidates/${application.candidateId}`} className="font-medium hover:text-primary">
                          {application.candidate.name}
                        </Link>
                      ) : (
                        `Application ${interview.applicationId}`
                      )}
                    </TableCell>
                    <TableCell>
                      {application?.job ? (
                        <Link href={`/jobs/${application.jobId}`} className="font-medium hover:text-primary">
                          {application.job.title}
                        </Link>
                      ) : (
                        "Unlinked"
                      )}
                    </TableCell>
                    <TableCell>{statusLabel(interview.interviewType)}</TableCell>
                    <TableCell>{interview.interviewerName}</TableCell>
                    <TableCell className="min-w-44">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={interview.status} type="interview" />
                        <Select
                          value={interview.status}
                          onValueChange={(status) =>
                            updateInterview.mutate({
                              id: interview.id,
                              data: { status: status as InterviewUpdateStatus },
                            })
                          }
                          disabled={updateInterview.isPending}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      {interview.rating ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {interview.rating}/5
                        </span>
                      ) : (
                        "Not rated"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{interview.feedback || "No feedback"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12">
            <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No interviews found</h3>
            <p className="text-sm text-muted-foreground">Scheduled interviews will appear here.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function statusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
