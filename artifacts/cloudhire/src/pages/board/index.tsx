import { useState } from "react";
import { Link } from "wouter";
import { useListBoardJobs, useQuickApply } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Search, Briefcase, Zap, CheckCircle2, User, X, ChevronRight } from "lucide-react";
import { useApplicantProfile } from "@/hooks/use-applicant-profile";
import { useToast } from "@/hooks/use-toast";

type ApplyState = "idle" | "loading" | "done" | "already";

export default function BoardIndex() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [applyStates, setApplyStates] = useState<Record<number, ApplyState>>({});

  const { profile, hasProfile, clearProfile } = useApplicantProfile();
  const { toast } = useToast();
  const applyMutation = useQuickApply();

  const { data: jobs, isLoading } = useListBoardJobs({
    search: search || undefined,
    department: department && department !== "all" ? department : undefined,
    type: type && type !== "all" ? (type as "full_time" | "part_time" | "contract" | "remote") : undefined,
    location: location || undefined,
  });

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    remote: "Remote",
  };

  function handleAutoApply(jobId: number, jobTitle: string) {
    if (!profile) return;
    setApplyStates((s) => ({ ...s, [jobId]: "loading" }));
    applyMutation.mutate(
      { data: { jobId, ...profile } },
      {
        onSuccess: (res) => {
          const next: ApplyState = res.alreadyApplied ? "already" : "done";
          setApplyStates((s) => ({ ...s, [jobId]: next }));
          toast({
            title: res.alreadyApplied ? "Already applied" : "Application sent!",
            description: res.alreadyApplied
              ? `You already applied for ${jobTitle}.`
              : `Your application for ${jobTitle} was submitted.`,
          });
        },
        onError: () => {
          setApplyStates((s) => ({ ...s, [jobId]: "idle" }));
          toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Hero */}
      <header className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Find your next role at AIHire</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Browse open positions and apply in minutes.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative text-foreground">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder="Search for roles..."
              className="pl-12 h-14 text-base rounded-full shadow-lg border-0 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Auto Apply profile banner */}
        {hasProfile && profile ? (
          <div className="flex items-center justify-between gap-4 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Auto Apply is active</p>
                <p className="text-xs text-indigo-600">{profile.name} &middot; {profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/board/profile">
                <Button variant="outline" size="sm" className="text-indigo-700 border-indigo-300 hover:bg-indigo-100 h-8">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Edit profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100"
                onClick={clearProfile}
                title="Remove saved profile"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-card border rounded-xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">Enable Auto Apply</p>
                <p className="text-xs text-muted-foreground">Save your profile once, apply to any job with one click.</p>
              </div>
            </div>
            <Link href="/board/profile">
              <Button size="sm" variant="outline" className="h-8 shrink-0">
                Set up profile
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card p-4 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground px-1">Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground px-1">Job Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground px-1">Location</label>
            <Input
              placeholder="e.g. San Francisco or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        {/* Job list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Open Roles {jobs?.length !== undefined && `(${jobs.length})`}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-52 animate-pulse bg-card" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium">No roles found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setSearch(""); setDepartment(""); setType(""); setLocation(""); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const state = applyStates[job.id] ?? "idle";
                const applied = state === "done" || state === "already";

                return (
                  <Card key={job.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-3 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                        {applied && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="bg-secondary/50 font-normal">
                          <Building className="h-3 w-3 mr-1.5" />
                          {job.department}
                        </Badge>
                        {job.type && (
                          <Badge variant="outline" className="font-normal text-muted-foreground">
                            {jobTypeLabels[job.type] ?? job.type}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="py-0 pb-4">
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 shrink-0" />
                            <span>
                              {job.salaryMin && job.salaryMax
                                ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
                                : job.salaryMin
                                  ? `From $${(job.salaryMin / 1000).toFixed(0)}k`
                                  : `Up to $${(job.salaryMax! / 1000).toFixed(0)}k`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 border-t bg-muted/20 gap-2">
                      {applied ? (
                        <div className="w-full flex items-center justify-center gap-2 text-sm text-green-600 font-medium py-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {state === "already" ? "Already applied" : "Application sent"}
                        </div>
                      ) : hasProfile ? (
                        <>
                          <Button
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                            disabled={state === "loading"}
                            onClick={() => handleAutoApply(job.id, job.title)}
                          >
                            <Zap className="h-3.5 w-3.5" />
                            {state === "loading" ? "Applying..." : "Auto Apply"}
                          </Button>
                          <Link href={`/board/${job.id}`} className="shrink-0">
                            <Button variant="outline" size="icon" title="View full listing">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Link href={`/board/${job.id}`} className="w-full">
                          <Button className="w-full">View &amp; Apply</Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-auto bg-card">
        <p>Powered by <span className="font-semibold text-indigo-600">AIHire</span></p>
      </footer>
    </div>
  );
}
