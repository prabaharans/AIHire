import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Zap, Trash2 } from "lucide-react";
import { useApplicantProfile } from "@/hooks/use-applicant-profile";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function BoardProfile() {
  const { profile, saveProfile, clearProfile } = useApplicantProfile();
  const [, navigate] = useLocation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
        resumeUrl: profile.resumeUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
      });
    }
  }, [profile]);

  function onSubmit(data: ProfileFormValues) {
    saveProfile(data);
    navigate("/board");
  }

  function handleClear() {
    clearProfile();
    form.reset({ name: "", email: "", phone: "", resumeUrl: "", linkedinUrl: "" });
    navigate("/board");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/board" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Board
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Auto Apply Profile</h1>
              <p className="text-primary-foreground/80 text-sm mt-0.5">
                Save your details once, apply to any job with one click.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your details</CardTitle>
            <CardDescription>
              These will be used to pre-fill applications. You can update them anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

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
                    <FormControl><Input placeholder="https://drive.google.com/..." {...field} /></FormControl>
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

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Zap className="h-4 w-4" />
                    Save &amp; Enable Auto Apply
                  </Button>
                  {profile && (
                    <Button type="button" variant="outline" onClick={handleClear} className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive">
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-8 bg-card">
        <p>Powered by <span className="font-semibold text-indigo-600">AIHire</span></p>
      </footer>
    </div>
  );
}
