import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import VendorDashboard from "@/pages/vendor-dashboard";
import ShopOwnerDashboard from "@/pages/shop-owner-dashboard";
import DeliveryAgentDashboard from "@/pages/delivery-agent-dashboard";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles: string[] }) {
  const { user, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return <Redirect to="/" />;
  }

  if (!allowedRoles.includes(dbUser.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AppRouter() {
  const { user, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {user && dbUser ? (
          // Redirect authenticated users to their dashboard
          dbUser.role === "vendor" ? <Redirect to="/vendor-dashboard" /> :
          dbUser.role === "shop_owner" ? <Redirect to="/shop-owner-dashboard" /> :
          dbUser.role === "delivery_agent" ? <Redirect to="/delivery-agent-dashboard" /> :
          <Landing />
        ) : (
          <Landing />
        )}
      </Route>
      
      <Route path="/vendor-dashboard">
        <ProtectedRoute component={VendorDashboard} allowedRoles={["vendor"]} />
      </Route>
      
      <Route path="/shop-owner-dashboard">
        <ProtectedRoute component={ShopOwnerDashboard} allowedRoles={["shop_owner"]} />
      </Route>
      
      <Route path="/delivery-agent-dashboard">
        <ProtectedRoute component={DeliveryAgentDashboard} allowedRoles={["delivery_agent"]} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
