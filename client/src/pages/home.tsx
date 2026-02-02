import { Link } from "wouter";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { categories } from "@/lib/data";
import logoImage from "@assets/logo.jpeg";
import api from "@/lib/api";
import { mapItemToProduct } from "@/lib/mappers";
import type { Feedback, Item, Product } from "@/lib/types";

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-100/50 via-[hsl(var(--logo-bg))] to-gold-50/30 dark:from-gold-900/20 dark:via-background dark:to-gold-800/10" />
      
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold-200/40 dark:bg-gold-700/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold-100/50 dark:bg-gold-800/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <span className="uppercase tracking-[0.2em] text-xs">
              Special Offer
            </span>
            <span className="h-1 w-1 rounded-full bg-primary/40" />
            <span>Free shipping on all orders above ₹499</span>
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">
            Premium Handcrafted Jewelry
          </p>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-tight">
            Where <span className="text-gradient-gold">Elegance</span>
            <br />
            Meets Eternity
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover our exquisite collection of handcrafted jewelry, 
            designed to make every moment special and every memory timeless.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/shop">
              <Button size="lg" className="px-8 text-base" data-testid="button-hero-shop">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/shop?category=necklaces">
              <Button
                variant="outline"
                size="lg"
                className="px-8 text-base"
                data-testid="button-hero-necklaces"
              >
                View Necklaces
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(var(--logo-bg))] to-transparent dark:from-background" />
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-3">
            Browse By Category
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal">
            Discover Our Collections
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
              data-testid={`link-category-${category.slug}`}
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h3 className="font-serif text-xl sm:text-2xl text-white font-medium">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm mt-1 hidden sm:block">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ViewAllCard({ href, label = "View All" }: { href: string; label?: string }) {
  return (
    <Link href={href}>
      <Card className="h-full flex items-center justify-center p-6 hover:border-primary transition-colors cursor-pointer group">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-lg">{label}</p>
            <p className="text-sm text-muted-foreground">Explore more</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function TrendingSection({ products }: { products: Product[] }) {
  
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-3">
              What&apos;s Hot
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Trending Now
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <ViewAllCard href="/shop?sort=trending" />
        </div>
      </div>
    </section>
  );
}

function BestSellersSection({ products }: { products: Product[] }) {
  
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-3">
              Customer Favorites
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Best Sellers
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <ViewAllCard href="/shop?sort=bestseller" />
        </div>
      </div>
    </section>
  );
}

function ComboSection({ products }: { products: Product[] }) {
  // Only render section if there are combo products
  if (products.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-3">
              Special Offers
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Combo Collections
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <ViewAllCard href="/shop?sort=combo" />
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=1000&fit=crop"
                alt="Jewelry craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-3xl -z-10" />
          </div>
          
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium">
              Our Story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
              Crafting Elegance Since 1985
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                For over three decades, Elorie Elegance has been at the forefront of 
                luxury jewelry design, combining traditional craftsmanship with 
                contemporary aesthetics.
              </p>
              <p>
                Each piece in our collection is meticulously handcrafted by master 
                artisans, using only the finest materials sourced from around the world. 
                We believe that jewelry is not just an accessory, but a reflection of 
                one&apos;s personality and a celebration of life&apos;s precious moments.
              </p>
              <p>
                From engagement rings to heirloom pieces, every creation tells a story 
                of elegance, quality, and timeless beauty.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <img
                src={logoImage}
                alt="Elorie Elegance"
                className="h-16 w-auto object-contain opacity-70"
              />
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-2xl font-serif font-medium">30+</p>
                <p className="text-sm text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: Feedback[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-3">
            What Our Customers Say
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal">
            Customer Stories
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial) => (
            <Card
              key={testimonial._id}
              className="p-6 sm:p-8 rounded-2xl"
              data-testid={`card-testimonial-${testimonial._id}`}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.description}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {testimonial.customerName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.customerName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-20 sm:py-28 bg-primary/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-normal mb-4">
          Join the Elorie Family
        </h2>
        <p className="text-muted-foreground mb-8">
          Subscribe to receive exclusive offers, new collection launches, and jewelry care tips.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-testid="input-newsletter"
          />
          <Button size="lg" className="px-8" data-testid="button-subscribe">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [comboItems, setComboItems] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [trendingResponse, bestSellerResponse, comboResponse, feedbackResponse] = await Promise.all([
          api.get<{ data: Item[] }>("/items", { params: { isTrendingNow: true, limit: 5 } }),
          api.get<{ data: Item[] }>("/items", { params: { isBestSeller: true, limit: 5 } }),
          api.get<{ data: Item[] }>("/items", { params: { isCombo: true, limit: 5 } }),
          api.get<{ data: Feedback[] }>("/feedback", { params: { limit: 6 } }),
        ]);

        // Filter out invalid items and map to products
        const validTrendingItems = trendingResponse.data.data.filter((item) => item && item._id && item.type);
        const validBestSellerItems = bestSellerResponse.data.data.filter((item) => item && item._id && item.type);
        const validComboItems = comboResponse.data.data.filter((item) => item && item._id && item.type);

        setTrendingProducts(validTrendingItems.map(mapItemToProduct));
        setBestSellers(validBestSellerItems.map(mapItemToProduct));
        setComboItems(validComboItems.map(mapItemToProduct));
        setFeedback(feedbackResponse.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Set empty arrays on error to prevent crashes
        setTrendingProducts([]);
        setBestSellers([]);
        setComboItems([]);
        setFeedback([]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--logo-bg))] dark:bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <TrendingSection products={trendingProducts} />
        <BestSellersSection products={bestSellers} />
        <ComboSection products={comboItems} />
        <AboutSection />
        <TestimonialsSection testimonials={feedback} />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
