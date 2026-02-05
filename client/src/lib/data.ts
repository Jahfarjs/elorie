import type { Category } from "@shared/schema";

// Categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Necklaces",
    slug: "necklaces",
    description: "Elegant necklaces for every occasion",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
  },
  {
    id: "2",
    name: "Rings",
    slug: "rings",
    description: "Timeless rings that speak volumes",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
  },
  {
    id: "3",
    name: "Earrings",
    slug: "earrings",
    description: "Stunning earrings to frame your face",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Bracelets",
    slug: "bracelets",
    description: "Graceful bracelets for your wrist",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
  },
  {
    id: "5",
    name: "Bangles",
    slug: "bangles",
    description: "Traditional bangles with modern flair",
    imageUrl: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=600&fit=crop",
  },
  {
    id: "6",
    name: "Anklets",
    slug: "anklets",
    description: "Delicate anklets for subtle elegance",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
