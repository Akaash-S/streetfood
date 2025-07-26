import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingCart, DollarSign, Heart, Calendar, Bell, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VendorDashboard() {
  const { dbUser, logout } = useAuth();

  const stats = [
    {
      label: "Active Orders",
      value: "12",
      icon: ShoppingCart,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      label: "Total Spent",
      value: "$2,847",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Favorite Shops",
      value: "8",
      icon: Heart,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "This Month",
      value: "45",
      icon: Calendar,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  const recentOrders = [
    {
      shopName: "Fresh Mart Supplies",
      orderNumber: "#12345",
      date: "Dec 15, 2023",
      total: "$234.50",
      status: "Delivered",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      shopName: "Quality Food Store",
      orderNumber: "#12344",
      date: "Dec 14, 2023",
      total: "$189.25",
      status: "In Transit",
      statusColor: "bg-blue-100 text-blue-800"
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
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Store className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-secondary">Vendor Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {dbUser?.firstName ? `${dbUser.firstName}'s Food Cart` : "Vendor Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {dbUser?.firstName?.charAt(0) || "V"}
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {dbUser?.firstName || "Vendor"}!
          </h2>
          <p className="text-blue-100 mb-4">
            Ready to place some orders today? Browse our partner shops and restock your inventory.
          </p>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
            Browse Shops
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

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-surface border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-secondary">Recent Orders</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Receipt className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary">{order.shopName}</p>
                        <p className="text-sm text-gray-600">
                          {order.orderNumber} • {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">{order.total}</p>
                      <Badge className={`${order.statusColor} text-xs`}>
                        {order.status}
                      </Badge>
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
