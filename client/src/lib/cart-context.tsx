import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Product, CartResponse } from "@/lib/types";
import { mapItemToProduct } from "@/lib/mappers";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  items: CartItemWithProduct[];
  /**
   * Add an item to the cart.
   * Resolves only after the backend cart has been updated.
   */
  addItem: (product: Product, quantity?: number) => Promise<void>;
  /**
   * Remove an item from the cart by product id.
   * Resolves only after the backend cart has been updated.
   */
  removeItem: (productId: string) => Promise<void>;
  /**
   * Update quantity for a given product id.
   * Resolves only after the backend cart has been updated.
   */
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  /**
   * Clear the cart for the current user.
   * Resolves only after the backend cart has been updated.
   */
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  /**
   * Explicitly sync cart state with the backend.
   */
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

const mapCartResponse = (cart: CartResponse): CartItemWithProduct[] =>
  cart.items
    .filter((entry) => entry.item && entry.item._id && entry.item.type)
    .map((entry) => ({
      id: `${cart._id}-${entry.item._id}`,
      productId: entry.item._id,
      quantity: entry.quantity,
      product: mapItemToProduct(entry.item),
    }));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const { token } = useAuth();
  const { toast } = useToast();

  const loadCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      const response = await api.get<CartResponse>("/cart");
      setItems(mapCartResponse(response.data));
    } catch {
      // If cart loading fails, keep existing state but surface a soft error.
      toast({
        title: "Unable to load cart",
        description: "Please refresh the page or try again.",
      });
    }
  }, [token, toast]);

  useEffect(() => {
    // Initial sync whenever auth token changes.
    void loadCart();
  }, [loadCart]);

  const addItem = useCallback(
    async (product: Product, quantity: number = 1) => {
      if (!token) {
        // Guard against misuse – UI should prevent calling this when unauthenticated.
        throw new Error("Cannot add items to cart when not authenticated.");
      }
      try {
        const response = await api.post<CartResponse>("/cart", {
          itemId: product.id,
          quantity,
        });
        setItems(mapCartResponse(response.data));
      } catch (error) {
        toast({
          title: "Cart update failed",
          description: "Please try again.",
        });
        throw error;
      }
    },
    [token, toast]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!token) {
        throw new Error("Cannot remove items from cart when not authenticated.");
      }
      try {
        const response = await api.delete<CartResponse>(`/cart/${productId}`);
        setItems(mapCartResponse(response.data));
      } catch (error) {
        toast({
          title: "Cart update failed",
          description: "Please try again.",
        });
        throw error;
      }
    },
    [token, toast]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(productId);
        return;
      }
      if (!token) {
        throw new Error("Cannot update cart quantity when not authenticated.");
      }
      try {
        const response = await api.put<CartResponse>(`/cart/${productId}`, {
          quantity,
        });
        setItems(mapCartResponse(response.data));
      } catch (error) {
        toast({
          title: "Cart update failed",
          description: "Please try again.",
        });
        throw error;
      }
    },
    [removeItem, token, toast]
  );

  const clearCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      const response = await api.delete<CartResponse>("/cart");
      setItems(mapCartResponse(response.data));
    } catch (error) {
      toast({
        title: "Cart update failed",
        description: "Please try again.",
      });
      throw error;
    }
  }, [token, toast]);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      syncCartWithBackend: loadCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount, loadCart]
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
