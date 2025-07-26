import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, TruckIcon, BarChart3, Settings, Users, ShoppingCart } from "lucide-react";

export default function DistributorDashboard() {
  const { dbUser, logout } = useAuth();

  if (!dbUser) return null;

  const mockBulkOrders = [
    {
      id: "bulk-001",
      shopName: "Fresh Mart Supplies",
      orderNumber: "#BLK-12345",
      status: "processing",
      total: 2450.00,
      itemCount: 15,
      orderDate: "2025-01-15",
      deliveryDate: "2025-01-17"
    },
    {
      id: "bulk-002", 
      shopName: "Quality Food Store",
      orderNumber: "#BLK-12346",
      status: "shipped",
      total: 1890.75,
      itemCount: 8,
      orderDate: "2025-01-14",
      deliveryDate: "2025-01-16"
    }
  ];

  const mockWholesaleProducts = [
    {
      id: "wp-001",
      name: "Premium Basmati Rice (25kg)",
      category: "Grains",
      price: 45.99,
      stock: 150,
      minOrderQty: 5
    },
    {
      id: "wp-002",
      name: "Cooking Oil Bulk Pack (20L)",
      category: "Oils",
      price: 89.99,
      stock: 75,
      minOrderQty: 2
    },
    {
      id: "wp-003",
      name: "Fresh Vegetables Mix (50kg)",
      category: "Vegetables",
      price: 125.50,
      stock: 30,
      minOrderQty: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-yellow-500";
      case "shipped": return "bg-blue-500";
      case "delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockBulkOrders.length}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockWholesaleProducts.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    $4,340
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Shops Served
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    12
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Bulk Orders</TabsTrigger>
            <TabsTrigger value="products">Wholesale Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Bulk Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Bulk Orders from Shops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBulkOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{order.shopName}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{order.orderNumber}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <span className="ml-2 font-medium">{order.itemCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <span className="ml-2 font-medium">${order.total.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Order Date:</span>
                          <span className="ml-2">{order.orderDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery Date:</span>
                          <span className="ml-2">{order.deliveryDate}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {order.status === "processing" && (
                          <Button size="sm">
                            Mark as Shipped
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wholesale Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Wholesale Product Catalog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockWholesaleProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">${product.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Stock:</span>
                          <span className={product.stock < 50 ? "text-red-600" : "text-green-600"}>
                            {product.stock} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min Order:</span>
                          <span>{product.minOrderQty} units</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
                          Update Stock
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button>Add New Product</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Detailed analytics and reporting features will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}