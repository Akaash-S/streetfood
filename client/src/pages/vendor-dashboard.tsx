import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingCart, DollarSign, Heart, Calendar, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ShopBrowser } from "@/components/vendor/ShopBrowser";
import { RecentOrders } from "@/components/vendor/RecentOrders";
import { VendorCart, CartProvider } from "@/components/vendor/VendorCart";
import { ProductBrowser } from "@/components/vendor/ProductBrowser";
import { VendorProfile } from "@/components/vendor/VendorProfile";
import { OrderHistory } from "@/components/vendor/OrderHistory";

export default function VendorDashboard() {
  const { dbUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Handle URL parameters for shop selection
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const shopId = params.get('shopId');
    
    if (tab) {
      setActiveTab(tab);
    }
    if (shopId) {
      setSelectedShopId(shopId);
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const shopId = params.get('shopId');
      
      if (tab) {
        setActiveTab(tab);
      }
      if (shopId) {
        setSelectedShopId(shopId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Remove static data since we're using real API data now

  return (
    <CartProvider>
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
          <Button 
            variant="secondary" 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => setActiveTab("shops")}
          >
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "shops" ? "default" : "outline"}
            onClick={() => setActiveTab("shops")}
          >
            Browse Shops
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
          >
            Products
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            Order History
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </Button>
        </div>

        {/* Tab Content */}
        <div className="flex gap-8">
          <div className="flex-1">
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RecentOrders />
              </motion.div>
            )}

            {activeTab === "shops" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ShopBrowser />
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ProductBrowser shopId={selectedShopId} />
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <OrderHistory />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <VendorProfile />
              </motion.div>
            )}
          </div>

          {/* Cart Sidebar - Show only when not on profile tab */}
          {activeTab !== "profile" && (
            <div className="w-80">
              <div className="sticky top-8">
                <VendorCart />
              </div>
            </div>
          )}
        </div>
        </div>
      </motion.div>
    </CartProvider>
  );
}
