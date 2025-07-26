import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Map } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AvailableDeliveries() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['/api/delivery/available'],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const acceptDelivery = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest(`/api/delivery/${requestId}/accept`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery/available'] });
      toast({
        title: "Delivery Accepted",
        description: "You have successfully accepted this delivery request",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept delivery request",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary">Available Delivery Requests</h3>
        <Badge variant="secondary" className="text-sm">
          {deliveries?.length || 0} available
        </Badge>
      </div>
      <div className="divide-y divide-gray-200">
        {deliveries?.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No delivery requests available</p>
            <p className="text-sm">Check back later for new opportunities!</p>
          </div>
        ) : (
          deliveries?.map((delivery: any) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">{delivery.route}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{delivery.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Est. {delivery.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Posted {new Date(delivery.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="font-semibold text-secondary">${delivery.fee?.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Delivery fee</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => acceptDelivery.mutate(delivery.id)}
                      disabled={acceptDelivery.isPending}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      Accept
                    </Button>
                    <Button variant="outline" size="icon" className="p-2">
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}