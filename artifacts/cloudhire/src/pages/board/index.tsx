import { useState } from "react";
import { Link } from "wouter";
import { useListBoardJobs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Search, Briefcase } from "lucide-react";
import { formatSalary } from "@/lib/format";

export default function BoardIndex() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");

  const { data: jobs, isLoading } = useListBoardJobs({
    search: search || undefined,
    department: department && department !== "all" ? department : undefined,
    type: type && type !== "all" ? type as any : undefined,
    location: location || undefined,
  });

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    remote: "Remote"
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Find your next role at AIHire</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Join our team and help build the future of hiring.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative text-foreground">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search for roles..." 
                className="pl-12 h-14 text-base rounded-full shadow-lg border-0 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Open Roles {jobs?.length !== undefined && `(${jobs.length})`}</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-48 animate-pulse bg-card" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed">
              <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No roles found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearch(""); setDepartment(""); setType(""); setLocation("");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3 flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="bg-secondary/50 font-normal">
                        <Building className="h-3 w-3 mr-1.5" />
                        {job.department}
                      </Badge>
                      {job.type && (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          {jobTypeLabels[job.type] || job.type}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-0 pb-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 shrink-0" />
                          <span>
                            {job.salaryMin && job.salaryMax 
                              ? `$${(job.salaryMin/1000).toFixed(0)}k – $${(job.salaryMax/1000).toFixed(0)}k` 
                              : job.salaryMin 
                                ? `From $${(job.salaryMin/1000).toFixed(0)}k` 
                                : `Up to $${(job.salaryMax!/1000).toFixed(0)}k`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/20">
                    <Link href={`/board/${job.id}`} className="w-full">
                      <Button className="w-full">View & Apply</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-auto bg-card">
        <p>Powered by AIHire</p>
      </footer>
    </div>
  );
}
