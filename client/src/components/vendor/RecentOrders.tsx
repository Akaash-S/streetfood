import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Clock, CheckCircle, Truck } from "lucide-react";

export function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders/vendor'],
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
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-surface border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary">Recent Orders</h3>
        <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
          View All
        </Button>
      </div>
      <div className="divide-y divide-gray-200">
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No orders yet</p>
            <p className="text-sm">Start ordering from partner shops!</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Order {order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-secondary">${order.total?.toFixed(2)}</p>
                    <Badge className={`${getStatusColor(order.status)} text-xs`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}