import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ShoppingBag, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SafeImage } from "@/components/ui/safe-image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { mapItemToProduct } from "@/lib/mappers";
import type { Item, Product } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { savePendingCartAction } from "@/lib/pending-cart";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await api.get<Item>(`/items/${id}`);
        
        // Validate item before mapping
        if (!response.data || !response.data._id || !response.data.type) {
          throw new Error("Invalid product data");
        }
        
        const mapped = mapItemToProduct(response.data);
        setProduct(mapped);
        setCurrentImageIndex(0); // Reset image index when product changes

        const relatedResponse = await api.get<{ data: Item[] }>("/items", {
          params: { type: response.data.type, limit: 4 },
        });
        
        // Filter out invalid items before mapping
        const validRelatedItems = relatedResponse.data.data.filter(
          (item) => item && item._id && item.type && item._id !== response.data._id
        );
        setRelatedProducts(validRelatedItems.map(mapItemToProduct));
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

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

  const handleAddToCart = async () => {
    if (!product) return;

    const alreadyInCart = items.some((entry) => entry.productId === product.id);
    if (alreadyInCart) {
      setLocation("/cart");
      return;
    }

    if (!token) {
      const returnTo = window.location.pathname + window.location.search;
      savePendingCartAction({
        productId: product.id,
        quantity,
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
      await addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    } catch {
      // Error toast already handled in cart context.
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const alreadyInCart = items.some((entry) => entry.productId === product.id);
  
  const productImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl || ""];
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

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
              <div className="aspect-square rounded-3xl overflow-hidden bg-muted relative group">
                <SafeImage
                  key={`${product.id}-${currentImageIndex}`}
                  src={productImages[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {discount && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    -{discount}%
                  </Badge>
                )}
                {product.isCombo && !discount && (
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    Combo
                  </Badge>
                )}
                
                {/* Navigation arrows - only show if multiple images */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white dark:hover:bg-black"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white dark:hover:bg-black"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Image indicator dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/60 hover:bg-white/80"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail gallery - only show if multiple images */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden bg-muted border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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

              {(product.reviewCount ?? 0) > 0 && (
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
              )}

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
                    disabled={alreadyInCart}
                    className={`px-4 py-3 transition-colors ${
                      alreadyInCart ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                    }`}
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
                    disabled={alreadyInCart}
                    className={`px-4 py-3 transition-colors ${
                      alreadyInCart ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                    }`}
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
                  {alreadyInCart ? "View Cart" : "Add to Cart"}
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

              {alreadyInCart && (
                <p className="text-sm text-muted-foreground">
                  This item is already in your cart.
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                  <p className="text-xs font-medium">Orders over Rs.499</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Authenticity</p>
                  <p className="text-xs font-medium">100% Guaranteed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Easy Returns</p>
                  <p className="text-xs font-medium">7-day Policy</p>
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
