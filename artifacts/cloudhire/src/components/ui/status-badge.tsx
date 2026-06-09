import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { ApplicationStage, JobStatus, InterviewStatus } from "@workspace/api-client-react";

const badgeVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "text-foreground",
      success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
      neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function StatusBadge({ 
  status, 
  type 
}: { 
  status: string; 
  type: "job" | "application" | "interview" 
}) {
  let variant: VariantProps<typeof badgeVariants>["variant"] = "neutral";
  let label = status;

  if (type === "job") {
    switch (status as JobStatus) {
      case JobStatus.open: variant = "success"; label = "Open"; break;
      case JobStatus.draft: variant = "neutral"; label = "Draft"; break;
      case JobStatus.paused: variant = "warning"; label = "Paused"; break;
      case JobStatus.closed: variant = "destructive"; label = "Closed"; break;
    }
  } else if (type === "application") {
    switch (status as ApplicationStage) {
      case ApplicationStage.applied: variant = "neutral"; label = "Applied"; break;
      case ApplicationStage.screening: variant = "info"; label = "Screening"; break;
      case ApplicationStage.interview: variant = "warning"; label = "Interviewing"; break;
      case ApplicationStage.offer: variant = "success"; label = "Offered"; break;
      case ApplicationStage.hired: variant = "success"; label = "Hired"; break;
      case ApplicationStage.rejected: variant = "destructive"; label = "Rejected"; break;
    }
  } else if (type === "interview") {
    switch (status as InterviewStatus) {
      case InterviewStatus.scheduled: variant = "info"; label = "Scheduled"; break;
      case InterviewStatus.completed: variant = "success"; label = "Completed"; break;
      case InterviewStatus.cancelled: variant = "destructive"; label = "Cancelled"; break;
    }
  }

  return (
    <Badge className={badgeVariants({ variant })} variant="outline">
      {label}
    </Badge>
  );
}
