import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";

import Dashboard from "@/pages/dashboard";
import JobsList from "@/pages/jobs/list";
import JobNew from "@/pages/jobs/new";
import JobDetail from "@/pages/jobs/detail";
import CandidatesList from "@/pages/candidates/list";
import CandidateNew from "@/pages/candidates/new";
import CandidateDetail from "@/pages/candidates/detail";
import ApplicationsList from "@/pages/applications/list";
import InterviewsList from "@/pages/interviews/list";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs" component={JobsList} />
        <Route path="/jobs/new" component={JobNew} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/candidates" component={CandidatesList} />
        <Route path="/candidates/new" component={CandidateNew} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/applications" component={ApplicationsList} />
        <Route path="/interviews" component={InterviewsList} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
