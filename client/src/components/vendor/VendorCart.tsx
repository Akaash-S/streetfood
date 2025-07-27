import React, { useState, useContext, createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  shopId: string;
  shopName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.productId === item.productId);
      if (existingItem) {
        return prevItems.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function VendorCart() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest('/api/vendor/orders', 'POST', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been sent to the distributor for confirmation.",
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/orders'] });
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Group items by distributor
    const ordersByDistributor = items.reduce((acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = {
          distributorId: item.shopId,
          distributorName: item.shopName,
          items: [],
          totalAmount: 0,
        };
      }
      acc[item.shopId].items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      });
      acc[item.shopId].totalAmount += item.price * item.quantity;
      return acc;
    }, {} as any);

    // Create separate orders for each distributor
    Object.values(ordersByDistributor).forEach((order: any) => {
      createOrderMutation.mutate({
        distributorId: order.distributorId,
        totalAmount: order.totalAmount,
        deliveryAddress: "Default delivery address", // TODO: Get from user profile
        items: order.items,
        notes: `Order from ${order.distributorName}`,
      });
    });
  };

  if (items.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400">Add products to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </div>
          <Badge variant="secondary">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.shopName}</p>
                <p className="text-sm font-semibold">${item.price.toFixed(2)}/{item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total:</span>
            <span className="text-lg">${getTotalPrice().toFixed(2)}</span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {createOrderMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}