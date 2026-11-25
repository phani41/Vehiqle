<h1 align="center">
  🚗 Vehiqle — AI-Powered Car Marketplace
</h1>

<p align="center">
  A modern, full-stack, AI-powered automotive marketplace platform built with Next.js 15, React 19, Prisma, PostgreSQL, Clerk Auth, and Local Ollama AI.
</p>

<p align="center">
  <a href="https://github.com/Saiphanikum/Vehiqle/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge">
  </a>
  <a href="https://nextjs.org/">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15_(Turbopack)-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  </a>
  <a href="https://react.dev/">
    <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  </a>
  <a href="https://www.prisma.io/">
    <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  </a>
  <a href="https://ollama.com/">
    <img alt="Ollama" src="https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?style=for-the-badge&logo=ollama&logoColor=white">
  </a>
  <a href="https://clerk.com/">
    <img alt="Clerk" src="https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white">
  </a>
</p>

---

## 🌟 Overview

**Vehiqle** is an intelligent car marketplace that connects car buyers with dealerships. It leverages **local, offline AI (Ollama)** for visual car identification, search, and automated listing details, while providing a fast, responsive user experience backed by Next.js 15 Server Components, streaming SSR, and Prisma ORM.

---

## ✨ Features

### 🔍 AI-Powered Visual Search
- **Image-to-Car Search**: Upload any car photo on the homepage to find visually matching vehicles by make, body type, and color.
- **AI Listing Auto-Fill**: Dealership admins can upload an image of a car, and local AI automatically extracts make, model, year, body type, transmission, fuel type, and generated description.
- **100% Offline & Private**: Powered by **local Ollama** vision models (e.g., `llama3.2-vision`, `llava`) — zero external API keys required, zero latency, and no data leaving your machine.

### 🚘 Marketplace & Browsing
- **Smart Filtering**: Filter by make, body type, fuel type, transmission, and custom price range slider.
- **Instant Sorting**: Sort by newest listings, price ascending, or price descending.
- **Server-Side Rendered (SSR)**: Instant first paint with parallel server fetching and client hydration.
- **Optimized Image Loading**: Next.js AVIF/WebP image optimization with responsive breakpoints and caching.

### 📑 Vehicle Details & Financing
- **Comprehensive Specs**: High-res gallery, pricing, mileage, transmission, fuel type, and dealership location.
- **Interactive EMI Loan Calculator**: Real-time monthly loan payment estimation based on down payment, interest rate, and tenure.

### 📅 Online Test Drive Scheduling
- **Instant Booking**: Pick preferred date and time slots respecting actual dealership working hours.
- **Reservation Tracking**: Real-time status tracking for users (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).

### 🛡️ Admin Portal
- **Dashboard Metrics**: Inventory summary (available, sold, unavailable, featured) and test-drive conversion rates.
- **Vehicle Inventory Management**: Add new cars (with AI photo extraction), edit listing status, and delete vehicles.
- **Test Drive Management**: View all customer reservations, filter by status, search, and confirm or cancel appointments.
- **Dealership Settings**: Manage weekly opening hours and operational schedules.
- **User & Role Administration**: Promote or demote admins, and delete accounts directly from the admin panel.

### 🔒 Complete Account Deletion & Privacy
- **Permanent Account Wipe**: When an account is deleted (by user, admin, or via Clerk webhook), all user data, saved cars, and test drive reservations are completely and irreversibly purged from PostgreSQL and Clerk in an atomic transaction.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15.5](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Database & ORM** | PostgreSQL + [Prisma ORM 6](https://www.prisma.io/) |
| **Authentication** | [Clerk Authentication](https://clerk.com/) |
| **Local AI** | [Ollama](https://ollama.com/) (`llama3.2-vision` / `llava`) |
| **Cloud Storage** | [Supabase Storage](https://supabase.com/storage) (Vehicle images) |
| **Security & Rate Limiting** | [Arcjet](https://arcjet.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or higher, v20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database
- [Ollama](https://ollama.com/) installed locally
- [Clerk](https://clerk.com/) account for authentication
- [Supabase](https://supabase.com/) project for media storage

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/phani41/Vehiqle.git
cd Vehiqle
npm install
```

### 2. Set Up Environment Variables

Create a `.env` (or `.env.local`) file in the root directory:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/vehiqle?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Supabase Storage (Vehicle Images)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Arcjet Security
ARCJET_KEY="ajkey_..."

# Local Ollama AI (Offline)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2-vision"
```

### 3. Setup Local AI (Ollama)

Make sure Ollama is running and download a vision model:

```bash
# Start Ollama
ollama serve

# Pull a vision-capable model (in another terminal)
ollama pull llama3.2-vision
# OR
ollama pull llava
```

### 4. Database Setup

Generate Prisma Client and push schema to PostgreSQL:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application

```bash
# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Vehiqle/
├── actions/                  # Next.js Server Actions
│   ├── admin.js              # Admin metrics, reservations & permissions
│   ├── car-listing.js        # Marketplace queries, filters & caching
│   ├── cars.js               # Car CRUD & Ollama image extraction
│   ├── home.js               # Featured cars & Ollama visual search
│   └── settings.js           # Dealership hours & user account management
├── app/
│   ├── (admin)/admin/        # Protected admin routes & dashboards
│   │   ├── cars/             # Car inventory management
│   │   ├── settings/         # Dealership settings & user management
│   │   └── test-drives/      # Test drive booking operations
│   ├── (auth)/               # Clerk authentication pages (sign-in, sign-up)
│   ├── (main)/
│   │   ├── cars/             # Marketplace listing & detail pages
│   │   ├── reservations/     # User test-drive bookings
│   │   ├── saved-cars/       # User favorited vehicles
│   │   └── test-drive/[id]/  # Booking form page
│   ├── api/
│   │   └── webhooks/clerk/   # Clerk user.deleted webhook handler
│   └── page.jsx              # Landing page with hero & AI visual search
├── components/               # Reusable UI components & dialogs
│   ├── ui/                   # Shadcn UI primitives & custom controls
│   └── car-card.jsx          # Vehicle listing card with hover prefetch
├── hooks/                    # Custom React hooks (useFetch, etc.)
├── lib/                      # Core helpers & singletons
│   ├── checkUser.js          # Fast DB-first user session check
│   ├── helper.js             # Currency/number formatters & EMI math
│   ├── ollama.js             # Local Ollama AI client
│   ├── prisma.js             # Prisma singleton instance
│   └── supabase.js           # Supabase client configurations
├── prisma/
│   └── schema.prisma         # PostgreSQL models & cascade relations
└── middleware.js             # Route protection & Clerk auth verification
```

---

## ⚡ Performance Optimizations

- **Instant Hover Prefetching**: Internal navigation uses `<Link prefetch>` to preload routes before clicks.
- **Zero Blank Screens**: Dedicated `loading.jsx` skeletons for all route segments.
- **Parallel Query Execution**: Server-side queries run concurrently via `Promise.all`.
- **Targeted Field Selection**: Selective SQL projection (`select: { ... }`) prevents over-fetching heavy fields.
- **Request & Tag Caching**: Static filters and featured listings cached with `unstable_cache` (60s TTL) and invalidated upon updates.
- **Debounced Inputs**: Search bars include 300ms debouncing to prevent excessive queries per keystroke.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///d:/car/Vehiqle/LICENSE) for more information.

---

## 👤 Author

- **Saiphanikumar** - [GitHub](https://github.com/phani41)
- **Live Deployment**: [vehiqle-topaz.vercel.app](https://vehiqle-topaz.vercel.app/)
