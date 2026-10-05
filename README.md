# Park Avenue Menswear

A full-stack e-commerce platform for **Park Avenue Menswear**, built for premium men's fashion retail with customer shopping, authentication, checkout, payments, order management, inventory, alterations, returns, shipping, tax calculation, tracking, and administration.

## Overview

Park Avenue Menswear combines a React/Vite storefront with an Express/TypeScript backend and MongoDB/Mongoose persistence.

The project is designed around a real e-commerce workflow:

- Browse products and categories
- Product variants with size/color selection
- Shopping cart
- Customer registration, login, password reset, and account management
- Multi-step checkout
- US shipping and sales-tax calculation
- Stripe payment processing
- Order creation and order history
- Shipment tracking and fulfillment updates
- Alteration requests and tracking
- Returns and return tracking
- Inventory management
- Admin dashboard
- Customer notifications
- Product import/export utilities
- SEO metadata and XML sitemaps

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Motion
- Lucide React
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB
- JWT authentication
- bcryptjs
- CORS
- dotenv

### Payments & Integrations

- Stripe
- Google Gemini
- Configurable email provider
- Configurable SMS provider
- Configurable WhatsApp provider

### Deployment

- Vercel
- Vercel Node serverless API
- Vercel static build for the React frontend

## Project Structure

```text
park-avenue-mens-wear/
├── api/
│   └── [...path].ts              # Vercel API entry point
├── public/                       # Brand assets, category images and SEO files
├── src/
│   ├── components/
│   │   ├── admin/                # Admin dashboard
│   │   ├── auth/                 # Authentication UI
│   │   ├── cart/                 # Shopping cart
│   │   ├── category/             # Category pages
│   │   ├── checkout/             # Checkout flow
│   │   ├── customer/             # Customer account and orders
│   │   ├── home/                 # Homepage sections
│   │   ├── layout/               # Navigation, footer and shared layout
│   │   ├── pdp/                  # Product detail pages
│   │   ├── search/               # Product search
│   │   ├── shop/                 # Shop and product cards
│   │   ├── tracking/             # Order and alteration tracking
│   │   └── welcome/              # Welcome/loading experience
│   ├── context/                  # Global shop state
│   ├── data/                     # Initial frontend data
│   ├── services/                 # API, shipping and tax services
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Routing, SEO, SKU, import and utility logic
├── server/
│   ├── config/                   # Database and environment configuration
│   ├── controllers/              # Business logic
│   ├── data/                     # Server-side data/ledgers
│   ├── docs/                     # API documentation
│   ├── middleware/               # Authentication, errors and rate limiting
│   ├── models/                   # MongoDB/Mongoose models
│   ├── routes/                   # API routes
│   ├── services/                 # Backend services
│   └── tests/                    # Backend tests
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## Core Features

### Storefront

- Premium men's fashion storefront
- Responsive desktop/mobile design
- Category navigation
- Product search
- Product detail pages
- Product images and brand assets
- Size and color variants
- Automatic variant image selection
- Featured products
- Category showcase
- Campaign and tailoring sections

### Product Categories

The storefront supports categories including:

- Suits
- Dress Suits
- Blazers & Jackets
- Shirts
- Pants
- Outerwear
- Sweaters & Knitwear
- Footwear
- Accessories
- Shorts

### Customer Accounts

Customers can:

- Register
- Log in
- Reset passwords
- Manage account information
- Maintain their shopping cart
- View order history
- Track orders
- Track alteration requests
- Submit and track returns

### Checkout

The checkout flow supports:

1. Contact information
2. Shipping address
3. Shipping method
4. Sales-tax calculation
5. Final order review
6. Stripe payment

Tax and shipping calculations are handled through dedicated services so checkout totals can be validated by the backend.

### Payments

Stripe is integrated for payment processing.

The application supports configuration through:

- Stripe publishable key
- Stripe secret key
- Stripe webhook secret

Never commit real Stripe credentials to the repository.

### Shipping

Shipping logic is implemented as a dedicated service and can support configurable methods and checkout shipping calculations.

### Sales Tax

The application contains a dedicated tax engine for checkout tax calculations, allowing tax behavior to be maintained independently from the storefront UI.

### Orders & Tracking

The order system includes:

- Order creation
- Order status management
- Fulfillment information
- Shipment tracking
- Customer order history
- Order tracking pages
- Return tracking

### Alterations

The platform includes an alteration workflow for managing alteration requests, statuses, and customer tracking.

### Inventory

Inventory functionality includes:

- Product inventory
- Inventory transactions
- Stock management
- Admin inventory views
- Product-related inventory operations

### Admin Dashboard

The admin system provides management areas for:

- Dashboard analytics
- Products
- Inventory
- Customers
- Orders
- Payments
- Alterations
- Returns
- Notifications
- Shipping
- Tax-related operations

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/msehtesham4628/park-avenue-mens-wear.git
cd park-avenue-mens-wear
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the required values for your environment.

At minimum, a production deployment should provide the database connection and secure authentication/payment configuration.

Common variables include:

```env
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=

STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

GEMINI_API_KEY=

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=

SMS_PROVIDER=
SMS_API_KEY=
SMS_FROM=

WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
WHATSAPP_PHONE_ID=
```

Do not commit `.env` or any secret credentials.

## Development

Start the application in development mode:

```bash
npm run dev
```

The development server uses the configured application port and starts through `server.ts`.

## Build

Create a production frontend build:

```bash
npm run build
```

Preview the generated frontend build:

```bash
npm run preview
```

## Type Checking

Run TypeScript checks:

```bash
npm run lint
```

## Tests

Run the project test suite:

```bash
npm test
```

## Production Start

```bash
npm start
```

## Vercel Deployment

The repository includes a `vercel.json` configuration for deploying:

- The React/Vite frontend as a static build
- The API through the Vercel Node runtime
- `/api/*` requests through the API entry point
- Frontend routes through `index.html`

### Deployment steps

1. Import the repository into Vercel.
2. Configure the production environment variables.
3. Make sure MongoDB is accessible from the deployment environment.
4. Configure Stripe webhook settings for the production API.
5. Deploy.
6. Verify storefront, authentication, checkout, payment, and order flows.

## Environment Variables

The complete environment template is available in:

```text
.env.example
```

The application supports both dedicated variable names and selected fallbacks. For example, the backend can use `MONGODB_URI` or `DATABASE_URL`, and Stripe payment configuration can use the dedicated Stripe variables or the generic payment variables.

## Security

Before deploying to production:

- Use strong random secrets for `JWT_SECRET` and `AUTH_SECRET`.
- Never commit `.env` files or API keys.
- Use production Stripe keys only in server-side environment variables.
- Configure Stripe webhooks with the correct signing secret.
- Restrict database access appropriately.
- Keep authentication middleware enabled for protected endpoints.
- Review rate-limiting configuration before production launch.
- Use HTTPS in production.
- Rotate credentials immediately if they are exposed.

## SEO

The project includes SEO utilities and sitemap files under `public/`, including:

- `sitemap.xml`
- `sitemap_index.xml`
- `sitemap_pages.xml`
- `sitemap_products.xml`

The frontend also includes reusable SEO metadata handling.

## Branding

Official Park Avenue Menswear branding assets are stored under `public/`.

Important brand assets include:

```text
public/Park_Avenue_Logo.png
public/park-avenue-logo.svg
```

Use the existing brand assets rather than replacing them with generated logos.

## API

The backend exposes application APIs through the Vercel API entry point:

```text
/api/[...path].ts
```

Backend functionality is organized into controllers, routes, models, middleware, and services.

API documentation and related definitions are maintained under:

```text
server/docs/
```

## Architecture

The application follows a separated frontend/backend architecture:

```text
React + Vite
      │
      ▼
Frontend Services
      │
      ▼
API / Express
      │
      ├── Authentication
      ├── Products
      ├── Cart
      ├── Checkout
      ├── Tax
      ├── Shipping
      ├── Payments
      ├── Orders
      ├── Inventory
      ├── Alterations
      ├── Returns
      └── Notifications
      │
      ▼
MongoDB / Mongoose
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production server |
| `npm run preview` | Preview Vite production build |
| `npm run lint` | Run TypeScript type checking |
| `npm test` | Run project tests |
| `npm run clean` | Remove generated build/server output |

## Project Status

This repository contains the active Park Avenue Menswear e-commerce application and its supporting backend services.

For production changes, preserve the existing architecture and working integrations rather than replacing the application with a new implementation.

## License

This project is proprietary software for Park Avenue Menswear. All rights reserved unless otherwise specified by the project owner.
