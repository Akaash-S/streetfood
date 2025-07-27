import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, Mail, MapPin, Camera } from "lucide-react";

export function VendorProfile() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: dbUser?.firstName || "",
    lastName: dbUser?.lastName || "",
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
  });

  const { data: vendorProfile } = useQuery({
    queryKey: ['/api/vendor/profile'],
    enabled: !!dbUser,
    queryFn: async () => {
      const token = localStorage.getItem('firebaseToken');
      const response = await fetch('/api/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const token = localStorage.getItem('firebaseToken') || 'test-token';
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/profile'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: dbUser?.firstName || "",
      lastName: dbUser?.lastName || "",
      phone: dbUser?.phone || "",
      email: dbUser?.email || "",
      businessName: (vendorProfile as any)?.businessName || "",
      businessDescription: (vendorProfile as any)?.businessDescription || "",
      businessAddress: (vendorProfile as any)?.businessAddress || "",
      businessPhone: (vendorProfile as any)?.businessPhone || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vendor Profile
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  size="sm"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Mike's Street Food Cart"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange("businessPhone", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="Enter your business location or usual operating area"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Describe your food business, specialties, and what makes you unique"
                  rows={4}
                />
              </div>
            </div>
          </form>

          {/* Profile Stats */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">$1,840</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">6</p>
                <p className="text-sm text-gray-600">Favorite Shops</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}