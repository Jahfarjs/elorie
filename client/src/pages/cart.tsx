import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SafeImage } from "@/components/ui/safe-image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const subtotal = getTotal();
  const perItemShipping = items.reduce(
    (sum, item) => sum + (item.product.shippingCharge || 0),
    0
  );
  const shipping = subtotal > 899 ? 0 : perItemShipping;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please login to place your order.",
      });
      setLocation("/profile");
      return;
    }

    // Checkout is a multi-step flow (address -> payment -> confirm)
    // Address confirmation happens before payment selection.
    setLocation("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="font-serif text-3xl font-normal mb-3">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link href="/shop">
                <Button size="lg" data-testid="button-continue-shopping-empty">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Continue Shopping
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 sm:p-6 rounded-2xl"
                  data-testid={`card-cart-item-${item.productId}`}
                >
                  <div className="flex gap-4 sm:gap-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0">
                      <SafeImage
                        src={item.product.imageUrl || ""}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {item.product.category}
                          </p>
                          <h3 className="font-serif text-lg font-medium mt-1 line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.product.material}
                          </p>
                        </div>
                        <p
                          className="font-semibold text-lg"
                          data-testid={`text-item-price-${item.productId}`}
                        >
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span
                            className="w-10 text-center font-medium"
                            data-testid={`text-quantity-${item.productId}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 rounded-2xl sticky top-24">
                <h2 className="font-serif text-xl font-medium mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span data-testid="text-shipping">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders above {formatPrice(899)}
                    </p>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-total">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center">
                    Secure checkout powered by industry-leading encryption
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
