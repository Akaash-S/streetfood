import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Building2, MapPin } from "lucide-react";
import { User } from "@shared/schema";

export function ShopBrowser() {
  const { data: distributors, isLoading } = useQuery({
    queryKey: ['/api/vendor/distributors'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary">Browse Distributors</h2>
        <Badge variant="secondary" className="text-sm">
          {Array.isArray(distributors) ? distributors.length : 0} distributors available
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(distributors) && distributors.map((distributor: User) => (
          <Card key={distributor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">{distributor.companyName || `${distributor.firstName} ${distributor.lastName}`}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Store className="w-4 h-4" />
                      <span>Wholesale Distributor</span>
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Professional wholesale distributor providing quality products for street food vendors.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Contact: {distributor.email}
                </div>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => {
                    // Use URL params to communicate with parent component
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'products');
                    url.searchParams.set('distributorId', distributor.id);
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {Array.isArray(distributors) && distributors.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No distributors available yet</p>
            <p className="text-sm text-gray-400">Check back later for wholesale suppliers</p>
          </div>
        )}
      </div>
    </div>
  );
}