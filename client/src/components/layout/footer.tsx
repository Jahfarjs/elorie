import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImage from "@assets/logo.jpeg";

const quickLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=necklaces", label: "Necklaces" },
  { href: "/shop?category=rings", label: "Rings" },
  { href: "/shop?category=earrings", label: "Earrings" },
  { href: "/shop?category=bracelets", label: "Bracelets" },
];

const customerLinks = [
  { href: "/tracking", label: "Track Order" },
  { href: "/profile", label: "My Account" },
  { href: "/cart", label: "Shopping Cart" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block" data-testid="link-footer-logo">
              <img
                src={logoImage}
                alt="Elorie Elegance"
                className="h-19 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Where Elegance Meets Eternity. Discover our exquisite collection of
              handcrafted jewelry, designed to make every moment special.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/elorie.elegance_?igsh=ODFsNG83ZXcwNmJo&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="link-social-instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/918943796816"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="link-social-whatsapp"
              >
                <SiWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6">Customer Care</h4>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Malappuram, Kerala, India
                </span>
              </li>
              <li>
                <a
                  href="mailto:hello@elorieelegance.com"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-contact-email"
                >
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  elorieelegance@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+918943796816"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-contact-phone"
                >
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  +91 89437 96816
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <h5 className="text-sm font-medium mb-3">Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="flex-1"
                  data-testid="input-newsletter-email"
                />
                <Button data-testid="button-newsletter-subscribe">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Elorie Elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
