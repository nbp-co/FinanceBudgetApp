# Financial Management App

## Overview

This is a comprehensive financial management application built with a modern full-stack architecture. The app allows users to manage their financial accounts, track transactions, analyze spending patterns, and view financial statements. It features a responsive design with mobile-first approach, using a bottom navigation on mobile and a fixed sidebar on desktop.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**UI Improvements & Layout Fixes (August 19, 2025 - Current Session)**
- Fixed chevron arrow directions on debt payoff page collapsible sections (rotate 180° when expanded)
- Updated monthly statements to show all 12 months in 4 rows with 3 months each (JAN-MAR, APR-JUN, JUL-SEP, OCT-DEC)
- Enhanced settings page: replaced collapsible "Account Actions" with simple logout button
- Fixed collapsible arrows to show up arrow when sections are expanded across all pages
- Improved responsive layouts for better mobile and desktop usability

**Navigation Reordering (August 12, 2025)**
- Updated main navigation order to: Calendar, Accounts, Summary, Settings
- Applied consistently across desktop sidebar and mobile bottom navigation
- User preference for logical flow from calendar view to account management to summary analysis

**Budget Page Removal (August 12, 2025)**
- Completely removed standalone Budget page and all associated functionality
- Cleaned up navigation menus (desktop sidebar and mobile bottom nav)
- Removed budget routes from App.tsx
- Application now focuses on core financial account management, statements, and summaries

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a teal/white theme and custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Authentication**: Passport.js with local strategy using bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with JSON responses
- **Request Handling**: Express middleware for logging, JSON parsing, and error handling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations with schema defined in TypeScript
- **Connection**: Neon serverless connection pool with WebSocket support

### Data Models
- **Users**: Authentication and user preferences with timezone support
- **Accounts**: Asset and debt accounts with currency, interest rates, and credit limits
- **Categories**: User-defined transaction categories
- **Transactions**: Income, expense, and transfer transactions
- **Recurring Rules**: Automated recurring transaction rules
- **Monthly Statements**: Account statement tracking
- **Interest Snapshots**: Historical interest rate tracking

### Authentication & Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: bcrypt for password hashing with salt
- **Session Storage**: PostgreSQL-backed session store
- **Route Protection**: Middleware-based route protection for authenticated endpoints

### Development Environment
- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend, backend, and shared schemas
- **Development Server**: Hot module replacement with Vite middleware integration
- **Path Aliases**: Configured aliases for cleaner imports (@/, @shared/)

### UI/UX Design Patterns
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Navigation**: Adaptive navigation (bottom tabs on mobile, sidebar on desktop)
- **Component Architecture**: Modular component structure with reusable UI components
- **Theme System**: CSS custom properties for consistent theming
- **Loading States**: Skeleton loading and spinner components for better UX

## External Dependencies

### Database & Storage
- **Neon Serverless PostgreSQL**: Primary database with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **bcryptjs**: Password hashing and verification

### Frontend Libraries
- **Radix UI**: Headless UI component primitives for accessibility
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Recharts**: Chart and data visualization library
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Utility for component variant styling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint & Prettier**: Code linting and formatting
- **Drizzle Kit**: Database schema management and migrations

### Backend Utilities
- **decimal.js**: Precise decimal arithmetic for financial calculations
- **express-session**: Session management middleware
- **cors**: Cross-origin resource sharing configuration

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment