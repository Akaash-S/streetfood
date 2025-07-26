import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Star, MapPin } from "lucide-react";

export function ShopBrowser() {
  const { data: shops, isLoading } = useQuery({
    queryKey: ['/api/shops'],
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
        <h2 className="text-2xl font-bold text-secondary">Browse Partner Shops</h2>
        <Badge variant="secondary" className="text-sm">
          {Array.isArray(shops) ? shops.length : 0} shops available
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(shops) && shops.map((shop: any) => (
          <Card key={shop.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">{shop.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{shop.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{shop.rating}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{shop.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant={shop.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {shop.isActive ? "Open" : "Closed"}
                </Badge>
                <Button 
                  size="sm" 
                  disabled={!shop.isActive}
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => {
                    // Use URL params to communicate with parent component
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'products');
                    url.searchParams.set('shopId', shop.id);
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
      </div>
    </div>
  );
}