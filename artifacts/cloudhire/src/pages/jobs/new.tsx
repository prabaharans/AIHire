import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { JobInputStatus, JobInputType, useCreateJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

type JobFormState = {
  title: string;
  department: string;
  location: string;
  type: JobInputType;
  status: JobInputStatus;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
};

export default function JobNew() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createJob = useCreateJob();
  const [form, setForm] = useState<JobFormState>({
    title: "",
    department: "",
    location: "",
    type: JobInputType.full_time,
    status: JobInputStatus.open,
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
  });

  function updateField<K extends keyof JobFormState>(field: K, value: JobFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = await createJob.mutateAsync({
      data: {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        type: form.type,
        status: form.status,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        description: form.description.trim() || undefined,
        requirements: form.requirements.trim() || undefined,
      },
    });
    await queryClient.invalidateQueries();
    toast({ title: "Job created", description: `${job.title} is ready for applicants.` });
    setLocation(`/jobs/${job.id}`);
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="outline" size="icon" aria-label="Back to jobs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Job</h1>
          <p className="text-muted-foreground mt-1">Publish or draft a role for the public job board.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" required>
                <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
              </Field>
              <Field label="Department" required>
                <Input value={form.department} onChange={(event) => updateField("department", event.target.value)} required />
              </Field>
              <Field label="Location" required>
                <Input value={form.location} onChange={(event) => updateField("location", event.target.value)} required />
              </Field>
              <Field label="Type">
                <Select value={form.type} onValueChange={(value) => updateField("type", value as JobInputType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobInputType.full_time}>Full Time</SelectItem>
                    <SelectItem value={JobInputType.part_time}>Part Time</SelectItem>
                    <SelectItem value={JobInputType.contract}>Contract</SelectItem>
                    <SelectItem value={JobInputType.remote}>Remote</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(value) => updateField("status", value as JobInputStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobInputStatus.open}>Open</SelectItem>
                    <SelectItem value={JobInputStatus.draft}>Draft</SelectItem>
                    <SelectItem value={JobInputStatus.paused}>Paused</SelectItem>
                    <SelectItem value={JobInputStatus.closed}>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Salary min">
                  <Input type="number" min="0" value={form.salaryMin} onChange={(event) => updateField("salaryMin", event.target.value)} />
                </Field>
                <Field label="Salary max">
                  <Input type="number" min="0" value={form.salaryMax} onChange={(event) => updateField("salaryMax", event.target.value)} />
                </Field>
              </div>
            </div>
            <Field label="Description">
              <Textarea rows={6} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </Field>
            <Field label="Requirements">
              <Textarea rows={6} value={form.requirements} onChange={(event) => updateField("requirements", event.target.value)} />
            </Field>
            <div className="flex justify-end gap-3">
              <Link href="/jobs">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createJob.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createJob.isPending ? "Saving..." : "Save Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}
