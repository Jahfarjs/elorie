import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, X, Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/components/theme-provider";
import logoImage from "@assets/logo.jpeg";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=necklaces", label: "Necklaces" },
  { href: "/shop?category=rings", label: "Rings" },
  { href: "/shop?category=earrings", label: "Earrings" },
];

export function Header() {
  const [location, setLocation] = useLocation();
  const isHome = location === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const cartCount = getItemCount();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.trim()) {
      setLocation(`/shop?search=${encodeURIComponent(query.trim())}`);
    } else {
      setLocation('/shop');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/95 backdrop-blur-md shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <img
              src={logoImage}
              alt="Elorie Elegance"
              className={`${isHome ? "h-20" : "h-12"} w-auto object-contain`}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors relative group ${location === link.href
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground"
                  }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="hidden sm:flex relative items-center"
            >
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                type="search"
                placeholder="Search..."
                onChange={handleSearchInput}
                className="w-full bg-background/50 pl-9 sm:w-[200px] lg:w-[250px] h-9 transition-all focus-visible:ring-1 focus-visible:ring-primary focus-visible:w-[300px]"
              />
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <Link href="/profile">
              <Button variant="ghost" size="icon" data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" data-testid="button-cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${location === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted"
                  }`}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}

            <form onSubmit={(e) => e.preventDefault()} className="px-4 py-2 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  type="search"
                  placeholder="Search products..."
                  onChange={handleSearchInput}
                  className="w-full pl-10 bg-background/50 h-10"
                />
              </div>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
