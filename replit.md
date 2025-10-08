# tecnok - Community Transportation Platform

## Overview

tecnok is a community-based ride-sharing platform connecting passengers with local drivers in the Furnas, Agrícola, and Mata Machado regions of Brazil. This full-stack TypeScript application facilitates safe, affordable transportation through real-time ride matching, driver-passenger coordination, and live status tracking. Its core purpose is to provide a secure and reliable community transport service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, utilizing Vite for fast development and optimized builds. Wouter handles client-side routing, while TanStack Query manages server state with caching and automatic refetching. UI components are built using Shadcn/ui (customizable, copied components) atop Radix UI primitives, styled with Tailwind CSS and CSS variables for dynamic theming (light/dark mode). Polling (3-5 seconds) is used for critical data updates (e.g., pending rides, driver locations) to simulate real-time interactions. Key components include `PassengerPanel`, `DriverPanel`, `MapPanel`, and global navigation.

### Backend

The backend uses Node.js with Express.js and TypeScript. It features a RESTful API with separate modules for passenger (`/api/passenger/*`) and driver (`/api/driver/*`) specific endpoints, while maintaining legacy endpoints for compatibility. Drizzle ORM is used for type-safe database interactions with PostgreSQL (hosted on Neon serverless). Session management is handled by `connect-pg-simple` with PostgreSQL-backed sessions. The architecture is monolithic, serving both API and static files. Rides are manually assigned by drivers.

### Database Design

The PostgreSQL database schema includes `drivers`, `passengers`, `rides`, `route_prices`, `payments`, and `credit_purchases` tables.
- **Drivers:** Stores driver details, including `email` (unique), `password` (bcrypt hashed), `pixKey` (for payment receipt), `termsAccepted` (compliance flag), `isApproved` status (0=pending, 1=approved), `isOnline` status, and `credits` (available ride credits).
- **Passengers:** Stores passenger `id`, `name`, and `phone`.
- **Rides:** Links `passengerId` and `driverId`, stores `origin`, `destination`, `status` (pending, accepted, in_progress, completed, cancelled), and `estimatedPrice`.
- **Route Prices:** Stores predefined `route` strings (e.g., "Origin - Destination") and their corresponding `price`.
- **Payments:** Records platform payments to drivers, including `driverId`, `amount`, `pixKey`, `notes`, and `paidAt` timestamp.
- **Credit Purchases:** Tracks driver credit purchases with `driverId`, `credits` (quantity), `amount` (paid), `status` (pending/confirmed), and `purchasedAt` timestamp.
UUIDs are used as primary keys. Drizzle Kit manages schema migrations.

### Core Features

