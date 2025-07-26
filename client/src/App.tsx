import React from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
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
import DistributorDashboard from "@/pages/distributor-dashboard";

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
  const [location, setLocation] = useLocation();

  // Handle automatic redirect after authentication
  React.useEffect(() => {
    if (!loading && user && dbUser && location === "/") {
      switch (dbUser.role) {
        case "vendor":
          setLocation("/vendor-dashboard");
          break;
        case "shop_owner":
          setLocation("/shop-owner-dashboard");
          break;
        case "delivery_agent":
          setLocation("/delivery-agent-dashboard");
          break;
        case "distributor":
          setLocation("/distributor-dashboard");
          break;
      }
    }
  }, [user, dbUser, loading, location, setLocation]);

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
        <Landing />
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
      
      <Route path="/distributor-dashboard">
        <ProtectedRoute component={DistributorDashboard} allowedRoles={["distributor"]} />
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
