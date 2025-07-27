import React from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Package, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function AvailableDeliveries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableDeliveries = [], isLoading } = useQuery({
    queryKey: ['/api/agent/available-deliveries'],
    queryFn: async () => {
      const response = await fetch('/api/agent/available-deliveries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available deliveries');
      }
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    }
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: (assignmentId: string) => 
      apiRequest(`/api/agent/accept-delivery/${assignmentId}`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/available-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agent/my-deliveries'] });
      toast({
        title: "Delivery Accepted",
        description: "You have successfully accepted this delivery assignment.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept delivery assignment.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Ensure availableDeliveries is an array
  const deliveries = Array.isArray(availableDeliveries) ? availableDeliveries : [];
  
  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Available Deliveries</h3>
          <p className="text-gray-500">Check back later for new delivery requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Available Deliveries</h2>
        <Badge variant="secondary">{deliveries.length} Available</Badge>
      </div>
      
      <div className="grid gap-4">
        {deliveries.map((delivery: any, index: number) => (
          <motion.div
            key={delivery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Order #{delivery.orderId?.slice(-8)}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">
                        {delivery.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Digital Payment'}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        ${delivery.deliveryFee} Fee
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => acceptDeliveryMutation.mutate(delivery.id)}
                    disabled={acceptDeliveryMutation.isPending}
                    className="ml-4"
                  >
                    {acceptDeliveryMutation.isPending ? "Accepting..." : "Accept"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Pickup</span>
                      </div>
                      <p className="text-sm">{delivery.pickupAddress}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Delivery</span>
                      </div>
                      <p className="text-sm">{delivery.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600">Distance</span>
                      </div>
                      <p className="font-semibold">{delivery.estimatedDistance} km</p>
                    </div>
                    <div className="text-center bg-orange-50 dark:bg-orange-900 p-3 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-xs text-orange-600">Est. Time</span>
                      </div>
                      <p className="font-semibold">{delivery.estimatedTime} mins</p>
                    </div>
                    <div className="text-center bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">Earnings</span>
                      </div>
                      <p className="font-semibold">${delivery.deliveryFee}</p>
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  {delivery.paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Cash on Delivery
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Collect cash payment from customer upon delivery
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    Posted {new Date(delivery.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}