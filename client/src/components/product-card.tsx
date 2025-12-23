import { Link } from "wouter";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product.id}`} data-testid={`card-product-${product.id}`}>
      <div
        className={`group relative bg-card rounded-2xl overflow-visible transition-all duration-300 hover:shadow-lg ${
          featured ? "p-4" : "p-3"
        }`}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          <img
            src={product.imageUrl || ""}
            alt={product.name}
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

          {product.isTrending && !discount && (
            <Badge
              className="absolute top-3 left-3"
              variant="secondary"
              data-testid={`badge-trending-${product.id}`}
            >
              Trending
            </Badge>
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

          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

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
