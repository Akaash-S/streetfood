# Street Food Ecosystem Platform

## Overview

This is a simplified Street Food Ecosystem Platform that connects street food vendors, delivery agents, and distributors in a direct supply chain. The application provides role-based dashboards for each of the three user types and facilitates wholesale ordering, product management, and delivery coordination without intermediary retail shops.

## Recent Changes
- **2025-07-27**: ✅ **CRITICAL AUTHENTICATION FIXES COMPLETE**: Resolved all token handling issues across all three roles
  - Fixed critical backend token validation to handle null, undefined, and invalid token strings
  - Enhanced AuthContext to store Firebase tokens in localStorage for consistent access
  - Standardized authentication across all distributor, vendor, and delivery agent components
  - Fixed all API calls to use localStorage token instead of mixed authentication approaches
  - Updated all queries and mutations in distributor dashboard to use consistent token handling
  - Fixed vendor components (ShopBrowser, RecentOrders, OrderHistory, ProductBrowser, VendorProfile) authentication
  - Delivery agent components now properly use Firebase tokens from localStorage
  - All three roles now have working authentication without "null" token errors
- **2025-07-27**: ✅ **AUTHENTICATION & ORDER SYSTEM COMPLETE**: Fixed login redirection and vendor order flow
  - Fixed Firebase authentication redirection issues - users now properly redirect to dashboards
  - Resolved user database synchronization between Firebase and PostgreSQL
  - Enhanced login form to handle existing Firebase users missing from database
  - Implemented complete vendor-to-distributor order system with order items tracking
  - Added /api/auth/login endpoint for proper authentication flow
  - Users can now successfully login with existing credentials and access their dashboards
- **2025-07-27**: ✅ **DYNAMIC VENDOR SYSTEM**: Updated street vendor role to be fully dynamic
  - Vendors now browse actual registered distributors instead of fixed shops
  - Distributors show their company names in vendor's browse distributors dashboard
  - Added backend routes for vendors to browse distributors and their products
  - Fixed product price display issue (converting string to number for .toFixed())
  - Enhanced cart and order system to work with distributor-based ordering
  - Updated all UI labels from "Browse Shops" to "Browse Distributors"
  - Firebase authentication properly configured for email/password login and registration
- **2025-07-27**: ✅ **CLEAN ARCHITECTURE**: Removed all mock/demo data and simplified to three-role system
  - Removed retail shop owner role and all related functionality
  - Updated system to support only: street_vendor, delivery_agent, distributor
  - Cleaned database of all demo/mock data
  - Updated frontend registration and authentication for three roles only
  - Changed distributor field from shopName to companyName for better clarity
- **2025-07-27**: ✅ **MAJOR MIGRATION**: Completely removed Supabase and implemented Neon PostgreSQL
  - Replaced file-based storage (PersistentStorage) with DatabaseStorage using Neon PostgreSQL
  - Migrated all data operations to use Drizzle ORM with proper database relationships
  - Fixed foreign key relationships between users and wholesale products
  - Successfully seeded database with sample data and verified all API endpoints
  - Removed all Supabase references and configuration files
- **2025-07-26**: Added company name capture in registration form for distributors
- **2025-07-26**: Updated registration form to conditionally show company name field when distributor role is selected
- **2025-07-26**: Enhanced distributor dashboard to prominently display company name in header
- **2025-07-26**: Implemented automatic assignment of shop names to existing distributors
- **2025-07-26**: Updated distributor role to include shop name "Premium Food Distributors Inc."
- **2025-07-26**: Enhanced landing page to display distributor role with company name in supported roles
- **2025-07-26**: Added shopName field to user schema for distributors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for end-to-end type safety
- **Authentication**: Firebase Authentication with Firebase Admin SDK for token verification
- **API Design**: RESTful API with proper error handling and logging middleware

### Database Architecture
- **Database**: Neon PostgreSQL (fully migrated from Supabase)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)
- **Connection**: Uses connection pooling via @neondatabase/serverless
- **Storage**: DatabaseStorage class implementing full CRUD operations for all entities

## Key Components

### Authentication System
- Firebase Authentication handles user registration and login
- Custom middleware verifies Firebase tokens on protected routes
- Role-based access control with three user types: street_vendor, delivery_agent, distributor
- Session management integrated with React context

### Database Schema
The system uses a simplified relational database with the following core entities:
- **Users**: Stores user profiles with Firebase UID integration and three-role assignment (street_vendor, delivery_agent, distributor)
- **Wholesale Products**: Product catalog managed by distributors for bulk sales
- **Vendor Orders**: Orders placed by street vendors to distributors for wholesale products
- **Vendor Order Items**: Detailed line items for vendor orders
- **Delivery Assignments**: Delivery coordination between delivery agents and vendor orders

### UI Component System
- Built on Radix UI primitives for accessibility
- Comprehensive component library with consistent styling
- Responsive design with mobile-first approach
- Dark mode support through CSS variables

### Role-Based Dashboards
- **Street Vendor Dashboard**: Browse wholesale products, place orders directly from distributors, track deliveries
- **Delivery Agent Dashboard**: View available delivery assignments, accept deliveries, manage delivery status and earnings
- **Distributor Dashboard**: Complete wholesale management system with product CRUD, vendor order processing, delivery scheduling, inventory tracking, and real-time status updates

## Data Flow

### User Registration Flow
1. User registers through Firebase Authentication
2. Frontend receives Firebase user token
3. Token sent to backend for verification
4. User profile created in PostgreSQL database with role assignment
5. User redirected to appropriate role-based dashboard

### Order Management Flow
1. Vendor browses products from retail shops
2. Vendor adds items to cart and places order
3. Order created in database with "pending" status
4. Shop owner receives order notification
5. Shop owner updates order status through various stages
6. Delivery agent can view and accept delivery requests
7. Real-time status updates provided throughout the process

### Authentication Flow
1. Firebase handles user authentication
2. Backend validates Firebase tokens using Admin SDK
3. User data retrieved from database using Firebase UID
4. Role-based route protection on both frontend and backend

## External Dependencies

### Frontend Dependencies
- **Firebase SDK**: Client-side authentication
- **TanStack React Query**: Server state management and caching
- **Framer Motion**: Animation library for enhanced UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### Backend Dependencies
- **Firebase Admin SDK**: Server-side authentication and user management
- **Drizzle ORM**: Type-safe database operations
- **Express.js**: Web application framework
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and introspection tools

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Express server with automatic restart via tsx
- Environment variables for Firebase and database configuration
- Replit-specific plugins for enhanced development experience

### Production Build
- Frontend built with Vite and optimized for production
- Backend bundled with ESBuild for Node.js deployment
- Static assets served from Express server
- Database migrations handled via Drizzle Kit push command

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `VITE_FIREBASE_API_KEY`: Firebase client configuration
- `VITE_FIREBASE_APP_ID`: Firebase application ID

### Database Deployment
- Schema defined in shared/schema.ts for consistency
- Migrations managed through Drizzle Kit
- PostgreSQL dialect with UUID primary keys
- Automatic timestamp management for audit trails

The architecture prioritizes type safety, scalability, and maintainability while providing a solid foundation for the street food ecosystem platform's core functionality.