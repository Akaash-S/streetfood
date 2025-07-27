import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, DollarSign, Phone, MessageSquare } from "lucide-react";

interface LiveTrackingProps {
  assignmentId: string;
  onClose: () => void;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function LiveTracking({ assignmentId, onClose }: LiveTrackingProps) {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [assignmentId]);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/tracking/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
        
        if (data.currentLatitude && data.currentLongitude) {
          setCurrentLocation({
            latitude: parseFloat(data.currentLatitude),
            longitude: parseFloat(data.currentLongitude),
            timestamp: data.updatedAt
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Tracking information not available</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-orange-100 text-orange-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Live Delivery Tracking</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Delivery Status</span>
              </div>
              <Badge className={getStatusColor(trackingData.status)}>
                {trackingData.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Payment Status</span>
              </div>
              <Badge className={getPaymentStatusColor(trackingData.paymentStatus)}>
                {trackingData.paymentStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Real-time location tracking would appear here
            </p>
            {currentLocation && (
              <div className="text-sm text-gray-500">
                <p>Last Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
                <p>Coordinates: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</p>
              </div>
            )}
          </div>

          {/* Delivery Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Pickup Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{trackingData.pickupAddress}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{trackingData.deliveryAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Delivery Fee</h4>
                <p className="text-lg font-bold text-green-600">${trackingData.deliveryFee}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Distance</h4>
                <p className="text-lg font-bold">{trackingData.estimatedDistance} km</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Est. Time</h4>
                <p className="text-lg font-bold">{trackingData.estimatedTime} mins</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Payment Method</h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              {trackingData.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Digital Payment'}
            </p>
            {trackingData.paymentMethod === 'cash_on_delivery' && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Please have exact change ready for the delivery agent
              </p>
            )}
          </div>

          {/* Contact Actions */}
          <div className="flex space-x-4">
            <Button className="flex-1" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Delivery Agent
            </Button>
            <Button className="flex-1" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>

          {trackingData.notes && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Delivery Notes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{trackingData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}