import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Search, Filter } from "lucide-react";
import { useCart } from "./VendorCart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
  distributorId: string;
  category: string;
  isActive: boolean;
}

interface ProductBrowserProps {
  distributorId?: string;
}

export function ProductBrowser({ distributorId }: ProductBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/vendor/products', distributorId],
    enabled: !!distributorId,
  });

  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    let filtered = products.filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === "all" || 
                           (filterBy === "in_stock" && product.stockQuantity > 0) ||
                           (filterBy === "low_stock" && product.stockQuantity <= 10 && product.stockQuantity > 0);
      
      return matchesSearch && matchesFilter && product.isActive;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "stock":
          return b.stockQuantity - a.stockQuantity;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy, filterBy]);

  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      shopId: product.distributorId,
      shopName: product.category,
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="stock">Stock Level</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}/{product.unit}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={product.stockQuantity > 10 ? "default" : 
                                  product.stockQuantity > 0 ? "outline" : "destructive"}
                          className="text-xs"
                        >
                          {product.stockQuantity > 0 ? 
                            `${product.stockQuantity} ${product.unit} available` : 
                            "Out of stock"
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}