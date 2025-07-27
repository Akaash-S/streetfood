import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  Phone, 
  MessageSquare,
  Package,
  Truck,
  CheckCircle,
  Search
} from "lucide-react";
import { LiveTracking } from "@/components/delivery/LiveTracking";

export function DeliveryTracking() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const { data: vendorOrders = [], isLoading } = useQuery({
    queryKey: ['/api/vendor/orders'],
    queryFn: () => fetch('/api/vendor/orders', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
      }
    }).then(res => res.json())
  });

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setShowTracking(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const shippedOrders = vendorOrders.filter((order: any) => 
    order.status === 'shipped' || order.status === 'delivered'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Navigation className="h-6 w-6" />
          <span>Delivery Tracking</span>
        </h2>
        <Badge variant="secondary">{shippedOrders.length} Active Deliveries</Badge>
      </div>

      {/* Search for Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Track Any Order</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Enter order number (e.g., VO-1234567890)"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleTrackOrder(selectedOrderId)}
              disabled={!selectedOrderId.trim()}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Deliveries */}
      {shippedOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
            <p className="text-gray-500">Your orders will appear here once they're shipped for delivery.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shippedOrders.map((order: any, index: number) => (
            <motion.div
              key={order.id}
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
                        <span>Order {order.orderNumber}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Cash on Delivery
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTrackOrder(order.id)}
                      className="ml-4"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Track Live
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Total Amount</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">${order.totalAmount}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>
                        </div>
                        <p className="text-sm">
                          {order.estimatedDeliveryDate 
                            ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
                            : 'TBD'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Delivery Address
                        </span>
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">{order.deliveryAddress}</p>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Payment Method: Cash on Delivery
                        </span>
                      </div>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Please have ${order.totalAmount} ready for the delivery agent
                      </p>
                    </div>

                    {/* Delivery Status Steps */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Delivery Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Order Confirmed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Order Packed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className={`h-4 w-4 ${order.status === 'shipped' || order.status === 'delivered' ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Out for Delivery</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className={`h-4 w-4 ${order.status === 'delivered' ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex space-x-4 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Delivery Agent
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>

                    {order.notes && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h4 className="font-semibold mb-1">Order Notes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Live Tracking Modal */}
      {showTracking && trackingOrderId && (
        <LiveTracking 
          assignmentId={trackingOrderId}
          onClose={() => {
            setShowTracking(false);
            setTrackingOrderId(null);
          }}
        />
      )}
    </div>
  );
}