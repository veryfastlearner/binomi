import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EntryProvider, useEntry } from "@/contexts/EntryContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EntryPage from "./pages/Entry";
import QuestionnairePage from "./pages/Questionnaire";
import HomePage from "./pages/Home";
import SetupMatchPage from "./pages/SetupMatch";
import NegotiationLogPage from "./pages/NegotiationLog";
import MyClonePage from "./pages/MyClone";
import MyMatchesPage from "./pages/MyMatches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEntry();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useEntry();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <EntryPage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
      <Route path="/match/setup" element={<ProtectedRoute><SetupMatchPage /></ProtectedRoute>} />
      <Route path="/match/log/:matchId" element={<ProtectedRoute><NegotiationLogPage /></ProtectedRoute>} />
      <Route path="/clone" element={<ProtectedRoute><MyClonePage /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><MyMatchesPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <EntryProvider>
            <AppRoutes />
          </EntryProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;