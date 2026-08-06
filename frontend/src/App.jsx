import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import JobPost from "@/pages/job-post";
import Applications from "@/pages/applications";
import Profile from "@/pages/profile";
import Agriculture from "@/pages/agriculture";
import Healthcare from "@/pages/healthcare";
import Education from "@/pages/education";
import Environmental from "@/pages/environmental";
import EnvironmentalDetail from "@/pages/environmental-detail";
import Grievances from "@/pages/grievances";
import GrievanceDetail from "@/pages/grievance-detail";
import Admin from "@/pages/admin";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchInterval: 15000
    }
  }
});
function Router() {
  return <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/post" component={JobPost} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/applications" component={Applications} />
      <Route path="/profile" component={Profile} />
      <Route path="/agriculture" component={Agriculture} />
      <Route path="/healthcare" component={Healthcare} />
      <Route path="/education" component={Education} />
      <Route path="/environmental" component={Environmental} />
      <Route path="/environmental/:id" component={EnvironmentalDetail} />
      <Route path="/grievances" component={Grievances} />
      <Route path="/grievances/:id" component={GrievanceDetail} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>;
}
function App() {
  return <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>;
}
var stdin_default = App;
export {
  stdin_default as default
};
