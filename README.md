# ✨ GlowBook — Beauty, On Your Time

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-salon--booking--application.vercel.app-e11d48?style=for-the-badge&logo=vercel&logoColor=white)](https://salon-booking-application.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**An enterprise-grade, distributed microservices appointment booking and salon management platform.**  
Designed for ultra-low latency, zero double-booking concurrency, seamless payment gateways, and asynchronous event-driven notifications.

[Explore Live Demo](https://salon-booking-application.vercel.app/) • [Architecture Overview](#-system-architecture) • [Engineering Highlights](#-core-engineering-highlights) • [Quickstart](#-getting-started)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features & User Flows](#-key-features--user-flows)
  - [Customer Experience](#1-customer-experience)
  - [Salon Owner & Staff Experience](#2-salon-owner--staff-experience)
- [System Architecture](#-system-architecture)
  - [High-Level Topology](#high-level-topology)
  - [Event-Driven Flow (RabbitMQ Choreography)](#event-driven-flow-rabbitmq-choreography)
- [Microservices Breakdown](#-microservices-breakdown)
- [Core Engineering Highlights](#-core-engineering-highlights)
  - [1. Redis Distributed Locking for Concurrency](#1-redis-distributed-locking-for-concurrency)
  - [2. Payment Idempotency & Cryptographic Verification](#2-payment-idempotency--cryptographic-verification)
  - [3. Asymmetric RS256 JWT Security & Gateway Decoration](#3-asymmetric-rs256-jwt-security--gateway-decoration)
  - [4. Dynamic Real-Time Slot Engine](#4-dynamic-real-time-slot-engine)
  - [5. Database-per-Service & Redis Multi-Tier Caching](#5-database-per-service--redis-multi-tier-caching)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: One-Command Docker Compose (Recommended)](#option-a-one-command-docker-compose-recommended)
  - [Option B: Local Development Setup](#option-b-local-development-setup)
- [Environment Variables Reference](#-environment-variables-reference)
- [Production Deployment](#-production-deployment)
- [License & Acknowledgements](#-license)

---

## 🌟 Overview

**GlowBook** bridges the gap between premium beauty salons and clients seeking hassle-free appointments. Traditional salon management suffers from high no-show rates, manual phone scheduling errors, double-booking conflicts during peak hours, and disjointed offline payment tracking.

GlowBook solves this by implementing a modern **distributed microservices architecture**:
- **Front-facing Client:** Built with **React 19**, **Tailwind CSS**, and **Redux Toolkit** providing a responsive, glassmorphic UI with light/dark theme toggle and interactive booking wizard.
- **API Gateway:** Centralized ingress proxy managing rate limits, CORS policies, security headers, and RS256 token verification.
- **Decoupled Microservices:** Dedicated services for **Auth**, **Salon Operations**, **Scheduling/Bookings**, **Payments**, and **Notifications**.
- **Asynchronous Messaging:** **RabbitMQ (AMQP)** drives resilient pub/sub queues across service boundaries.
- **Ultra-Fast Cache & Locks:** **Redis 7** provides high-speed response caching, session management, and distributed mutexes.
- **Financial Compliance:** **Razorpay** integration with HMAC-SHA256 signature verification and strict idempotency controls.

---

## 🚀 Key Features & User Flows

### 1. Customer Experience

```mermaid
graph LR
    A[Discover Salons] --> B[Select Treatments & Staff]
    B --> C[Real-Time Slot Engine]
    C --> D[Review Order & Checkout]
    D --> E[Razorpay Payment / Pay at Salon]
    E --> F[Instant Confirmation & Email Receipt]
```

- **Smart Salon Discovery:** Search salons by name, address, category, or city with cached instant search results.
- **Interactive Multi-Step Booking Wizard:**
  - **Step 1 — Treatments:** Select one or multiple services with live calculation of cumulative duration and bill total.
  - **Step 2 — Stylist Preference:** Choose a specific specialist or select *"Any Available Stylist"*.
  - **Step 3 — Date & Slot Selection:** Dynamic date picker (up to 14 days ahead) filtering out closed business days. Generates dynamic slots that automatically prune past hours and colliding appointments.
- **Frictionless Checkout:** Seamless guest-to-account conversion with inline authentication modals preserving cart state.
- **Flexible Payments:** Pay instantly via **Razorpay (UPI, Credit/Debit Cards, NetBanking)** or opt for **Pay at Salon**.
- **Customer Portal:** View upcoming and past reservations, track live statuses (`Pending`, `Confirmed`, `Completed`, `Cancelled`), and cancel eligible bookings.
- **Automated Email Notifications:** Styled, responsive HTML email confirmations sent via **Resend** with calendar dates, stylist details, and booking codes.

---

### 2. Salon Owner & Staff Experience

```mermaid
graph LR
    A[Owner Registration] --> B[Salon Profile & Business Hours]
    B --> C[Services & Staff Catalog]
    C --> D[Live Bookings Management]
    D --> E[Revenue & Transaction Analytics]
```

- **Owner Onboarding & Profile Completion:** Guided setup wizard calculating profile completion score (basic information, weekly open/close hours, amenities like AC, Wi-Fi, Parking).
- **Service Catalog Management:** Create, update, or archive treatments with pricing, categories, and duration in minutes.
- **Staff Roster Management:** Add stylists and specialists, assign specific services, and manage availability.
- **Live Appointment Command Center:**
  - Real-time booking dashboard categorized by status: `Pending`, `Confirmed`, `Completed`, `Cancelled`.
  - Actionable status updates with automatic notifications dispatched to clients.
  - Search and filter by booking code (`BK-XXXXX`), customer name, or date.
- **Financial & Revenue Analytics:**
  - Metrics tracking: Today's Revenue, Upcoming Bookings, Total Revenue, Completed Appointments.
  - Comprehensive transaction ledger recording Razorpay Order IDs, Payment IDs, timestamps, and customer payment methods.

---

## 🏛️ System Architecture

### High-Level Topology

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (Vercel)"]
        SPA["React 19 SPA + Redux Toolkit + Vite"]
    end

    subgraph Ingress["Ingress / Gateway Layer"]
        GW["API Gateway (Port 5000)\nExpress + Helmet + RateLimiter + RS256 Auth"]
    end

    subgraph Services["Microservices Layer (Docker / Render)"]
        AuthSvc["Auth Service (Port 5001)\nRS256 JWT, OTP, RBAC"]
        SalonSvc["Salon Service (Port 5002)\nSalons, Services, Staff, Cloudinary"]
        BookingSvc["Booking Service (Port 5003)\nSlot Engine, Redis Locks, Schedule"]
        PaymentSvc["Payment Service (Port 5004)\nRazorpay, Idempotency, Verification"]
        NotifySvc["Notification Service (Port 5005)\nRabbitMQ Worker, Resend HTML Emails"]
    end

    subgraph Messaging["Message Broker & Cache"]
        RMQ[("RabbitMQ 3\nAMQP 0-9-1 Exchange / Queues")]
        REDIS[("Redis 7\nCaching + Distributed Locks")]
    end

    subgraph Databases["Database-per-Service (MongoDB Atlas / Local)"]
        DB_Auth[("salon_auth_db")]
        DB_Salon[("salon_db")]
        DB_Booking[("salon_booking_db")]
        DB_Payment[("salon_payment_db")]
    end

    subgraph External["External Services"]
        RZP["Razorpay Payment Gateway"]
        RESEND["Resend Email API"]
        CLDN["Cloudinary Media Storage"]
    end

    %% Client traffic
    SPA -->|"HTTP / REST / Cookies"| GW

    %% Gateway Routing
    GW -->|"/api/auth"| AuthSvc
    GW -->|"/api/salon"| SalonSvc
    GW -->|"/api/bookings"| BookingSvc
    GW -->|"/api/payments"| PaymentSvc

    %% Internal Communication
    BookingSvc -->|"Sync HTTP (Business Hours)"| SalonSvc
    BookingSvc <-->|"Distributed Lock"| REDIS
    SalonSvc <-->|"Cache Read/Write/Invalidate"| REDIS
    AuthSvc <-->|"Token Blacklist & Rate Limit"| REDIS

    %% Event Driven Messaging
    AuthSvc -.->|"Publish auth.events"| RMQ
    BookingSvc -.->|"Publish booking.events"| RMQ
    PaymentSvc -.->|"Publish payment.events"| RMQ

    RMQ -.->|"Consume payment.events"| BookingSvc
    RMQ -.->|"Consume auth.events & booking.events"| NotifySvc

    %% Service to DB
    AuthSvc --- DB_Auth
    SalonSvc --- DB_Salon
    BookingSvc --- DB_Booking
    PaymentSvc --- DB_Payment

    %% External APIs
    PaymentSvc <-->|"Order / Signature"| RZP
    NotifySvc -->|"Send Emails"| RESEND
    SalonSvc -->|"Image Upload"| CLDN
```

---

### Event-Driven Flow (RabbitMQ Choreography)

The following sequence illustrates how **GlowBook** achieves eventual consistency and asynchronous processing during online checkout:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Gateway as API Gateway
    participant Payment as Payment Service
    participant Razorpay as Razorpay API
    participant Rabbit as RabbitMQ (AMQP)
    participant Booking as Booking Service
    participant Notify as Notification Service
    participant Email as Resend Email Service

    Customer->>Gateway: POST /api/payments/create-order (with Idempotency-Key)
    Gateway->>Payment: Proxy Request (Injected User Headers)
    Payment->>Payment: Validate Idempotency in DB
    Payment->>Razorpay: razorpay.orders.create({ amount, currency: 'INR', receipt })
    Razorpay-->>Payment: Order Created (order_id)
    Payment-->>Customer: Return order_id & keyId

    Customer->>Razorpay: Complete Checkout Modal (Card / UPI)
    Razorpay-->>Customer: Returns { razorpay_payment_id, razorpay_signature }

    Customer->>Gateway: POST /api/payments/verify
    Gateway->>Payment: Proxy Verification
    Payment->>Payment: Compute HMAC-SHA256 & Verify Signature
    Payment->>Payment: Mark Payment Transaction as PAID

    Note over Payment,Rabbit: Asynchronous Event Publishing
    Payment->>Rabbit: Publish "payment.verified" (payment.events)
    Payment-->>Customer: HTTP 200 { verified: true }

    Rabbit->>Booking: Deliver "payment.verified" event
    Booking->>Booking: Update Booking status = "Confirmed", paymentStatus = "Paid"
    Booking->>Rabbit: Publish "booking.confirmed" (booking.events)

    Rabbit->>Notify: Deliver "booking.confirmed" event
    Notify->>Email: Render HTML template & dispatch via Resend
    Email-->>Customer: Deliver Booking Confirmation Email
```

---

## 🧩 Microservices Breakdown

| Service | Port | Database | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`api-gateway`** | `5000` | — | Centralized reverse-proxy, RS256 token verification, downstream user header injection (`x-user-id`, `x-user-role`, `x-user-email`), global rate-limiting, and CORS handling. |
| **`auth-service`** | `5001` | `salon_auth_db` | User identity lifecycle, bcrypt hashing, RS256 token generation, refresh token rotation, email OTP verification, password reset, and RBAC enforcement (`customer`, `owner`, `staff`, `admin`). |
| **`salon-service`** | `5002` | `salon_db` | Salon metadata, operating hours, geolocation, amenities, services catalog, staff roster, Cloudinary media uploads, and Redis multi-tier caching with pattern invalidation. |
| **`booking-service`** | `5003` | `salon_booking_db` | Real-time appointment scheduling, date/slot availability generation, Redis distributed locking to prevent collision, booking lifecycle management, and owner revenue calculations. |
| **`payment-service`** | `5004` | `salon_payment_db` | Razorpay order generation, cryptographic HMAC-SHA256 signature verification, idempotency control against double-billing, and transaction audit trails. |
| **`notification-service`**| `5005` | — | Background queue worker consuming AMQP events (`auth.events`, `booking.events`), compiling responsive HTML email templates, and dispatching via Resend. |

---

## 🔬 Core Engineering Highlights

### 1. Redis Distributed Locking for Concurrency
In appointment systems, two users selecting the exact same slot concurrently causes race conditions resulting in double bookings. GlowBook employs a **Redis distributed mutex** pattern before writing bookings:

```typescript
// server/apps/booking-service/src/modules/booking/booking.service.ts
const lockKey = ["booking:lock", data.salonId, data.staffName, data.date, data.time].join(":");
const lockValue = await acquireLock(lockKey, 15); // 15s TTL

if (!lockValue) {
  throw new AppError("This time slot is currently being booked. Please try again.", 409);
}

try {
  // Check existing confirmed/pending bookings
  const existing = await BookingModel.findOne({ ... });
  if (existing) throw new AppError("This time slot is already booked.", 409);

  // Atomically create booking
  return await BookingModel.create({ ... });
} finally {
  await releaseLock(lockKey, lockValue); // Safe release
}
```

### 2. Payment Idempotency & Cryptographic Verification
To guard against network retries causing duplicate orders, `payment-service` implements an **Idempotency Key Protocol**:
- Clients generate a unique UUID per transaction attempt passed in headers.
- If an existing key with status `COMPLETED` is found, the cached order is returned immediately without charging twice.
- If `PROCESSING`, concurrent attempts receive `409 Conflict`.
- Verification requires an exact HMAC-SHA256 hash match against `order_id|payment_id` signed by the Razorpay secret before updating state.

### 3. Asymmetric RS256 JWT Security & Gateway Decoration
Instead of standard symmetric secrets (HS256) shared across all microservices, GlowBook uses **RSA 2048-bit Asymmetric Keys (RS256)**:
- **Private Key:** Maintained strictly inside `auth-service` to sign access and refresh tokens.
- **Public Key:** Shared with `api-gateway` and downstream services to verify authenticity without ability to forge signatures.
- **Header Decoration:** Once verified, `api-gateway` strips client headers and injects trusted identity headers:
  ```http
  x-user-id: 65e8a...
  x-user-role: owner
  x-user-email: owner@example.com
  ```

### 4. Dynamic Real-Time Slot Engine
Slots are calculated dynamically on-the-fly rather than statically populated:
1. Calls `salon-service` for salon business hours for that specific day of the week.
2. Checks if salon is marked `isOpen`.
3. Slices operating window (e.g., 09:00 to 20:00) into increments matching requested duration.
4. Queries existing `Pending` and `Confirmed` reservations for collision overlap (`current < bookingEnd && slotEnd > bookingStart`).
5. Prunes past slots if requested date is today.

### 5. Database-per-Service & Redis Multi-Tier Caching
- **Isolated Datastores:** Each microservice owns its own MongoDB database, guaranteeing that failures in one domain cannot compromise others.
- **Cache Invalidation:** High-frequency read queries (`salons:all:*` and `salon:<id>`) are cached in Redis with automated pattern-based invalidation (`redis.scan` + `redis.del`) executed on any create, update, or delete mutation.

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 19, TypeScript
- **Bundler & Tooling:** Vite 6, ESLint
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`), React-Redux
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Form Management:** Formik, Yup, Zod
- **Client Networking:** Axios (with cookie credentials & error interceptors)
- **Payments:** Razorpay Checkout JS SDK

### Backend & Microservices
- **Runtime & Language:** Node.js v20+, TypeScript 5.8
- **Web Framework:** Express.js 5
- **Reverse Proxy:** `express-http-proxy`
- **Security:** Helmet, CORS, Rate Limiters, Bcrypt, RS256 JWT (`jsonwebtoken`)
- **Validation:** Zod Schema Validation Middlewares
- **Logging:** Winston Logger, Morgan

### Infrastructure & Messaging
- **Databases:** MongoDB (Mongoose ODM)
- **Cache & In-Memory Store:** Redis 7 (ioredis)
- **Message Broker:** RabbitMQ 3 (AMQP 0-9-1 via `amqplib`)
- **Email Delivery:** Resend API / SMTP Nodemailer
- **Media Assets:** Cloudinary
- **Containerization:** Docker, Multi-Stage Dockerfiles, Docker Compose

---

## 📁 Repository Structure

```
salon-booking-application/
├── client/                               # Frontend Single Page Application (React 19 + Vite)
│   ├── public/                           # Static public assets
│   ├── src/
│   │   ├── api/                          # Axios API instances & service endpoints
│   │   ├── components/                   # Reusable UI & domain components
│   │   │   ├── booking/                  # Booking wizard, steps, slot pickers
│   │   │   ├── bookings/                 # Tables, details modal, cancel modal
│   │   │   ├── common/                   # Header, footer, loader, theme toggle
│   │   │   ├── payments/                 # Transaction modals & tables
│   │   │   └── salon/                    # Salon cards, creation form, reviews
│   │   ├── layouts/                      # Main layout, Auth layout
│   │   ├── pages/                        # View pages (Home, SalonDetails, Customer, Owner)
│   │   │   ├── customer/                 # BookingWizard, Checkout, Success, Failure
│   │   │   └── owner/                    # Dashboard, Bookings, Services, Staff, Payments
│   │   ├── redux/                        # Redux store, hooks, and feature slices
│   │   ├── routes/                       # AppRoutes, RoleRoute, ProtectedRoute
│   │   └── utils/                        # Formatting helpers, response handlers
│   ├── Dockerfile                        # Nginx production build Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── server/                               # Monorepo Backend Microservices
│   ├── apps/
│   │   ├── api-gateway/                  # Reverse Proxy, RS256 JWT, Rate Limiting (Port 5000)
│   │   ├── auth-service/                 # Identity, OTP, RS256 Auth, Passwords (Port 5001)
│   │   ├── salon-service/                # Salons, Services, Staff, Cloudinary (Port 5002)
│   │   ├── booking-service/              # Scheduling, Slot Engine, Redis Locks (Port 5003)
│   │   ├── payment-service/              # Razorpay, Idempotency, HMAC SHA-256 (Port 5004)
│   │   └── notification-service/         # RabbitMQ Consumer, Resend Emails (Port 5005)
│   ├── docker-compose.yml                # Multi-container local orchestration
│   ├── package.json                      # Workspaces root & concurrently scripts
│   └── tsconfig.base.json                # Shared TypeScript compiler options
│
├── render.yaml                           # Infrastructure-as-Code for Render Cloud
└── README.md                             # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
Make sure you have the following installed locally:
- [Git](https://git-scm.com/)
- [Node.js (v20+)](https://nodejs.org/) & `npm`
- [Docker](https://www.docker.com/) & Docker Compose *(recommended)*

---

### Option A: One-Command Docker Compose (Recommended)

Run the entire ecosystem (Databases, Cache, Message Broker, Web GUIs, and 6 Microservices) with a single command:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SangishettyPrem/salon-booking-application.git
   cd salon-booking-application
   ```

2. **Configure Environment Files:**
   Copy `.env.example` in each service under `server/apps/*/` and update credentials if needed (e.g. Razorpay, Resend, Cloudinary).

3. **Start Docker Compose:**
   ```bash
   cd server
   docker compose up --build
   ```

4. **Access Applications & Web Consoles:**
   - **API Gateway:** `http://localhost:5000`
   - **MongoDB Express GUI:** `http://localhost:8081` (User: `admin`, Pass: `pass`)
   - **Filebrowser Storage GUI:** `http://localhost:8082`
   - **Redis Commander GUI:** `http://localhost:8083`
   - **RabbitMQ Management Dashboard:** `http://localhost:15672` (User: `guest`, Pass: `guest`)

5. **Start Frontend Client:**
   In another terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Option B: Local Development Setup

If running microservices directly on your host machine:

1. **Start Infrastructure Services (Docker):**
   ```bash
   docker run -d --name local-mongo -p 27017:27017 mongo:latest
   docker run -d --name local-redis -p 6379:6379 redis:7.4-alpine
   docker run -d --name local-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Launch All Microservices Concurrently:**
   ```bash
   npm run dev
   ```
   *This starts Gateway (5000), Auth (5001), Salon (5002), Booking (5003), Payment (5004), and Notification (5005).*

4. **Launch Frontend:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 🔑 Environment Variables Reference

### Client (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint for API Gateway | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID`| Razorpay Public Key ID | `rzp_test_...` |

### API Gateway (`server/apps/api-gateway/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening port (`5000`) |
| `JWT_PUBLIC_KEY` | Public RSA key for verifying user tokens |
| `AUTH_SERVICE_URL` | Internal URL for Auth Service (`http://localhost:5001`) |
| `SALON_SERVICE_URL` | Internal URL for Salon Service (`http://localhost:5002`) |
| `BOOKING_SERVICE_URL`| Internal URL for Booking Service (`http://localhost:5003`) |
| `PAYMENT_SERVICE_URL`| Internal URL for Payment Service (`http://localhost:5004`) |
| `REDIS_URL` | Redis connection URL (`redis://localhost:6379`) |

### Auth Service (`server/apps/auth-service/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening port (`5001`) |
| `JWT_PRIVATE_KEY` | RSA 2048-bit Private Key for signing JWTs |
| `JWT_PUBLIC_KEY` | RSA 2048-bit Public Key |
| `MONGODB_URI` | MongoDB Connection URI (`mongodb://localhost:27017/salon_auth_db`) |
| `RABBITMQ_URL` | RabbitMQ AMQP URI (`amqp://guest:guest@localhost:5672`) |

### Salon Service (`server/apps/salon-service/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening port (`5002`) |
| `MONGODB_URI` | MongoDB Connection URI (`mongodb://localhost:27017/salon_db`) |
| `REDIS_URL` | Redis connection URL |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name for salon cover images |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |

### Booking Service (`server/apps/booking-service/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening port (`5003`) |
| `MONGODB_URI` | MongoDB Connection URI (`mongodb://localhost:27017/salon_booking_db`) |
| `RABBITMQ_URL` | RabbitMQ AMQP URI |
| `REDIS_URL` | Redis URL (used for Distributed Locks) |
| `SALON_SERVICE_URL` | Internal endpoint for fetching business hours |

### Payment Service (`server/apps/payment-service/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening port (`5004`) |
| `MONGODB_URI` | MongoDB Connection URI (`mongodb://localhost:27017/salon_payment_db`) |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Merchant Secret for signature verification |
| `RABBITMQ_URL` | RabbitMQ AMQP URI |

### Notification Service (`server/apps/notification-service/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Worker port (`5005`) |
| `RABBITMQ_URL` | RabbitMQ AMQP URI |
| `RESEND_API_KEY` | API Key for Resend transactional email service |
| `MAIL_FROM` | Sender email identity (e.g. `GlowBook <bookings@glowbook.com>`) |

---

## 🌐 Production Deployment

- **Frontend:** Automatically built and deployed on **Vercel** with continuous deployment from the `main` branch.
- **Backend Services:** Automated deployment via **Render Blueprint** (`render.yaml`):
  - Declares individual web services with Docker runtime.
  - Provisions persistent disk for RabbitMQ message durability.
  - Provisions Render Redis instance.
  - Manages shared database secrets with MongoDB Atlas.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ by Prem Kumar Sangishetty</sub>
</div>
