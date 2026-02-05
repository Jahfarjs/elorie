import type {
  User,
  InsertUser,
  Product,
  InsertProduct,
  CartItem,
  InsertCartItem,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Cart
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Orders
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Golden Serpent Necklace",
        description: "A stunning 22K gold necklace featuring an intricate serpent design with ruby eyes. Perfect for special occasions.",
        price: 2499,
        originalPrice: 2999,
        category: "necklaces",
        material: "22K Gold",
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: true,
        isBestSeller: true,
        rating: 4.9,
        reviewCount: 128,
      },
      {
        name: "Diamond Solitaire Ring",
        description: "Classic diamond solitaire ring set in 18K white gold. A timeless symbol of eternal love.",
        price: 3999,
        originalPrice: null,
        category: "rings",
        material: "18K White Gold",
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: true,
        isBestSeller: false,
        rating: 5.0,
        reviewCount: 89,
      },
      {
        name: "Pearl Drop Earrings",
        description: "Elegant freshwater pearl drop earrings with delicate gold chain. Perfect for everyday luxury.",
        price: 899,
        originalPrice: 1099,
        category: "earrings",
        material: "14K Gold",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: false,
        isBestSeller: true,
        rating: 4.8,
        reviewCount: 245,
      },
      {
        name: "Rose Gold Tennis Bracelet",
        description: "Stunning tennis bracelet featuring brilliant-cut diamonds set in rose gold.",
        price: 4599,
        originalPrice: 5299,
        category: "bracelets",
        material: "18K Rose Gold",
        imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: true,
        isBestSeller: true,
        rating: 4.9,
        reviewCount: 167,
      },
      {
        name: "Traditional Gold Bangles Set",
        description: "Set of 6 traditional gold bangles with intricate filigree work. Perfect for celebrations.",
        price: 5999,
        originalPrice: null,
        category: "bangles",
        material: "22K Gold",
        imageUrl: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: false,
        isBestSeller: true,
        rating: 4.7,
        reviewCount: 92,
      },
      {
        name: "Dainty Gold Anklet",
        description: "Delicate gold chain anklet with tiny charm accents. Subtle elegance for your ankle.",
        price: 399,
        originalPrice: 499,
        category: "anklets",
        material: "14K Gold",
        imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: true,
        isBestSeller: false,
        rating: 4.6,
        reviewCount: 78,
      },
      {
        name: "Emerald Statement Necklace",
        description: "Luxurious statement necklace featuring Colombian emeralds set in 18K gold.",
        price: 8999,
        originalPrice: 9999,
        category: "necklaces",
        material: "18K Gold",
        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: true,
        isBestSeller: false,
        rating: 5.0,
        reviewCount: 34,
      },
      {
        name: "Vintage Ruby Ring",
        description: "Art deco inspired ruby ring with diamond halo setting in platinum.",
        price: 6499,
        originalPrice: null,
        category: "rings",
        material: "Platinum",
        imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
        images: [],
        inStock: true,
        isTrending: false,
        isBestSeller: true,
        rating: 4.9,
        reviewCount: 56,
      },
    ];

    sampleProducts.forEach((product, index) => {
      const id = `product-${index + 1}`;
      this.products.set(id, { ...product, id } as Product);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      fullName: insertUser.fullName ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id } as Product;
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const quantity = insertItem.quantity ?? 1;
    const existing = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertItem.userId && item.productId === insertItem.productId
    );
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const id = randomUUID();
    const item: CartItem = { ...insertItem, id, quantity };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    item.quantity = quantity;
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<boolean> {
    const items = Array.from(this.cartItems.entries()).filter(
      ([, item]) => item.userId === userId
    );
    items.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = `ORD-${Date.now()}`;
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status ?? "orderPlaced",
      shippingAddress: insertOrder.shippingAddress ?? null,
      trackingNumber: insertOrder.trackingNumber ?? null,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    order.status = status;
    return order;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = { ...insertItem, id };
    this.orderItems.set(id, item);
    return item;
  }
}

export const storage = new MemStorage();
