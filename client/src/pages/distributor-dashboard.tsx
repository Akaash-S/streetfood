import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { Package, TruckIcon, BarChart3, Settings, Users, ShoppingCart, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DistributorDashboard() {
  const { dbUser, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch wholesale products
  const { data: wholesaleProducts = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/products'],
    enabled: !!dbUser,
  });

  // Fetch bulk orders
  const { data: bulkOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/orders'],
    enabled: !!dbUser,
  });

  // Fetch deliveries
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<any[]>({
    queryKey: ['/api/distributor/deliveries'],
    enabled: !!dbUser,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/distributor/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await dbUser?.getIdToken()}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      setIsAddProductOpen(false);
      toast({ title: "Product created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/distributor/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await dbUser?.getIdToken()}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      setEditingProduct(null);
      toast({ title: "Product updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/distributor/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await dbUser?.getIdToken()}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/products'] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await fetch(`/api/distributor/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await dbUser?.getIdToken()}`
        },
        body: JSON.stringify({ status })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/orders'] });
      toast({ title: "Order status updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    }
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await fetch(`/api/distributor/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await dbUser?.getIdToken()}`
        },
        body: JSON.stringify({ status })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/distributor/deliveries'] });
      toast({ title: "Delivery status updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update delivery status", variant: "destructive" });
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

  const stats = [
    {
      label: "Total Products",
      value: wholesaleProducts.length.toString(),
      icon: Package,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Orders",
      value: bulkOrders.filter((order: any) => !['delivered', 'cancelled'].includes(order.status)).length.toString(),
      icon: ShoppingCart,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Total Orders",
      value: bulkOrders.length.toString(),
      icon: BarChart3,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Scheduled Deliveries",
      value: deliveries.filter((delivery: any) => delivery.status === 'scheduled').length.toString(),
      icon: TruckIcon,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  if (!dbUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Distributor Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {dbUser.firstName}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Wholesale Products</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wholesaleProducts.map((product: any) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Stock:</span>
                        <span className={`font-medium ${product.stockQuantity < 20 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Min Order:</span>
                        <span className="font-medium">{product.minimumOrderQuantity} {product.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Bulk Orders</h2>
            <div className="space-y-4">
              {bulkOrders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-500">
                              Delivery: {order.deliveryAddress}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-medium">${order.totalAmount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estimated Delivery</p>
                            <p className="font-medium">
                              {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className="w-40">
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
              ))}
            </div>
          </TabsContent>

          {/* Deliveries Management */}
          <TabsContent value="deliveries" className="space-y-6">
            <h2 className="text-2xl font-bold">Shop Deliveries</h2>
            <div className="space-y-4">
              {deliveries.map((delivery: any) => (
                <Card key={delivery.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">Delivery #{delivery.id.slice(-6)}</h3>
                            <p className="text-sm text-gray-500">
                              Vehicle: {delivery.vehicleNumber || 'Not assigned'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Scheduled Date</p>
                            <p className="font-medium">{new Date(delivery.scheduledDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Driver</p>
                            <p className="font-medium">{delivery.driverId || 'Not assigned'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Delivered Date</p>
                            <p className="font-medium">
                              {delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleDateString() : 'Not delivered'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Select 
                          value={delivery.status} 
                          onValueChange={(status) => updateDeliveryStatusMutation.mutate({ id: delivery.id, status })}
                        >
                          <SelectTrigger className="w-40">
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