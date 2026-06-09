import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useGetBoardJob, getGetBoardJobQueryKey, useQuickApply } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, MapPin, Briefcase, Clock, CheckCircle2, Zap, User, ChevronDown } from "lucide-react";
import { useApplicantProfile } from "@/hooks/use-applicant-profile";

const applySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverLetter: z.string().optional(),
  saveProfile: z.boolean().default(true),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function BoardJobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id, 10);
  const { profile, hasProfile, saveProfile } = useApplicantProfile();

  const { data: job, isLoading, isError } = useGetBoardJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetBoardJobQueryKey(jobId) },
  });

  const applyMutation = useQuickApply();
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string; alreadyApplied?: boolean } | null>(null);
  const [showFullForm, setShowFullForm] = useState(!hasProfile);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
      coverLetter: "",
      saveProfile: !hasProfile,
    },
  });

  // Keep form in sync if profile loads after mount
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
        resumeUrl: profile.resumeUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        coverLetter: "",
        saveProfile: false,
      });
    }
  }, [profile]);

  function submitApplication(data: ApplyFormValues) {
    applyMutation.mutate(
      { data: { jobId, name: data.name, email: data.email, phone: data.phone, resumeUrl: data.resumeUrl, linkedinUrl: data.linkedinUrl, coverLetter: data.coverLetter } },
      {
        onSuccess: (res) => {
          if (data.saveProfile) {
            saveProfile({ name: data.name, email: data.email, phone: data.phone, resumeUrl: data.resumeUrl, linkedinUrl: data.linkedinUrl });
          }
          setApplyResult({
            success: true,
            message: res.alreadyApplied ? "You've already applied for this role." : "Application submitted! We'll be in touch.",
            alreadyApplied: res.alreadyApplied,
          });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to submit application.";
          setApplyResult({ success: false, message: msg });
        },
      }
    );
  }

  function handleAutoApply() {
    if (!profile) return;
    applyMutation.mutate(
      { data: { jobId, ...profile } },
      {
        onSuccess: (res) => {
          setApplyResult({
            success: true,
            message: res.alreadyApplied ? "You've already applied for this role." : "Application submitted! We'll be in touch.",
            alreadyApplied: res.alreadyApplied,
          });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to submit application.";
          setApplyResult({ success: false, message: msg });
        },
      }
    );
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    remote: "Remote",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <Link href="/board">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/board" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Board
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-primary-foreground/90 text-sm md:text-base">
            <span className="flex items-center gap-1.5"><Building className="h-4 w-4" />{job.department}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            {job.type && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{jobTypeLabels[job.type] ?? job.type}</span>}
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {job.salaryMin && job.salaryMax
                  ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
                  : job.salaryMin ? `From $${(job.salaryMin / 1000).toFixed(0)}k` : `Up to $${(job.salaryMax! / 1000).toFixed(0)}k`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Job details */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">About the Role</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description ?? "No description provided."}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Requirements</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.requirements ?? "No requirements provided."}
              </div>
            </section>
          </div>

          {/* Apply card */}
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle>Apply for this role</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {applyResult?.success ? (
                  /* Success state */
                  <div className="text-center py-6 space-y-4">
                    <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{applyResult.alreadyApplied ? "Already applied" : "Application sent!"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{applyResult.message}</p>
                    </div>
                    <Link href="/board">
                      <Button variant="outline" className="w-full mt-2">Browse more roles</Button>
                    </Link>
                  </div>
                ) : hasProfile && !showFullForm ? (
                  /* Auto Apply mode */
                  <div className="space-y-4">
                    {/* Profile summary */}
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-indigo-900 truncate">{profile?.name}</p>
                        <p className="text-xs text-indigo-600 truncate">{profile?.email}</p>
                        {profile?.phone && <p className="text-xs text-indigo-500">{profile.phone}</p>}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11"
                      onClick={handleAutoApply}
                      disabled={applyMutation.isPending}
                    >
                      <Zap className="h-4 w-4" />
                      {applyMutation.isPending ? "Submitting..." : "Auto Apply"}
                    </Button>

                    {applyResult?.success === false && (
                      <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md">
                        {applyResult.message}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowFullForm(true)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      Add cover letter or edit details
                    </button>
                  </div>
                ) : (
                  /* Full form */
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(submitApplication)} className="space-y-4">
                      {hasProfile && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Applying as <span className="font-medium text-foreground">{profile?.name}</span></span>
                          <button type="button" className="hover:text-foreground" onClick={() => setShowFullForm(false)}>
                            Use Auto Apply
                          </button>
                        </div>
                      )}

                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl><Input type="tel" placeholder="+1 (555) 000-0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume URL</FormLabel>
                          <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="coverLetter" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us why you're a great fit..." className="h-28 resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Save profile toggle — only show if no profile yet */}
                      {!hasProfile && (
                        <FormField control={form.control} name="saveProfile" render={({ field }) => (
                          <FormItem className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="text-sm font-medium text-indigo-900 cursor-pointer">
                                Enable Auto Apply
                              </FormLabel>
                              <p className="text-xs text-indigo-600 mt-0.5">
                                Save your profile to apply to future roles with one click.
                              </p>
                            </div>
                          </FormItem>
                        )} />
                      )}

                      {applyResult?.success === false && (
                        <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md">
                          {applyResult.message}
                        </div>
                      )}

                      <Button type="submit" className="w-full h-11" disabled={applyMutation.isPending}>
                        {applyMutation.isPending ? "Submitting..." : "Apply Now"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-12 bg-card">
        <p>Powered by <span className="font-semibold text-indigo-600">AIHire</span></p>
      </footer>
    </div>
  );
}
