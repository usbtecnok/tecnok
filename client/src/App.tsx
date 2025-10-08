import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DriverRegister from "@/pages/driver-register";
import DriverLogin from "@/pages/driver-login";
import DriverPanelPage from "@/pages/driver-panel-page";
import AdminLogin from "@/pages/admin-login";
import AdminDrivers from "@/pages/admin-drivers";
import AdminPayments from "@/pages/admin-payments";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cadastro-motorista" component={DriverRegister} />
      <Route path="/motorista/login" component={DriverLogin} />
      <Route path="/motorista/painel" component={DriverPanelPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/motoristas" component={AdminDrivers} />
      <Route path="/admin/pagamentos" component={AdminPayments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
