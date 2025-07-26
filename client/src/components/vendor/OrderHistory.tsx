import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Star,
  Eye
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  status: string;
  totalAmount: number;
  items: any[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders/vendor'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'preparing':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    let filtered = orders.filter((order: Order) => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount_high":
          return b.totalAmount - a.totalAmount;
        case "amount_low":
          return a.totalAmount - b.totalAmount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Order History
          </div>
          <Badge variant="secondary">
            {filteredOrders.length} orders
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount_high">Highest Amount</SelectItem>
              <SelectItem value="amount_low">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredOrders.map((order: Order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-secondary">#{order.orderNumber}</p>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.shopName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-lg">${order.totalAmount?.toFixed(2)}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{selectedOrder?.orderNumber}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Order Status</p>
                                <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                                  {selectedOrder.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                                <p className="text-lg font-bold">${selectedOrder.totalAmount?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Shop</p>
                                <p>{selectedOrder.shopName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Order Date</p>
                                <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
                              <div className="space-y-2">
                                {selectedOrder.items?.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${item.totalPrice?.toFixed(2)}</p>
                                  </div>
                                )) || (
                                  <p className="text-gray-500 text-sm">No items details available</p>
                                )}
                              </div>
                            </div>
                            
                            {selectedOrder.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                  {selectedOrder.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}