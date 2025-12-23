import { Link, useParams } from "wouter";
import { ArrowLeft, ShoppingBag, Heart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { getProductById, products, formatPrice } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl mb-4">Product not found</h1>
            <Link href="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-muted relative">
                <img
                  src={product.imageUrl || ""}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">
                  {product.category}
                </p>
                <h1
                  className="font-serif text-3xl sm:text-4xl font-normal leading-tight"
                  data-testid="text-product-title"
                >
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 5)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-semibold"
                  data-testid="text-product-price"
                >
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="text-green-600 font-medium">In Stock</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-muted transition-colors"
                    data-testid="button-quantity-decrease"
                  >
                    -
                  </button>
                  <span
                    className="px-4 py-3 min-w-[3rem] text-center font-medium"
                    data-testid="text-quantity"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-muted transition-colors"
                    data-testid="button-quantity-increase"
                  >
                    +
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  data-testid="button-wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                  <p className="text-xs font-medium">Orders over Rs.5000</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Authenticity</p>
                  <p className="text-xs font-medium">100% Guaranteed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Easy Returns</p>
                  <p className="text-xs font-medium">30-day Policy</p>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-serif text-2xl font-normal mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
