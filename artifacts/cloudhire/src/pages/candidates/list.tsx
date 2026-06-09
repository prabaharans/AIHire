import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListCandidates, useListApplications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Mail, Phone, Plus, Search, UserRound } from "lucide-react";

export default function CandidatesList() {
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();
  const { data: candidates, isLoading } = useListCandidates(
    trimmedSearch ? { search: trimmedSearch } : undefined,
  );
  const { data: applications } = useListApplications();

  const applicationCounts = useMemo(() => {
    const counts = new Map<number, number>();
    applications?.forEach((application) => {
      counts.set(application.candidateId, (counts.get(application.candidateId) ?? 0) + 1);
    });
    return counts;
  }, [applications]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
          <p className="text-muted-foreground mt-1">Search the talent pool and review candidate records.</p>
        </div>
        <Link href="/candidates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Candidate
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search candidates by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : candidates && candidates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserRound className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Link href={`/candidates/${candidate.id}`} className="font-medium hover:text-primary">
                          {candidate.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">ID {candidate.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a className="hover:text-primary" href={`mailto:${candidate.email}`}>
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {candidate.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{candidate.source || "Direct"}</TableCell>
                  <TableCell>{applicationCounts.get(candidate.id) ?? 0}</TableCell>
                  <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/candidates/${candidate.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12">
            <UserRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No candidates found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {trimmedSearch ? "Try a different search term." : "Create a candidate to start building your talent pool."}
            </p>
            <Link href="/candidates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Candidate
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
