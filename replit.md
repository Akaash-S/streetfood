# Street Food Ecosystem Platform

## Overview

This is a comprehensive Street Food Ecosystem Platform that connects street food vendors, retail shop owners, delivery agents, and distributors in a streamlined supply chain. The application provides role-based dashboards for each user type and facilitates order management, product browsing, and delivery coordination.

## Recent Changes
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
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Uses connection pooling via @neondatabase/serverless

## Key Components

### Authentication System
- Firebase Authentication handles user registration and login
- Custom middleware verifies Firebase tokens on protected routes
- Role-based access control with three user types: vendor, shop_owner, delivery_agent
- Session management integrated with React context

### Database Schema
The system uses a relational database with the following core entities:
- **Users**: Stores user profiles with Firebase UID integration and role assignment
- **Retail Shops**: Shop information linked to shop owners
- **Products**: Product catalog with inventory management
- **Orders**: Order management with status tracking
- **Order Items**: Detailed order line items
- **Ratings**: User feedback system
- **Delivery Requests**: Delivery coordination between agents and orders

### UI Component System
- Built on Radix UI primitives for accessibility
- Comprehensive component library with consistent styling
- Responsive design with mobile-first approach
- Dark mode support through CSS variables

### Role-Based Dashboards
- **Vendor Dashboard**: Product browsing, order placement, order tracking
- **Shop Owner Dashboard**: Order management, inventory updates, customer communication
- **Delivery Agent Dashboard**: Available deliveries, route management, earnings tracking
- **Distributor Dashboard**: Complete wholesale management system with product CRUD, bulk order processing, delivery scheduling, inventory tracking, and real-time status updates

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