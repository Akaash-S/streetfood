import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Package, 
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LiveTracking } from "./LiveTracking";

export function ActiveDeliveries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [completingDelivery, setCompletingDelivery] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: myDeliveries = [], isLoading } = useQuery({
    queryKey: ['/api/agent/my-deliveries'],
    queryFn: () => fetch('/api/agent/my-deliveries', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
      }
    }).then(res => res.json())
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest(`/api/agent/update-status/${id}`, 'PUT', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/my-deliveries'] });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
    }
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, latitude, longitude }: { id: string; latitude: number; longitude: number }) => 
      apiRequest(`/api/agent/update-location/${id}`, 'PUT', { latitude, longitude }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/my-deliveries'] });
    }
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: ({ id, paymentStatus, notes }: { id: string; paymentStatus: string; notes?: string }) => 
      apiRequest(`/api/agent/complete-delivery/${id}`, 'POST', { paymentStatus, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/my-deliveries'] });
      setCompletingDelivery(null);
      setPaymentNotes("");
      toast({
        title: "Delivery Completed",
        description: "Delivery has been marked as completed with payment confirmation.",
      });
    }
  });

  // Auto-update location every 30 seconds for in-transit deliveries
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        const inTransitDeliveries = myDeliveries.filter((d: any) => d.status === 'in_transit');
        
        inTransitDeliveries.forEach((delivery: any) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateLocationMutation.mutate({
                id: delivery.id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => console.log('Location update failed:', error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        });
      }
    };

    const interval = setInterval(updateLocation, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [myDeliveries, updateLocationMutation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-orange-100 text-orange-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (myDeliveries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
          <p className="text-gray-500">Accept delivery requests to start earning.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Active Deliveries</h2>
        <Badge variant="secondary">{myDeliveries.length} Active</Badge>
      </div>

      <div className="grid gap-4">
        {myDeliveries.map((delivery: any, index: number) => (
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
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {delivery.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Digital Payment'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedDelivery(delivery.id);
                        setShowTracking(true);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Track
                    </Button>
                  </div>
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

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2">
                    {delivery.status === 'assigned' && (
                      <Button 
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'picked_up' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Picked Up
                      </Button>
                    )}
                    {delivery.status === 'picked_up' && (
                      <Button 
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'in_transit' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Start Delivery
                      </Button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <Button 
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'delivered' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {delivery.status === 'delivered' && delivery.paymentMethod === 'cash_on_delivery' && (
                      <Button 
                        size="sm"
                        onClick={() => setCompletingDelivery(delivery.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm Payment
                      </Button>
                    )}
                  </div>

                  {/* Payment Completion Modal */}
                  {completingDelivery === delivery.id && (
                    <div className="border border-green-200 bg-green-50 dark:bg-green-900 rounded-lg p-4 space-y-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Complete Cash Payment</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Payment Amount: ${delivery.deliveryFee}</Label>
                        </div>
                        <div>
                          <Label htmlFor="payment-notes">Payment Notes (Optional)</Label>
                          <Textarea
                            id="payment-notes"
                            placeholder="Add any notes about the payment or delivery..."
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => completeDeliveryMutation.mutate({ 
                              id: delivery.id, 
                              paymentStatus: 'paid',
                              notes: paymentNotes || undefined
                            })}
                            disabled={completeDeliveryMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Payment Received
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => completeDeliveryMutation.mutate({ 
                              id: delivery.id, 
                              paymentStatus: 'failed',
                              notes: paymentNotes || "Payment failed"
                            })}
                            disabled={completeDeliveryMutation.isPending}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Payment Failed
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCompletingDelivery(null);
                              setPaymentNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact and Earnings */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call Customer
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${delivery.deliveryFee}</div>
                      <div className="text-xs text-gray-500">Delivery Fee</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Tracking Modal */}
      {showTracking && selectedDelivery && (
        <LiveTracking 
          assignmentId={selectedDelivery}
          onClose={() => {
            setShowTracking(false);
            setSelectedDelivery(null);
          }}
        />
      )}
    </div>
  );
}