- **Driver Authentication & Approval:** Drivers register with email/password, which is bcrypt hashed. They must be manually approved (`isApproved = 1`) by an administrator (via web interface or direct SQL) before they can log in. Session-based authentication secures access to the driver panel. Cookie configuration uses `secure: false` and `sameSite: "lax"` to ensure compatibility with PWA installations.
- **Driver Notification System:** Real-time push notifications alert drivers to new ride requests via Browser Notification API (desktop notifications), Web Audio API (sound alerts), and in-app toast messages (Shadcn UI). It detects new rides based on ID comparison and notifies for every new ride, including the first one.
- **Fixed Route Pricing:** Implemented 27 predefined routes with fixed prices, automatically seeded on startup. Price lookup uses normalized string matching (case-insensitive, accent-insensitive). For routes not in the table, uses Uber-style calculation: R$5.00 base + R$2.00/km (default 10km estimate = R$25.00*), displayed with asterisk to indicate estimate.
- **Ride History:** Comprehensive ride history for both passengers and drivers.
- **Ride Completion & Pix Payment:** Drivers can complete rides from the "Corridas em Andamento" section using the "Finalizar Corrida e Liberar Pagamento" button. Upon completion, a Pix payment modal automatically opens displaying ride details and payment information for platform beneficiary Aparecido de Góes (CPF: 07217640881). The modal includes a one-click copy feature for the Pix key and confirmation toast. Active rides are fetched via `/api/driver/rides/active?driverId={id}` with 5-second polling using a custom TanStack Query queryFn.
- **Driver Financial Dashboard:** Real-time financial tracking displays completed rides count, total earnings, platform fee (R$1.00 per ride), and net amount receivable. Drivers register their Pix key during signup and must accept terms including fee structure, withdrawal process, liability disclaimers, and employment status clarification. Financial data is fetched via authenticated `/api/driver/earnings/:driverId` endpoint.
- **Payment History:** Comprehensive payment history showing all received payments with date, amount, Pix key used, and optional notes. Accessed via authenticated `/api/driver/payments/:driverId` endpoint. Payments are recorded by administrators and displayed in reverse chronological order. Empty states guide drivers to contact administration for withdrawal requests.
- **PWA Installation:** Progressive Web App support allows users to install the platform as a standalone mobile app. Service worker (`client/public/sw.js`) uses network-first strategy for HTML navigation (ensures latest updates) and cache-first for static assets. Auto-reload mechanism updates installed apps when new versions deploy. Manual install button appears for browsers that don't show automatic install prompt.
- **Real-Time Interactive Map:** Leaflet.js integration with OpenStreetMap displays online drivers on a live map centered on Furnas/RJ (lat: -22.51, lng: -43.71). Red markers represent online drivers with simulated movement every 3 seconds for demo purposes. Map updates via polling (3-second intervals) to fetch driver locations. No API key required (free, open-source solution). Proper memory management ensures markers are removed when drivers go offline and animation intervals are cleaned up on component unmount.
- **Administrative System:** Secure admin panel at `/admin/login` for managing platform operations. Protected by session-based authentication with `ensureAdmin` middleware on all admin routes (`/api/rides`, `/api/drivers/all`, `/api/driver/pending`, `/api/driver/:id/approve`). Login requires email and password. Admin credentials: Email: `admin@tecnok.com.br` / Senha: `admin123`. Includes driver approval management and payment recording capabilities. Session cookies are httpOnly with `sameSite: lax` and `secure: true` in production. All admin pages feature loading states and authentication guards for proper UX.
- **Prepaid Credit System:** Anti-bypass mechanism requiring drivers to purchase credits before accepting rides. Each ride acceptance deducts 1 credit. Three credit packages available: 10 credits for R$10.00 (R$1.00/ride), 30 credits for R$25.00 (R$0.83/ride, 17% discount), 50 credits for R$40.00 (R$0.80/ride, 20% discount). Drivers cannot accept rides with zero credits - buttons are disabled and API returns 402 error with redirect to purchase modal. Credit purchases are recorded as "pending" and manually confirmed by admins via `/api/admin/credit-purchase/:id/confirm` endpoint, which adds credits to driver balance. Payment is made via Pix to Aparecido de Góes (CPF: 07217640881). Real-time credit balance displayed in driver panel with prominent "Comprar Créditos" button. Purchase history shows all transactions with confirmation status. This prepaid model eliminates platform fee evasion by requiring upfront payment before ride acceptance.

## External Dependencies

- **Database & ORM:**
    - `@neondatabase/serverless`: PostgreSQL driver
    - `drizzle-orm`: Type-safe ORM for PostgreSQL
    - `drizzle-zod`: Schema validation integration
- **Authentication & Sessions:**
    - `connect-pg-simple`: PostgreSQL session store for Express
    - `bcryptjs`: Password hashing
- **Frontend UI & State:**
    - `@radix-ui/*`: Unstyled, accessible UI primitives
    - `@tanstack/react-query`: Server state management
    - `tailwindcss`: Utility-first CSS framework
    - `lucide-react`: Icon library
    - `date-fns`: Date formatting and manipulation
    - `leaflet`: Interactive maps with OpenStreetMap (free, no API key)
- **Validation:**
    - `zod`: Runtime type validation
    - `@hookform/resolvers`: React Hook Form integration with Zod
- **Development Tools:**
    - `Vite`: Fast development server and production builds
    - `tsx`: TypeScript execution for development
    - `esbuild`: JavaScript bundler
    - `@replit/vite-plugin-*`: Replit-specific enhancements
- **Environment Variables:** `DATABASE_URL` (PostgreSQL connection), `SESSION_SECRET` (mandatory for session encryption).