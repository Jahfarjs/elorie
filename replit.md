# Elorie Elegance - Premium Jewelry E-Commerce

## Overview
Elorie Elegance is a premium jewelry e-commerce website featuring a beautiful, flowing design with gold and cream color scheme. The website is designed to showcase luxury jewelry with an elegant, non-boxy aesthetic.

## Current State
- **Status**: MVP Complete
- **Last Updated**: December 2024

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **Routing**: Wouter
- **State Management**: React Context (Cart), TanStack Query (API data)
- **Styling**: Tailwind CSS with custom gold/cream theme
- **UI Components**: Shadcn/ui

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **Storage**: In-memory storage (user has own backend for production)
- **API**: RESTful endpoints for products, cart, orders

## Key Pages
1. **Home** (`/`) - Hero, categories, trending, best sellers, about, testimonials
2. **Shop** (`/shop`) - Product listing with filters and sorting
3. **Product Detail** (`/product/:id`) - Full product view with add to cart
4. **Cart** (`/cart`) - Shopping cart with quantity controls
5. **Order Tracking** (`/tracking`) - Order status timeline
6. **Profile** (`/profile`) - Account management with tabs

## Design System
- **Primary Font**: Playfair Display (serif) for headings
- **Secondary Font**: Inter (sans-serif) for body
- **Primary Color**: Gold (HSL: 38 75% 50%)
- **Background**: Warm cream (HSL: 40 40% 97%)
- **Dark mode**: Supported via ThemeProvider

## Key Files
- `client/src/index.css` - Theme colors and utilities
- `tailwind.config.ts` - Design tokens and custom colors
- `design_guidelines.md` - Full design documentation
- `client/src/lib/data.ts` - Sample product data
- `client/src/lib/cart-context.tsx` - Cart state management

## User Preferences
- Premium, flowing design (not boxy)
- Gold and cream color scheme
- Elegant serif typography for headings
- Frontend-focused with dummy data

## API Endpoints
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Products by category
- `POST /api/products` - Create product
- `GET/POST /api/cart` - Cart operations
- `GET/POST /api/orders` - Order operations
