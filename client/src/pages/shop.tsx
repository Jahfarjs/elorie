import React, { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { Filter, Grid3X3, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatPrice } from "@/lib/data";
import api from "@/lib/api";
import { mapItemToProduct } from "@/lib/mappers";
import type { Item, Product, ItemTypeRecord } from "@/lib/types";
import type { Category } from "@shared/schema";

const materials = ["22K Gold", "18K Gold", "14K Gold", "18K White Gold", "18K Rose Gold", "Platinum"];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

function FilterSidebar({
  selectedCategories,
  setSelectedCategories,
  selectedMaterials,
  setSelectedMaterials,
  priceRange,
  setPriceRange,
  onClearFilters,
  dynamicCategories,
}: {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedMaterials: string[];
  setSelectedMaterials: (materials: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  onClearFilters: () => void;
  dynamicCategories: Category[];
}) {
  const hasFilters = selectedCategories.length > 0 || selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
            data-testid="button-clear-filters"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Categories</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedCategories.length === 0}
              onCheckedChange={(checked) => {
                if (checked) setSelectedCategories([]);
              }}
              data-testid="checkbox-category-all"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              All Categories
            </span>
          </label>
          {dynamicCategories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.slug]);
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category.slug)
                    );
                  }
                }}
                data-testid={`checkbox-category-${category.slug}`}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="py-4"
          data-testid="slider-price-range"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Material</h4>
        <div className="space-y-3">
          {materials.map((material) => (
            <label
              key={material}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedMaterials.includes(material)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMaterials([...selectedMaterials, material]);
                  } else {
                    setSelectedMaterials(
                      selectedMaterials.filter((m) => m !== material)
                    );
                  }
                }}
                data-testid={`checkbox-material-${material.toLowerCase().replace(" ", "-")}`}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {material}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const categoryFromUrl = searchParams.get("category");
  const sortFromUrl = searchParams.get("sort");
  const searchQueryFromUrl = searchParams.get("search");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFromUrl ? [categoryFromUrl] : []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState("featured");
  const [gridCols, setGridCols] = useState<5 | 7>(5);
  const itemsPerPage = 35;
  const [currentPage, setCurrentPage] = useState(1);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    if (sortFromUrl === "trending" || sortFromUrl === "bestseller") {
      setSortBy("featured");
    }
  }, [sortFromUrl]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [itemsResponse, typesResponse] = await Promise.all([
          api.get<{ data: Item[] }>("/items", { params: { limit: 200 } }),
          api.get<ItemTypeRecord[]>("/item-types")
        ]);

        const validItems = itemsResponse.data.data.filter((item) => item && item._id && item.type);
        setProducts(validItems.map(mapItemToProduct));

        const categoriesMap = typesResponse.data.map(type => ({
          id: type._id,
          name: type.name,
          slug: type.name.toLowerCase(),
          description: "",
          imageUrl: ""
        }));
        setDynamicCategories(categoriesMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
      }
    };
    fetchProductsAndCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQueryFromUrl) {
      const q = searchQueryFromUrl.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedMaterials.length > 0) {
      result = result.filter((p) => p.material && selectedMaterials.includes(p.material));
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.reverse();
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategories, selectedMaterials, priceRange, sortBy, searchQueryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedMaterials, priceRange, sortBy, searchQueryFromUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceRange([0, 10000]);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedMaterials.length +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--logo-bg))] dark:bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-2">
              {selectedCategories.length === 1
                ? dynamicCategories.find((c) => c.slug === selectedCategories[0])?.name ||
                "Shop All"
                : "Shop All Jewelry"}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterSidebar
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedMaterials={selectedMaterials}
                setSelectedMaterials={setSelectedMaterials}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onClearFilters={clearFilters}
                dynamicCategories={dynamicCategories}
              />
            </aside>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="lg:hidden"
                        data-testid="button-mobile-filter"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar
                          selectedCategories={selectedCategories}
                          setSelectedCategories={setSelectedCategories}
                          selectedMaterials={selectedMaterials}
                          setSelectedMaterials={setSelectedMaterials}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          onClearFilters={clearFilters}
                          dynamicCategories={dynamicCategories}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="capitalize cursor-pointer"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== cat)
                        )
                      }
                    >
                      {cat}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className="w-[180px]"
                      data-testid="select-sort"
                    >
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={gridCols === 5 ? "bg-muted" : ""}
                      onClick={() => setGridCols(5)}
                      data-testid="button-grid-5"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={gridCols === 7 ? "bg-muted" : ""}
                      onClick={() => setGridCols(7)}
                      data-testid="button-grid-7"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">
                    No products found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-4 sm:gap-6 ${gridCols === 7
                      ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                      }`}
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((p) => Math.max(1, p - 1));
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages })
                            .map((_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                            .map((p, i, arr) => (
                              <React.Fragment key={p}>
                                {i > 0 && arr[i - 1] !== p - 1 && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    isActive={currentPage === p}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(p);
                                    }}
                                  >
                                    {p}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            ))
                          }

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
