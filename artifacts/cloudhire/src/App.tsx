import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
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
import BoardIndex from "@/pages/board/index";
import BoardJobDetail from "@/pages/board/job";
import BoardProfile from "@/pages/board/profile";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#4264D6",
    colorForeground: "#0C1527",
    colorMutedForeground: "#6B7D9A",
    colorDanger: "#E83A3A",
    colorBackground: "#FFFFFF",
    colorInput: "#EDF1F9",
    colorInputForeground: "#0C1527",
    colorNeutral: "#8A99B8",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50",
    formFieldLabel: "text-slate-700 font-medium",
    formFieldInput: "border-slate-300 bg-[#EDF1F9] text-slate-900",
    footerActionLink: "text-[#4264D6] font-semibold hover:text-[#3050C0]",
    footerActionText: "text-slate-500",
    footerAction: "bg-slate-50 border-t border-slate-100",
    dividerText: "text-slate-400",
    dividerLine: "bg-slate-200",
    formButtonPrimary: "bg-[#4264D6] hover:bg-[#3050C0] text-white font-semibold",
    alert: "border-red-200 bg-red-50",
    alertText: "text-red-700",
    identityPreviewEditButton: "text-[#4264D6]",
    formFieldSuccessText: "text-green-600",
    otpCodeFieldInput: "border-slate-300 bg-[#EDF1F9] text-slate-900",
    formFieldRow: "",
    logoBox: "pt-2",
    logoImage: "h-9",
    main: "",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Auth pages — outside AppLayout */}
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* Public job board */}
      <Route path="/board" component={BoardIndex} />
      <Route path="/board/profile" component={BoardProfile} />
      <Route path="/board/:id" component={BoardJobDetail} />

      {/* Admin — protected by Show when signed-in */}
      <Route>
        <Show
          when="signed-in"
          fallback={
            <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5F8FC]">
              <div className="text-center space-y-6 max-w-md px-6">
                <div className="h-16 w-16 bg-[#4264D6] rounded-2xl flex items-center justify-center mx-auto">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="7" fill="white" />
                    <path d="M5 16C5 10 10 5 16 5C19.5 5 22.7 6.6 24.9 9.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M21 16C21 18.76 18.76 21 16 21V26C21.52 26 26 21.52 26 16H21Z" fill="white" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Welcome to AIHire</h1>
                  <p className="text-slate-500 mt-2">Sign in to access the hiring dashboard.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`${basePath}/sign-in`}
                    className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#4264D6] text-white font-semibold hover:bg-[#3050C0] transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href={`${basePath}/sign-up`}
                    className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Create Account
                  </a>
                </div>
                <p className="text-sm text-slate-400">
                  Looking for jobs?{" "}
                  <a href={`${basePath}/board`} className="text-[#4264D6] hover:underline font-medium">
                    Browse the job board →
                  </a>
                </p>
              </div>
            </div>
          }
        >
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
        </Show>
      </Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back to AIHire",
            subtitle: "Sign in to your hiring dashboard",
          },
        },
        signUp: {
          start: {
            title: "Create your AIHire account",
            subtitle: "Start hiring smarter today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
