import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import PublicHome from "./pages/PublicHome";

function ProtectedShell({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }

function Router() {
  return <Switch>
    <Route path="/" component={PublicHome} />
    <Route path="/app">{() => <ProtectedShell><Home /></ProtectedShell>}</Route>
    <Route path="/projects/:id">{() => <ProtectedShell><ProjectWorkspace /></ProtectedShell>}</Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Router /><Toaster richColors position="top-right" /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
