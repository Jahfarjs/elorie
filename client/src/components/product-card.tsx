import { Link, useLocation } from "wouter";
import { ShoppingBag, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { savePendingCartAction } from "@/lib/pending-cart";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      const returnTo = window.location.pathname + window.location.search;
      savePendingCartAction({
        productId: product.id,
        quantity: 1,
        returnTo,
      });
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
      });
      setLocation("/profile");
      return;
    }

    try {
      await addItem(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      // Error toast already handled in cart context.
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const productImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl || ""];
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link href={`/product/${product.id}`} data-testid={`card-product-${product.id}`}>
      <div
        className={`group relative bg-card rounded-2xl overflow-visible transition-all duration-300 hover:shadow-lg ${
          featured ? "p-4" : "p-3"
        }`}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          <SafeImage
            src={productImages[currentImageIndex]}
            alt={`${product.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {discount && (
            <Badge
              className="absolute top-3 left-3 bg-primary text-primary-foreground"
              data-testid={`badge-discount-${product.id}`}
            >
              -{discount}%
            </Badge>
          )}

          {product.isCombo && !discount && (
            <Badge
              className="absolute top-3 left-3"
              variant="secondary"
              data-testid={`badge-combo-${product.id}`}
            >
              Combo
            </Badge>
          )}

          {product.isTrending && !discount && !product.isCombo && (
            <Badge
              className="absolute top-3 left-3"
              variant="secondary"
              data-testid={`badge-trending-${product.id}`}
            >
              Trending
            </Badge>
          )}

          {/* Navigation arrows - only show if multiple images */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white dark:hover:bg-black z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white dark:hover:bg-black z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              
              {/* Image indicator dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-3"
                        : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              onClick={handleAddToCart}
              className="rounded-full shadow-lg"
              data-testid={`button-add-cart-${product.id}`}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`${featured ? "mt-4 space-y-2" : "mt-3 space-y-1.5"}`}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {product.category}
          </p>
          <h3
            className={`font-serif font-medium line-clamp-1 ${
              featured ? "text-lg" : "text-base"
            }`}
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>

          {(product.reviewCount ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-foreground ${
                featured ? "text-lg" : "text-base"
              }`}
              data-testid={`text-price-${product.id}`}
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
