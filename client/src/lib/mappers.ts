import type { Item, Product } from "@/lib/types";

export const mapItemToProduct = (item: Item): Product => {
  // Safety check: ensure item exists and has required fields
  if (!item || !item._id) {
    throw new Error("Invalid item: missing required fields");
  }

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.image
      ? [item.image]
      : [];

  return {
    id: item._id,
    name: item.title || "",
    description: item.description,
    price: item.ourAmount || 0,
    originalPrice: item.originalAmount || null,
    category: item.type ? item.type.toLowerCase() : "other",
    material: item.material || null,
    imageUrl: images[0] || null,
    images,
    codAvailable: item.codAvailable ?? true,
    isTrending: item.isTrendingNow || false,
    isBestSeller: item.isBestSeller || false,
    isCombo: item.isCombo || false,
    rating: item.rating || 0,
    reviewCount: item.reviewCount || 0,
    shippingCharge: item.shippingCharge,
  };
};
