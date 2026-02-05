import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Package, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import api from "@/lib/api";
import { formatPrice } from "@/lib/data";
import type { Address, PaymentMode } from "@/lib/types";

const emptyAddress: Address = {
  label: "Home",
  address: "",
  city: "",
  district: "",
  state: "",
  landmark: "",
  contactNumber: "",
  pinCode: "",
};

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    // Avoid reloading the SDK if it is already present.
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function formatAddressLine(addr?: Address | null) {
  if (!addr) return "";
  return [addr.address, addr.landmark, addr.city, addr.district, addr.state, addr.pinCode]
    .filter((p) => Boolean(p && String(p).trim()))
    .join(", ");
}

export default function Checkout() {
  const { user, refreshProfile } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const subtotal = getTotal();
  const perItemShipping = items.reduce((sum, item) => sum + (item.product.shippingCharge || 0), 0);
  const shipping = subtotal > 499 ? 0 : perItemShipping;
  const total = subtotal + shipping;

  const savedAddresses = user?.addresses || [];
  const defaultAddressId = user?.defaultAddressId || savedAddresses.find((a) => a.isDefault)?._id || savedAddresses[0]?._id;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(defaultAddressId ? String(defaultAddressId) : "new");
  const [newAddress, setNewAddress] = useState<Address>({ ...emptyAddress, contactNumber: user?.phone || "" });
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("COD");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const codAllowed = useMemo(() => {
    return items.every((i) => (i.product.codAvailable ?? true) === true);
  }, [items]);

  const selectedAddress: Address | null = useMemo(() => {
    if (selectedAddressId === "new") return newAddress;
    const found = savedAddresses.find((a) => String(a._id) === String(selectedAddressId));
    return found || null;
  }, [newAddress, savedAddresses, selectedAddressId]);

  const validateAddress = (addr: Address | null) => {
    if (!addr) return "Please select an address.";
    const required: Array<keyof Address> = ["address", "city", "district", "state", "contactNumber", "pinCode"];
    const missing = required.find((k) => !addr[k] || !String(addr[k] ?? "").trim());
    if (missing) return "Please fill all required address fields.";
    return null;
  };

  const ensureSignedIn = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please login to continue checkout." });
      setLocation("/profile");
      return false;
    }
    return true;
  };

  const goNextFromAddress = () => {
    if (!ensureSignedIn()) return;
    const err = validateAddress(selectedAddress);
    if (err) {
      toast({ title: "Address required", description: err });
      return;
    }
    setStep(2);
  };

  const openConfirm = () => {
    if (!ensureSignedIn()) return;
    const err = validateAddress(selectedAddress);
    if (err) {
      toast({ title: "Address required", description: err });
      setStep(1);
      return;
    }
    if (paymentMode === "COD" && !codAllowed) {
      toast({ title: "COD not available", description: "Cash on Delivery is not available for one or more items in your cart." });
      return;
    }
    setConfirmOpen(true);
  };

  const placeOrder = async () => {
    if (!selectedAddress) return;
    if (paymentMode === "COD" && !codAllowed) return;

    setPlacingOrder(true);
    try {
      // If user entered a new address during checkout, persist it.
      let shippingAddress: Address = selectedAddress;
      if (selectedAddressId === "new" && saveNewAddress) {
        // Update profile by appending address list (keeps current default as-is).
        const nextAddresses = [...savedAddresses, { ...newAddress, isDefault: savedAddresses.length === 0 }];
        await api.put("/auth/me", { addresses: nextAddresses });
        await refreshProfile();
      }

      // Clean the shipping address to only include required fields
      const cleanedShippingAddress = {
        label: shippingAddress.label,
        address: shippingAddress.address,
        city: shippingAddress.city,
        district: shippingAddress.district,
        state: shippingAddress.state,
        landmark: shippingAddress.landmark || "",
        contactNumber: shippingAddress.contactNumber,
        pinCode: shippingAddress.pinCode,
      };

      const orderResponse = await api.post("/orders", {
        paymentMode,
        shippingAddress: cleanedShippingAddress,
      });

      if (paymentMode === "UPI") {
        // Ensure the Razorpay SDK is available before creating an order.
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your connection.");
        }

        // Create the Razorpay order on the backend (amount in INR).
        const paymentResponse = await api.post("/payment/create-order", {
          orderId: orderResponse.data._id,
          amount: total,
        });
        const razorpayOptions = {
          key: paymentResponse.data.keyId,
          amount: paymentResponse.data.amount,
          currency: paymentResponse.data.currency,
          name: "Elorie Jewels",
          order_id: paymentResponse.data.razorpayOrderId,
          // handler is called only after successful payment completion.
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            await api.post("/payment/verify", {
              orderId: orderResponse.data._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast({ title: "Payment successful" });
            await clearCart();
            setLocation("/profile");
          },
          // Surface failures so users can retry or choose COD.
          modal: {
            ondismiss: () => {
              toast({ title: "Payment cancelled", description: "You can retry the payment from your orders page." });
            },
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: selectedAddress?.contactNumber || user?.phone || "",
          },
        };
        // @ts-expect-error Razorpay comes from script include
        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.on("payment.failed", (response: any) => {
          toast({
            title: "Payment failed",
            description: response?.error?.description || "The payment could not be completed.",
            variant: "destructive",
          });
        });
        razorpay.open();
      } else {
        toast({ title: "Order placed successfully" });
        await clearCart();
        setLocation("/profile");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Please try again.";
      const validationErrors = error?.response?.data?.errors;
      
      toast({
        title: "Checkout failed",
        description: validationErrors ? validationErrors.join(", ") : errorMessage,
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
      setConfirmOpen(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 rounded-2xl">
              <p className="text-muted-foreground">Please sign in to continue checkout.</p>
              <Link href="/profile">
                <Button className="mt-4">Go to Sign In</Button>
              </Link>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 rounded-2xl">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link href="/shop">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </Card>
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
              href="/cart"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Cart
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal">Checkout</h1>
            <p className="text-muted-foreground mt-1">
              Step {step} of 2 • {step === 1 ? "Confirm Address" : "Choose Payment"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 ? (
                <Card className="p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-medium">Delivery Address</h2>
                  </div>

                  <RadioGroup
                    value={String(selectedAddressId)}
                    onValueChange={(v) => setSelectedAddressId(v as any)}
                    className="space-y-3"
                  >
                    {savedAddresses.map((addr) => (
                      <label
                        key={String(addr._id)}
                        className="flex gap-3 rounded-xl border p-4 hover:bg-muted/30 cursor-pointer"
                      >
                        <RadioGroupItem value={String(addr._id)} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{addr.label || "Address"}</p>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 break-words">
                            {formatAddressLine(addr)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Contact: {addr.contactNumber}
                          </p>
                        </div>
                      </label>
                    ))}

                    <label className="flex gap-3 rounded-xl border p-4 hover:bg-muted/30 cursor-pointer">
                      <RadioGroupItem value="new" className="mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">Use a new address</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add a new delivery address for this order.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  {selectedAddressId === "new" && (
                    <div className="mt-6">
                      <Separator className="mb-6" />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Address *</Label>
                          <Input value={newAddress.address} onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Input value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>District *</Label>
                          <Input value={newAddress.district} onChange={(e) => setNewAddress((p) => ({ ...p, district: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>State *</Label>
                          <Input value={newAddress.state} onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Pin Code *</Label>
                          <Input value={newAddress.pinCode} onChange={(e) => setNewAddress((p) => ({ ...p, pinCode: e.target.value }))} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Landmark</Label>
                          <Input value={newAddress.landmark || ""} onChange={(e) => setNewAddress((p) => ({ ...p, landmark: e.target.value }))} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Contact Number *</Label>
                          <Input value={newAddress.contactNumber} onChange={(e) => setNewAddress((p) => ({ ...p, contactNumber: e.target.value }))} />
                          <p className="text-xs text-muted-foreground">
                            You can change the contact number for this specific order.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-4 text-sm">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        />
                        Save this address to my account
                      </label>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setLocation("/cart")}>
                      Back
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={goNextFromAddress}>
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-medium">Payment Method</h2>
                  </div>

                  {!codAllowed && (
                    <Card className="p-4 rounded-xl border-destructive/40 bg-destructive/5 mb-4">
                      <p className="text-sm">
                        <span className="font-medium">COD not available:</span> one or more items in your cart do not support Cash on Delivery.
                      </p>
                    </Card>
                  )}

                  <RadioGroup
                    value={paymentMode}
                    onValueChange={(v) => setPaymentMode(v as PaymentMode)}
                    className="space-y-3"
                  >
                    <label className={`flex gap-3 rounded-xl border p-4 hover:bg-muted/30 cursor-pointer ${!codAllowed ? "opacity-60" : ""}`}>
                      <RadioGroupItem value="COD" className="mt-1" disabled={!codAllowed} />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground mt-1">Pay when the item is delivered.</p>
                      </div>
                    </label>
                    <label className="flex gap-3 rounded-xl border p-4 hover:bg-muted/30 cursor-pointer">
                      <RadioGroupItem value="UPI" className="mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">UPI (Razorpay)</p>
                        <p className="text-sm text-muted-foreground mt-1">Secure online payment.</p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                      Back to Address
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={openConfirm}>
                      Review & Place Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-lg font-medium">Items</h3>
                </div>
                <div className="space-y-3">
                  {items.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{i.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {i.quantity}
                          {i.product.codAvailable === false ? " • COD not available" : ""}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(i.product.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 rounded-2xl sticky top-24">
                <h2 className="font-serif text-xl font-medium mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center">
                    Secure checkout powered by industry-leading encryption
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Confirm your order</DialogTitle>
              <DialogDescription>
                Please verify your items, delivery address, and payment method before placing the order.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium mt-1">{selectedAddress?.label || "Address"}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatAddressLine(selectedAddress)}</p>
                <p className="text-xs text-muted-foreground mt-1">Contact: {selectedAddress?.contactNumber}</p>
              </Card>

              <Card className="p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="font-medium mt-1">{paymentMode === "COD" ? "Cash on Delivery" : "UPI (Razorpay)"}</p>
              </Card>

              <Card className="p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {items.map((i) => (
                    <div key={`confirm-${i.id}`} className="flex items-center justify-between gap-3">
                      <p className="text-sm truncate">{i.product.name} × {i.quantity}</p>
                      <p className="text-sm font-medium">{formatPrice(i.product.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              </Card>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={placingOrder}>
                Cancel
              </Button>
              <Button onClick={placeOrder} disabled={placingOrder}>
                {placingOrder ? "Placing..." : "Confirm & Place Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

