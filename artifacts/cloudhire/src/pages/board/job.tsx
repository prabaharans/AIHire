import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetBoardJob, getGetBoardJobQueryKey, useQuickApply } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, MapPin, Briefcase, Clock, CheckCircle2 } from "lucide-react";

const applySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverLetter: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function BoardJobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id, 10);

  const { data: job, isLoading, isError } = useGetBoardJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetBoardJobQueryKey(jobId) }
  });

  const applyMutation = useQuickApply();
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string; alreadyApplied?: boolean } | null>(null);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      resumeUrl: "",
      linkedinUrl: "",
      coverLetter: "",
    }
  });

  const onSubmit = (data: ApplyFormValues) => {
    applyMutation.mutate({
      data: {
        jobId,
        ...data,
      }
    }, {
      onSuccess: (res) => {
        if (res.alreadyApplied) {
          setApplyResult({ success: true, message: "You've already applied for this role.", alreadyApplied: true });
        } else {
          setApplyResult({ success: true, message: "Application submitted! We'll be in touch." });
        }
      },
      onError: (err: any) => {
        setApplyResult({ success: false, message: err.message || "Failed to submit application. Please try again." });
      }
    });
  };

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    remote: "Remote"
  };

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30 p-8 flex justify-center items-center">Loading...</div>;
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-muted/30 p-8 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <Link href="/board">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      <div className="bg-primary text-primary-foreground py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/board" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Board
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-primary-foreground/90 text-sm md:text-base">
            <div className="flex items-center gap-1.5">
              <Building className="h-4 w-4" /> {job.department}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </div>
            {job.type && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {jobTypeLabels[job.type] || job.type}
              </div>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {job.salaryMin && job.salaryMax 
                  ? `$${(job.salaryMin/1000).toFixed(0)}k – $${(job.salaryMax/1000).toFixed(0)}k` 
                  : job.salaryMin 
                    ? `From $${(job.salaryMin/1000).toFixed(0)}k` 
                    : `Up to $${(job.salaryMax!/1000).toFixed(0)}k`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">About the Role</h2>
              <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-line">
                {job.description || "No description provided."}
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Requirements</h2>
              <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-line">
                {job.requirements || "No requirements provided."}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle>Apply for this role</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {applyResult?.success ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">{applyResult.message}</h3>
                    {applyResult.alreadyApplied && (
                      <p className="text-sm text-muted-foreground">We have your previous application on file.</p>
                    )}
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jane@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resumeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resume URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="coverLetter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell us why you're a great fit..." className="h-32" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {applyResult?.success === false && (
                        <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md">
                          {applyResult.message}
                        </div>
                      )}
                      <Button type="submit" className="w-full mt-2" disabled={applyMutation.isPending}>
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
      
      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-12 bg-card max-w-5xl mx-auto">
        <p>Powered by AIHire</p>
      </footer>
    </div>
  );
}
