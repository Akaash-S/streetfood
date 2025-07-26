import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike, Truck, DollarSign, CheckCircle, Star, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AvailableDeliveries } from "@/components/delivery/AvailableDeliveries";

export default function DeliveryAgentDashboard() {
  const { dbUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      label: "Available Requests",
      value: "5",
      icon: Truck,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      label: "Today's Earnings",
      value: "$127.50",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Completed Today",
      value: "12",
      icon: CheckCircle,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Rating",
      value: "4.9",
      icon: Star,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  const availableDeliveries = [
    {
      route: "Fresh Mart → John's Food Cart",
      distance: "2.3 km",
      estimatedTime: "15 mins",
      orderNumber: "#12345",
      postedTime: "10 minutes ago",
      fee: "$12.50"
    },
    {
      route: "Quality Food Store → Maria's Tacos",
      distance: "1.8 km",
      estimatedTime: "12 mins",
      orderNumber: "#12344",
      postedTime: "15 minutes ago",
      fee: "$9.75"
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
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Bike className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-secondary">Delivery Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {dbUser?.firstName ? `${dbUser.firstName} ${dbUser.lastName}` : "Delivery Agent"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {dbUser?.firstName?.charAt(0) || "D"}
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
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">
            Ready for deliveries, {dbUser?.firstName || "Agent"}!
          </h2>
          <p className="text-purple-100 mb-4">
            You have new delivery requests available. Start earning with efficient routes!
          </p>
          <Button 
            variant="secondary" 
            className="bg-white text-purple-600 hover:bg-purple-50"
            onClick={() => setActiveTab("deliveries")}
          >
            View Requests
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

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "deliveries" ? "default" : "outline"}
            onClick={() => setActiveTab("deliveries")}
          >
            Available Deliveries
          </Button>
          <Button
            variant={activeTab === "earnings" ? "default" : "outline"}
            onClick={() => setActiveTab("earnings")}
          >
            Earnings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AvailableDeliveries />
          </motion.div>
        )}

        {activeTab === "deliveries" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AvailableDeliveries />
          </motion.div>
        )}

        {activeTab === "earnings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
              <p className="text-gray-600">Coming soon: Detailed earnings tracking and history</p>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
