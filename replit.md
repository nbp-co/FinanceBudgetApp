# Financial Management App

## Overview

This is a comprehensive financial management application built with a modern full-stack architecture. The app allows users to manage their financial accounts, track transactions, analyze spending patterns, and view financial statements. It features a responsive design with mobile-first approach, using a bottom navigation on mobile and a fixed sidebar on desktop.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Navigation Reordering (August 12, 2025)**
- Updated main navigation order to: Calendar, Accounts, Summary, Settings
- Applied consistently across desktop sidebar and mobile bottom navigation
- User preference for logical flow from calendar view to account management to summary analysis

**Calendar Route Implementation (August 19, 2025)**
- Created dedicated `/calendar` route as the main landing page for the financial calendar
- Updated all navigation links to point to `/calendar` instead of root `/`
- Implemented automatic redirect from root to `/calendar` to avoid confusion
- Fixed all internal routing to use proper calendar path structure

**Transaction Interaction Features (August 19, 2025)**
- Implemented clickable transaction details modal with comprehensive information display
- Added editable transaction functionality - clicking transactions opens "Edit Transaction" modal
- Transaction details modal now supports both view and edit modes with form validation
- Added recurring transaction functionality with future transaction generation (12 months)
- Support for multiple recurring frequencies: Daily, Weekly, Bi-weekly, Monthly, and Custom intervals
- Removed "Financial Calendar" header from tab for cleaner interface design
- Added recurring transaction visual indicators with frequency labels
- Made transaction categories optional with "Uncategorized" fallback
- Updated transaction form to use selected calendar date as default
- Removed email display from sidebar for cleaner user interface

**Statements and Debt Payoff Restoration (August 19, 2025)**
- Restored Statements page navigation link in both desktop sidebar and mobile bottom navigation
- Created comprehensive DebtPayoffCalculator component with full functionality
- Added debt payoff strategies: Debt Avalanche (highest interest first) and Debt Snowball (lowest balance first)
- Implemented payoff calculations with extra payment distribution
- Added amortization schedule and interest calculation features
- Integrated debt overview cards showing total debt, account count, and estimated interest savings
- Updated mobile navigation from 4 to 5 columns to accommodate all navigation items
- Added statements tab redirect to full statements page for better organization

**Daily Balance System Implementation (August 19, 2025)**
- Implemented automatic daily balance calculation system triggered by transaction changes
- Added daily balance updates when transactions are created, modified, or deleted
- Created fallback balance calculation in frontend for real-time display when database values missing
- Added automatic balance recalculation for recurring transactions across all future dates
- Implemented balance carryover between months with proper date range handling
- Added API endpoint for bulk daily balance recalculation across all user accounts
- Fixed balance display formatting to show proper currency values instead of $0.00
- Ensured daily balances update immediately after any transaction modification

**Settings Page Simplification (August 19, 2025)**
- Simplified Settings page to contain only a single logout button at the bottom
- Removed complex collapsible sections for profile, security, and notifications
- Clean minimal design with logout button positioned at the bottom of the page
- Improved user experience by focusing on essential account management

**Debt Payoff Calculator Restoration (August 19, 2025)**
- Reverted Debt Payoff Calculator to original simple design with clean user interface
- Restored standalone debt payoff calculator with basic input fields for balance, interest rate, minimum payment, and extra payment
- Simplified statements page to use tabs with basic statements placeholder and debt payoff calculator
- Removed complex multi-account debt management features in favor of simple single-debt calculation
- Calculator now shows comparison between minimum payment only vs. with extra payment scenarios
- Added savings summary showing interest saved and time saved with extra payments

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