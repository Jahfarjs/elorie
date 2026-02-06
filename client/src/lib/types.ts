export type ItemType =
  | "Necklaces"
  | "Rings"
  | "Earrings"
  | "Bracelets"
  | "Bangles"
  | "Anklets";

export interface Item {
  _id: string;
  type: ItemType;
  title: string;
  description?: string;
  material?: string;
  images?: string[];
  image?: string;
  originalAmount: number;
  ourAmount: number;
  rating: number;
  reviewCount: number;
  isTrendingNow: boolean;
  isBestSeller: boolean;
  isCombo: boolean;
  shippingCharge: number;
  codAvailable?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  material?: string | null;
  imageUrl?: string | null;
  images?: string[];
  inStock?: boolean;
  shippingCharge?: number;
  codAvailable?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isCombo?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Feedback {
  _id: string;
  customerName: string;
  rating: number;
  description: string;
  createdAt: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface CartResponse {
  _id: string;
  items: CartItem[];
}

export type PaymentMode = "COD" | "UPI";

export interface Address {
  _id?: string;
  label?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  landmark?: string;
  contactNumber: string;
  pinCode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  status: "pendingPayment" | "orderPlaced" | "orderConfirmed" | "orderDispatched" | "orderDelivered" | "cancelled";
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  shippingCharge: number;
  totalItemAmount: number;
  address: string;
  shippingAddress?: Address;
  orderDate: string;
  createdAt?: string;
  items: OrderItem[];
  paymentMode: PaymentMode;
  received: boolean;
  razorpayPaymentId?: string;
}

export interface AdminOrder extends Order {
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PaginationResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  addresses?: Address[];
  defaultAddressId?: string | null;
  defaultAddress?: Address | null;
}
