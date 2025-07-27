import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package, TruckIcon, BarChart3, Settings, Users, ShoppingCart, Plus, Edit, Trash2, Eye, Search, Filter, AlertTriangle, TrendingUp, Calendar, MapPin, Clock, Bell, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DistributorDashboard() {
  const { dbUser, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");

  // Fetch wholesale products
  const { data: wholesaleProducts = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/products'],
    enabled: !!dbUser,
    queryFn: async () => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch('/api/distributor/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Fetch bulk orders
  const { data: bulkOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/orders'],
    enabled: !!dbUser,
    queryFn: async () => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch('/api/distributor/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  // Fetch deliveries
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/deliveries'],
    enabled: !!dbUser,
    queryFn: async () => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch('/api/distributor/deliveries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      return response.json();
    }
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch('/api/distributor/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      setIsAddProductOpen(false);
      toast({ title: "Product created successfully!" });
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      toast({ title: error.message || "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch(`/api/distributor/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      setEditingProduct(null);
      toast({ title: "Product updated successfully!" });
    },
    onError: (error: any) => {
      console.error('Update product error:', error);
      toast({ title: error.message || "Failed to update product", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch(`/api/distributor/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
      toast({ title: error.message || "Failed to delete product", variant: "destructive" });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch(`/api/distributor/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/orders'] });
      toast({ title: "Order status updated!" });
    },
    onError: (error: any) => {
      console.error('Update order status error:', error);
      toast({ title: error.message || "Failed to update order status", variant: "destructive" });
    }
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch(`/api/distributor/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update delivery status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/deliveries'] });
      toast({ title: "Delivery status updated!" });
    },
    onError: (error: any) => {
      console.error('Update delivery status error:', error);
      toast({ title: error.message || "Failed to update delivery status", variant: "destructive" });
    }
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      stockQuantity: parseInt(formData.get('stockQuantity') as string),
      unit: formData.get('unit') as string,
      minimumOrderQuantity: parseInt(formData.get('minimumOrderQuantity') as string),
      isActive: true
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedOrder = bulkOrders.find(order => order.id === formData.get('orderId'));
    
    const data = {
      orderId: formData.get('orderId') as string,
      shopId: selectedOrder?.shopId || '',
      vehicleNumber: formData.get('vehicleNumber') as string,
      scheduledDate: new Date(formData.get('scheduledDate') as string),
      status: 'scheduled'
    };

    createDeliveryMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "processing": return "bg-blue-500";
      case "shipped": return "bg-purple-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Filter functions
  const filteredProducts = wholesaleProducts.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = bulkOrders.filter((order: any) => {
    return statusFilter === "all" || order.status === statusFilter;
  });

  const filteredDeliveries = deliveries.filter((delivery: any) => {
    return deliveryStatusFilter === "all" || delivery.status === deliveryStatusFilter;
  });

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await (dbUser as any)?.getIdToken?.() || 'test-token';
      const response = await fetch('/api/distributor/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create delivery');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/deliveries'] });
      setIsAddDeliveryOpen(false);
      toast({ title: "Delivery scheduled successfully!" });
    },
    onError: (error: any) => {
      console.error('Create delivery error:', error);
      toast({ title: error.message || "Failed to schedule delivery", variant: "destructive" });
    }
  });

  const stats = [
    {
      label: "Total Products",
      value: wholesaleProducts.length.toString(),
      icon: Package,
      bgColor: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendColor: "text-green-600"
    },
    {
      label: "Active Orders",
      value: bulkOrders.filter((order: any) => !['delivered', 'cancelled'].includes(order.status)).length.toString(),
      icon: ShoppingCart,
      bgColor: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      iconColor: "text-green-600",
      trend: "+8%",
      trendColor: "text-green-600"
    },
    {
      label: "Total Revenue",
      value: `$${bulkOrders.reduce((total: number, order: any) => total + order.totalAmount, 0).toLocaleString()}`,
      icon: BarChart3,
      bgColor: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      iconColor: "text-purple-600",
      trend: "+23%",
      trendColor: "text-green-600"
    },
    {
      label: "Scheduled Deliveries",
      value: deliveries.filter((delivery: any) => delivery.status === 'scheduled').length.toString(),
      icon: TruckIcon,
      bgColor: "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
      iconColor: "text-orange-600",
      trend: "+5%",
      trendColor: "text-green-600"
    }
  ];

  if (!dbUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Distributor Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, <span className="font-medium text-blue-600 dark:text-blue-400">{dbUser.firstName}</span>
                </p>
                {dbUser.companyName && (
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md inline-block mt-1">
                    {dbUser.companyName}
                  </p>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button variant="outline" onClick={logout} className="hover:shadow-md transition-shadow duration-200">
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className={`absolute inset-0 ${stat.bgColor}`} />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className={`h-3 w-3 ${stat.trendColor}`} />
                            <span className={`text-xs font-medium ${stat.trendColor}`}>
                              {stat.trend}
                            </span>
                            <span className="text-xs text-gray-500">vs last month</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white/20 dark:bg-black/20 rounded-full backdrop-blur-sm">
                          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">${order.totalAmount}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wholesaleProducts
                      .filter((product: any) => product.stockQuantity < 20)
                      .slice(0, 5)
                      .map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.stockQuantity} {product.unit} remaining</p>
                          </div>
                          <Badge variant="destructive">Low Stock</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wholesale Products</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your wholesale product catalog</p>
              </div>
              <div className="flex gap-3">
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grains">Grains</SelectItem>
                          <SelectItem value="Oils">Oils</SelectItem>
                          <SelectItem value="Vegetables">Vegetables</SelectItem>
                          <SelectItem value="Spices">Spices</SelectItem>
                          <SelectItem value="Dairy">Dairy</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" required />
                      </div>
                      <div>
                        <Label htmlFor="stockQuantity">Stock Quantity</Label>
                        <Input id="stockQuantity" name="stockQuantity" type="number" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" name="unit" placeholder="kg, bags, boxes" required />
                      </div>
                      <div>
                        <Label htmlFor="minimumOrderQuantity">Min Order Qty</Label>
                        <Input id="minimumOrderQuantity" name="minimumOrderQuantity" type="number" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? "Creating..." : "Create Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-1 gap-3 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Oils">Oils</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {wholesaleProducts.length} products
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product: any, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" />
                      <CardHeader className="relative">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200">
                              {product.name}
                            </CardTitle>
                            <Badge 
                              variant="secondary" 
                              className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {product.category}
                            </Badge>
                            {product.stockQuantity < 20 && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs font-medium">Low Stock</span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingProduct(product)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-bold text-lg text-green-600">${product.price}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-xs text-gray-500">Stock</div>
                              <div className={`font-medium ${product.stockQuantity < 20 ? 'text-red-600' : 'text-green-600'}`}>
                                {product.stockQuantity} {product.unit}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-xs text-gray-500">Min Order</div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {product.minimumOrderQuantity} {product.unit}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || categoryFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first wholesale product"
                  }
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Orders</h2>
                <p className="text-gray-600 dark:text-gray-400">Track and manage wholesale orders</p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {filteredOrders.map((order: any, index: number) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" />
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{order.orderNumber}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{order.deliveryAddress}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-500">Total Amount</span>
                              </div>
                              <p className="font-bold text-lg text-green-600">${order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-500">Order Date</span>
                              </div>
                              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="text-sm text-gray-500">Est. Delivery</span>
                              </div>
                              <p className="font-medium">
                                {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'TBD'}
                              </p>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Notes</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{order.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="lg:w-48">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status</Label>
                          <Select 
                            value={order.status} 
                            onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Deliveries Management */}
          <TabsContent value="deliveries" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Deliveries</h2>
                <p className="text-gray-600 dark:text-gray-400">Coordinate delivery schedules and logistics</p>
              </div>
              <div className="flex gap-3">
                <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Deliveries</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={isAddDeliveryOpen} onOpenChange={setIsAddDeliveryOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Delivery
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule New Delivery</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDeliverySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="orderId">Select Order</Label>
                        <Select name="orderId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose order to deliver" />
                          </SelectTrigger>
                          <SelectContent>
                            {bulkOrders.filter((order: any) => order.status === 'processing' || order.status === 'shipped').map((order: any) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.orderNumber} - ${order.totalAmount}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                        <Input id="vehicleNumber" name="vehicleNumber" placeholder="e.g., TRK-001" required />
                      </div>
                      <div>
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input 
                          id="scheduledDate" 
                          name="scheduledDate" 
                          type="datetime-local" 
                          min={new Date().toISOString().slice(0, 16)}
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createDeliveryMutation.isPending}>
                        {createDeliveryMutation.isPending ? "Scheduling..." : "Schedule Delivery"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="space-y-4">
              {filteredDeliveries.map((delivery: any, index: number) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" />
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <TruckIcon className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  Delivery #{delivery.id.slice(-6)}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <TruckIcon className="h-3 w-3" />
                                  <span>{delivery.vehicleNumber || 'Vehicle not assigned'}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                              {delivery.status.replace('_', ' ').split(' ').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-500">Scheduled Date</span>
                              </div>
                              <p className="font-medium">{new Date(delivery.scheduledDate).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-500">Driver</span>
                              </div>
                              <p className="font-medium">{delivery.driverId || 'Not assigned'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-500">Delivered</span>
                              </div>
                              <p className="font-medium">
                                {delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleDateString() : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:w-48">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status</Label>
                          <Select 
                            value={delivery.status} 
                            onValueChange={(status) => updateDeliveryStatusMutation.mutate({ id: delivery.id, status })}
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={true} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingProduct.name} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingProduct.description} />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={editingProduct.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Oils">Oils</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={editingProduct.price} required />
                </div>
                <div>
                  <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
                  <Input id="edit-stockQuantity" name="stockQuantity" type="number" defaultValue={editingProduct.stockQuantity} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input id="edit-unit" name="unit" defaultValue={editingProduct.unit} required />
                </div>
                <div>
                  <Label htmlFor="edit-minimumOrderQuantity">Min Order Qty</Label>
                  <Input id="edit-minimumOrderQuantity" name="minimumOrderQuantity" type="number" defaultValue={editingProduct.minimumOrderQuantity} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}