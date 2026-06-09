import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateCandidate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function CandidateNew() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createCandidate = useCreateCandidate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    resumeUrl: "",
    notes: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = await createCandidate.mutateAsync({
      data: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        source: form.source.trim() || undefined,
        resumeUrl: form.resumeUrl.trim() || undefined,
        notes: form.notes.trim() || undefined,
      },
    });
    await queryClient.invalidateQueries();
    toast({ title: "Candidate created", description: `${candidate.name} was added to the talent pool.` });
    setLocation(`/candidates/${candidate.id}`);
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/candidates">
          <Button variant="outline" size="icon" aria-label="Back to candidates">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Candidate</h1>
          <p className="text-muted-foreground mt-1">Capture a candidate profile for future applications.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" required>
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              </Field>
              <Field label="Source">
                <Input placeholder="Referral, LinkedIn, job board" value={form.source} onChange={(event) => updateField("source", event.target.value)} />
              </Field>
            </div>
            <Field label="Resume URL">
              <Input type="url" value={form.resumeUrl} onChange={(event) => updateField("resumeUrl", event.target.value)} />
            </Field>
            <Field label="Notes">
              <Textarea rows={5} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </Field>
            <div className="flex justify-end gap-3">
              <Link href="/candidates">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createCandidate.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createCandidate.isPending ? "Saving..." : "Save Candidate"}
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
