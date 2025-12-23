# NITHISHA JEWELLERS - Premium Jewelry E-Commerce Design Guidelines

## Design Approach
**Reference-Based**: Inspired by luxury e-commerce platforms (Tiffany & Co, Net-a-Porter) with flowing, premium aesthetics. Focus on elegance, spaciousness, and visual storytelling.

## Core Design Principles
1. **Flowing Over Boxy**: Soft curves, generous spacing, organic transitions between sections
2. **Premium Positioning**: Sophisticated simplicity, breathing room, refined details
3. **Visual Hierarchy**: Large, high-quality jewelry imagery takes center stage

---

## Typography System
- **Primary Font**: Playfair Display (serif) for headings - elegant, luxurious
- **Secondary Font**: Inter (sans-serif) for body text - clean, readable
- **Hierarchy**:
  - Hero Headlines: text-6xl/text-7xl, font-normal
  - Section Titles: text-4xl/text-5xl, font-normal, tracking-tight
  - Product Names: text-xl/text-2xl, font-medium
  - Body Text: text-base/text-lg, leading-relaxed
  - Accent Text: text-sm, uppercase, tracking-widest for categories

---

## Layout System
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 24
- Section padding: py-16 to py-32 (desktop), py-12 (mobile)
- Component spacing: gap-8 to gap-16
- Content containers: max-w-7xl for full sections, max-w-prose for text content
- Generous whitespace between sections (mb-24/mb-32)

---

## Component Library

### Homepage Sections (in order):

**1. Hero Section (80vh)**
- Full-width background image: Elegant jewelry product/lifestyle shot with subtle overlay
- Centered content: Brand name (from logo), tagline, primary CTA button with blur backdrop
- Minimal, spacious design

**2. Category Section**
- 3-column grid (lg:grid-cols-3, md:grid-cols-2)
- Large category cards with overlay text on hover
- Categories: Necklaces, Rings, Earrings, Bracelets, Bangles, Anklets
- Rounded corners (rounded-2xl), elegant typography

**3. Trending Items**
- 4-column product grid (lg:grid-cols-4, md:grid-cols-3, sm:grid-cols-2)
- Product cards: Large square image, product name, price, subtle shadow on hover
- "View All" link at bottom

**4. Best Sellers**
- Horizontal scrollable carousel/slider
- 5-6 featured products with larger cards
- Auto-scroll with manual navigation dots

**5. About Section**
- 2-column layout: Image (craftsperson/store) + text content
- Flowing paragraph about heritage, craftsmanship, quality
- Soft rounded image (rounded-3xl)

**6. Customer Testimonials**
- 3-column grid of testimonial cards
- Customer name, 5-star rating display, quote, subtle background
- Circular customer avatars (placeholder initials)

**7. Footer**
- 4-column layout: Brand info, Quick Links, Contact Details, Social Media
- Contact: Email, Instagram, WhatsApp icons with links, physical address
- Newsletter signup: Email input with elegant button
- Soft top border separation

### Product Listing Page
- Filter sidebar (left, 25% width): Categories, price range slider, material filters
- Product grid (right, 75% width): 3-column grid
- Sorting dropdown: Price, Popularity, New Arrivals
- Pagination at bottom

### Cart Page
- 2-column layout: Cart items list (70%) + Order summary card (30%)
- Item cards: Product image (small), name, quantity selector, price, remove button
- Summary: Subtotal, shipping, total with prominent checkout button

### Tracking Page
- Centered timeline/stepper component showing order journey
- Stages: Order Placed → Processing → Shipped → Out for Delivery → Delivered
- Order details card: Order number, date, items preview, delivery address

### Profile Page
- Sidebar navigation: Profile, Orders, Wishlist, Addresses, Settings
- Main content area switching based on selection
- Order history: Cards showing order date, items, status, view details

---

## Animations & Interactions
- Smooth hover scale on product cards (scale-105, transition-transform)
- Fade-in on scroll for section reveals (minimal, tasteful)
- Image zoom on product hover (subtle)
- NO complex scroll-triggered animations

---

## Images

**Hero Section**: Full-width lifestyle image of jewelry being worn or elegant product showcase on neutral background

**Category Cards**: 6 high-quality category images showing representative jewelry pieces

**Products**: Multiple product images per item (square format, 1:1 ratio, clean white/neutral backgrounds)

**About Section**: Workshop/craftsperson image or elegant store interior

**Testimonials**: Use placeholder initials in circular avatars (no stock photos)

---

## Key Design Details
- Rounded corners throughout (rounded-xl to rounded-3xl)
- Subtle shadows (shadow-sm to shadow-lg)
- Ample padding in cards (p-6 to p-8)
- Flowing transitions between sections
- Premium feel through whitespace, not clutter
- Mobile-first responsive: Stack columns, expand to multi-column on larger screens