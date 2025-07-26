import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, DollarSign, Package, Star, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ShopOwnerDashboard() {
  const { dbUser, logout } = useAuth();

  const stats = [
    {
      label: "Pending Orders",
      value: "8",
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      label: "Today's Revenue",
      value: "$1,247",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Products Listed",
      value: "156",
      icon: Package,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Average Rating",
      value: "4.8",
      icon: Star,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  const pendingOrders = [
    {
      vendorName: "John's Food Cart",
      orderNumber: "#12345",
      items: "15 items",
      time: "45 mins ago",
      total: "$234.50"
    },
    {
      vendorName: "Maria's Tacos",
      orderNumber: "#12344",
      items: "8 items",
      time: "1 hour ago",
      total: "$156.75"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Dashboard Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-secondary">Shop Owner Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {dbUser?.firstName ? `${dbUser.firstName}'s Shop` : "Shop Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {dbUser?.firstName?.charAt(0) || "S"}
                </div>
                <Button variant="ghost" onClick={logout} className="text-sm text-gray-600 hover:text-gray-800">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {dbUser?.firstName || "Shop Owner"}!
          </h2>
          <p className="text-green-100 mb-4">
            You have new orders waiting for your attention. Let's get them processed!
          </p>
          <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
            View Orders
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="bg-surface border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-surface border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary">Pending Orders</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
                View All
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingOrders.map((order, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <User className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary">{order.vendorName}</p>
                        <p className="text-sm text-gray-600">
                          {order.orderNumber} • {order.items} • {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-secondary">{order.total}</span>
                      <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Accept
                      </Button>
                      <Button variant="outline" className="px-4 py-2 rounded-lg text-sm font-medium">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
