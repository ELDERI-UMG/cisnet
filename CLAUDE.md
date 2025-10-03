# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CisNet is an e-commerce platform for software sales built with vanilla JavaScript frontend and Node.js backend. The project is deployed on Vercel with Supabase for database and authentication.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js 18+, Express 5.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth + JWT
- **Hosting**: Vercel (serverless functions)
- **Architecture**: Hexagonal/Clean Architecture (backend)

## Development Commands

### Backend Development
```bash
# Install backend dependencies
cd backend
npm install

# Run backend in development mode with auto-reload
npm run dev

# Run backend in production mode
npm start

# Run database migrations (manual - execute SQL in Supabase dashboard)
npm run migrate

# Seed database with initial data
npm run seed
```

### Root-Level Commands
```bash
# Start production server (runs backend/server.js)
npm start

# Development mode with nodemon
npm run dev

# Vercel build (installs backend dependencies)
npm run vercel-build
```

## Architecture Overview

### Backend Structure (Hexagonal Architecture)

The backend follows a strict hexagonal/clean architecture pattern organized by domain modules:

```
backend/src/
├── auth/                   # Authentication domain
│   ├── application/        # Use cases and DTOs
│   ├── domain/            # Entities, value objects, repository interfaces
│   └── infrastructure/    # Controllers, repositories (Supabase, SQLite), JWT service
├── cart/                  # Shopping cart domain
├── products/              # Product catalog domain
└── shared/                # Shared infrastructure
    └── infrastructure/
        ├── database/      # Database clients (Supabase, SQLite)
        └── middleware/    # Auth middleware, error handlers
```

**Key Architecture Principles:**
- **Domain Layer**: Contains business logic, entities, value objects, and repository interfaces
- **Application Layer**: Contains use cases (business operations) and DTOs
- **Infrastructure Layer**: Contains implementation details (controllers, database repositories, external services)
- **Repository Pattern**: Multiple implementations (SupabaseUserRepository, SqliteUserRepository) implement the same interface
- **Dependency Injection**: Use cases receive repository instances via constructor

### Frontend Structure (MVC Pattern)

```
frontend/
├── controllers/           # Business logic and view rendering
│   ├── AuthController.js
│   ├── ProductController.js
│   ├── CartController.js
│   ├── PaymentConfigController.js
│   ├── PaymentProcessorController.js
│   └── ViewManager.js     # Central routing and view management
├── models/               # Data models and API interactions
│   ├── User.js
│   ├── Product.js
│   └── Cart.js
├── views/                # HTML templates loaded dynamically
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── payment/
├── config/               # Configuration files
│   ├── supabase-config.js
│   ├── media-config.js
│   └── google-auth-config.js
└── assets/               # Static assets (CSS, JS utilities)
```

**Frontend Architecture Notes:**
- ViewManager acts as the central router loading different views
- Controllers handle business logic and DOM manipulation
- Models handle API communication and data management
- No build step required - pure vanilla JavaScript

### Vercel Serverless Architecture

The project uses Vercel's serverless functions:

- **api/index.js**: Main serverless function handling all API routes
- **backend/server.js**: Express server (for local development)
- Both provide identical API endpoints but deployed differently

**Note**: During development, `backend/server.js` is used. In production on Vercel, `api/index.js` handles all requests.

## API Endpoints

All endpoints are prefixed with `/api/`:

