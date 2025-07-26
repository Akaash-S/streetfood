import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Store, ShoppingBag, Bike, Check } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const roleCards = [
    {
      icon: Store,
      title: "Street Food Vendors",
      description: "Browse products, place orders, and track deliveries from multiple retail shops in real-time.",
      features: [
        "Product browsing & filtering",
        "Real-time order tracking",
        "Rating & review system"
      ],
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: ShoppingBag,
      title: "Retail Shop Owners",
      description: "Manage orders, update inventory, and connect with vendors to grow your business reach.",
      features: [
        "Order management dashboard",
        "Inventory tracking",
        "Vendor relationship tools"
      ],
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Bike,
      title: "Delivery Agents",
      description: "Accept delivery requests, navigate efficiently, and manage your delivery schedule seamlessly.",
      features: [
        "Available delivery requests",
        "GPS navigation assistance",
        "Earnings tracking"
      ],
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
      {/* Navigation Header */}
      <nav className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-secondary">Street Food Ecosystem</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowLogin(true)}
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowRegister(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
            Streamline Your{" "}
            <span className="text-primary">Street Food</span>{" "}
            Supply Chain
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect vendors with retail shops and delivery agents in one unified platform.
            Manage orders, track deliveries, and grow your street food business efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowRegister(true)}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Start Your Journey
              </Button>
            </motion.div>
            <Button
              variant="outline"
              className="border border-gray-300 hover:border-primary text-secondary hover:text-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {roleCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-surface rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all h-full">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 ${card.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                    <card.icon className={`${card.iconColor} text-2xl`} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-4">{card.title}</h3>
                  <p className="text-gray-600 mb-6">{card.description}</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {card.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-accent mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Auth Modals */}
      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterForm
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}
