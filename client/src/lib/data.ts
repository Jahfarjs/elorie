import type { Category } from "@shared/schema";
import necklacesImg from "@assets/necklaces.JPG";
import ringsImg from "@assets/rings.JPG";
import earringsImg from "@assets/earrings.JPG";
import braceletsImg from "@assets/bracelets.JPG";
import banglesImg from "@assets/bangles.JPG";
import ankletsImg from "@assets/anklets.JPG";

// Categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Necklaces",
    slug: "necklaces",
    description: "Elegant necklaces for every occasion",
    imageUrl: necklacesImg,
  },
  {
    id: "2",
    name: "Rings",
    slug: "rings",
    description: "Timeless rings that speak volumes",
    imageUrl: ringsImg,
  },
  {
    id: "3",
    name: "Earrings",
    slug: "earrings",
    description: "Stunning earrings to frame your face",
    imageUrl: earringsImg,
  },
  {
    id: "4",
    name: "Bracelets",
    slug: "bracelets",
    description: "Graceful bracelets for your wrist",
    imageUrl: braceletsImg,
  },
  {
    id: "5",
    name: "Bangles",
    slug: "bangles",
    description: "Traditional bangles with modern flair",
    imageUrl: banglesImg,
  },
  {
    id: "6",
    name: "Anklets",
    slug: "anklets",
    description: "Delicate anklets for subtle elegance",
    imageUrl: ankletsImg,
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