**Products**
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=term` - Search products

**Authentication**
- `POST /api/auth/login` - Local login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Logout
- `POST /api/google-auth/google-login` - Google OAuth login
- `POST /api/google-auth/google-register` - Google OAuth registration
- `POST /api/google-auth/user-by-email` - Check user by email

**Cart**
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `DELETE /api/cart` - Clear cart

**Purchases**
- `POST /api/purchases/create-order` - Create purchase order
- `POST /api/purchases/get-download-url` - Get product download URL
- `POST /api/purchases/check-access` - Check user access to product

**Health**
- `GET /api/health` - Health check endpoint

## Environment Variables

Required environment variables in `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
CORS_ORIGIN=https://your-domain.vercel.app
```

## Database Schema

Main tables in Supabase:

- **users**: User accounts (id, name, email, password_hash, provider, created_at)
- **products**: Product catalog (id, name, description, price, category, image_url, featured, active, videoId)
- **cart_items**: Shopping cart items (id, user_id, product_id, quantity)
- **purchases**: Purchase history (id, user_id, total_amount, payment_method, payment_id, status, created_at)
- **purchase_items**: Purchase item details (id, purchase_id, product_id, quantity, price)

## Key Implementation Patterns

### Authentication Flow
1. User logs in via Google OAuth or local credentials
2. Backend validates credentials and generates JWT token
3. Token stored in localStorage and sent in Authorization header
4. AuthMiddleware validates token on protected routes

### Shopping Cart Flow
1. Products added to cart via CartController
2. Cart stored in Supabase cart_items table
3. Checkout creates purchase record and clears cart
4. Download links provided for purchased products

### Google OAuth Integration
- Test users whitelist: `['elderixcopal@gmail.com', 'eixcopala@miumg.edu.gt']`
- Google credentials configured in `config/google-auth-config.js`
- Backend validates Google tokens using `google-auth-library`

### Payment Processing with Recurrente

**Recurrente** is the primary payment gateway integrated for Guatemala.

**Configuration:**
- Public Key: Configured in `frontend/config/recurrente-config.js`
- Secret Key: Stored securely in `backend/.env` (NEVER expose in frontend)
- Test Mode: Currently enabled for testing
- Commission: 4.5% + Q2 per transaction

**Payment Flow:**
1. User selects Recurrente as payment method in checkout
2. Frontend creates checkout session via `POST /api/recurrente/create-session`
3. User is redirected to `checkout-redirect.html` (payment simulator in test mode)
4. After payment, user returns to `recurrente-callback.html`
5. Frontend verifies payment status via `GET /api/recurrente/verify-payment/:sessionId`
6. Products are marked as purchased in localStorage
7. Cart is cleared automatically

**Key Files:**
- `backend/services/RecurrenteService.js` - Backend integration service
- `frontend/config/recurrente-config.js` - Frontend configuration
- `frontend/checkout-redirect.html` - Payment simulator (test mode)
- `frontend/recurrente-callback.html` - Return page after payment
- `frontend/controllers/PaymentProcessorController.js` - Handles Recurrente payments

**API Endpoints:**
- `POST /api/recurrente/create-session` - Create checkout session
- `GET /api/recurrente/verify-payment/:sessionId` - Verify payment status
- `POST /api/recurrente/complete-payment` - Mark payment as complete (simulator)
- `POST /api/recurrente/webhook` - Webhook for Recurrente notifications
- `GET /api/recurrente/config` - Get public configuration

**Test Cards (Test Mode):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Currency:**
- Default: GTQ (Quetzales)
- Conversion rate: 1 USD = 7.8 GTQ (approximate)
- All prices converted automatically from USD to GTQ

**Other Payment Gateways:**
- PaymentConfigController manages configuration for Stripe, PayPal, Neonet (currently disabled)
- PaymentProcessorController handles payment flow for all gateways
- Each gateway has its own form and validation logic

## Development Workflow

1. **Local Development**:
   - Run `cd backend && npm run dev` for backend
   - Use a local web server for frontend (e.g., Live Server)
   - Backend runs on `http://localhost:3000`

2. **Testing Google Auth**:
   - Only whitelisted test users can authenticate
   - Update whitelist in `api/index.js` if needed

3. **Adding New Features**:
   - Backend: Follow hexagonal architecture (domain → application → infrastructure)
   - Frontend: Add controller, model if needed, and view template
   - Update ViewManager for new routes

4. **Database Changes**:
   - Execute SQL migrations directly in Supabase dashboard
   - No migration files in repository currently

## Important Notes

- Frontend has no build step - changes are immediately visible
- Version query parameters (`?v=X`) in script tags are used for cache busting
- Both `backend/server.js` and `api/index.js` must be kept in sync for API routes
- Vercel deployment automatically uses serverless functions from `api/index.js`
- Google Drive integration exists for product downloads (`services/googleDriveService.js`)
- Product videos use YouTube embeds (videoId field in products)
