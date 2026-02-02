// Utility helpers for storing and restoring a single "pending" cart action
// when a user attempts to add to cart without being authenticated.

export interface PendingCartAction {
  productId: string;
  quantity: number;
  /**
   * Optional path (including query string) to return to after login.
   * Example: "/product/123?ref=home"
   */
  returnTo?: string | null;
  createdAt: number;
}

const STORAGE_KEY = "elorie_pending_cart_action";

export function savePendingCartAction(action: {
  productId: string;
  quantity: number;
  returnTo?: string | null;
}) {
  try {
    const payload: PendingCartAction = {
      ...action,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Fail silently – pending cart is a UX enhancement, not critical.
  }
}

export function getPendingCartAction(): PendingCartAction | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCartAction;
    if (!parsed.productId || !parsed.quantity) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCartAction() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Convenience helper that reads and clears the pending action in one step.
 */
export function consumePendingCartAction(): PendingCartAction | null {
  const action = getPendingCartAction();
  if (action) {
    clearPendingCartAction();
  }
  return action;
}

