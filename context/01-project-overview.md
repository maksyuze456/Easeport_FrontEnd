# Easeport Frontend - Project Overview

## Executive Summary

Easeport is an AI-powered email-to-ticket management system. This is the frontend application built with Next.js that interfaces with a Spring Boot Java backend.

### Purpose
Transform incoming emails into actionable support tickets, enabling employees to manage, respond to, and resolve customer inquiries efficiently.

### Key Features
- Real-time ticket management and assignment
- Email conversation threading and response
- Role-based access control (Admin/Employee)
- Live notifications via WebSocket
- Employee management (Admin only)

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.1.1 |
| Language | TypeScript | 5.9.2 |
| Component Library | Mantine UI | 8.3.1 |
| State Management | React Query (TanStack) | 5.90.10 |
| HTTP Client | Axios | 1.13.2 |
| Real-time | STOMP over SockJS | 7.2.1 / 1.6.1 |
| Testing | Jest + Playwright | 30.2.0 / 1.57.0 |
| Package Manager | Yarn | 4.10.2 |

## High-Level Architecture

```
Frontend (Next.js)
├── Pages/Routes (app/)
├── Components (Mantine)
├── Context Providers (Auth, Query, WS)
├── React Query Hooks
└── API Layer (Axios)
        │
        ├── HTTP/REST
        └── WebSocket/STOMP
                │
        Backend (Spring Boot)
        ├── REST API
        ├── WebSocket
        └── Email Processing (AI)
```

## Directory Structure

```
easeportFrontend/
├── app/                          # Next.js App Router
│   ├── _components/              # Page-level components
│   ├── _context/                 # React Context providers
│   ├── dashboard/                # Protected routes
│   │   ├── admin/                # Admin-only routes
│   │   └── employee/             # User routes
│   ├── login/                    # Auth pages
│   └── layout.tsx                # Root layout
├── features/                     # Feature modules
│   ├── auth/                     # Authentication
│   ├── tickets/                  # Ticket management
│   ├── employees/                # Employee CRUD
│   └── notifications/            # Notifications
├── lib/                          # Shared utilities
│   ├── api/                      # API client
│   └── ws/                       # WebSocket client
├── shared/                       # Reusable components
│   └── components/
│       ├── layout/               # Layout components
│       └── ui/                   # UI components
├── context/                      # Additional contexts
├── tests/                        # E2E tests
└── Configuration files
```

## Feature-Based Architecture

Each feature follows this structure:
```
features/{feature}/
├── api/              # API calls & HTTP logic
├── components/       # React components
├── hooks/            # Custom React hooks
├── types.ts          # TypeScript definitions
└── index.ts          # Barrel exports
```

### Current Features
1. **auth** - User authentication and session management
2. **tickets** - Support ticket lifecycle management
3. **employees** - Employee/user administration
4. **notifications** - Real-time notification system

## Key Architectural Patterns

### 1. Feature-Based Organization
- Self-contained modules with clear boundaries
- Barrel exports for clean imports
- Separation: API → Hooks → Components → Types

### 2. React Query State Management
- Queries for data fetching with caching
- Mutations for state changes
- Automatic invalidation for UI updates
- DevTools for debugging

### 3. WebSocket Real-Time Updates
- STOMP protocol over SockJS
- Topic-based subscriptions
- Automatic query refetching on events
- Graceful reconnection handling

### 4. Role-Based Access Control
- Middleware enforces route protection
- Cookie-based role storage
- Conditional UI rendering based on role
- Two roles: ROLE_ADMIN, ROLE_USER

### 5. Type Safety
- TypeScript strict mode enabled
- Feature-scoped type definitions
- No centralized types (maintained locally)

## Authentication Flow

```
User → Login Page
  ↓
POST /auth/signin
  ↓
JWT Cookie Set
  ↓
Role Cookie Set (by getUser())
  ↓
Auth Context Updated
  ↓
WebSocket Connected
  ↓
Dashboard (Protected)
```

## Data Flow

```
Email Inbox
    │
    ▼
Spring Boot Backend
    │
    ├── Parse Email
    ├── AI Categorization
    ├── Create Ticket
    └── WebSocket Broadcast ──────> Frontend Updates
                                        │
                                        ├── Query Invalidation
                                        └── UI Re-render
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
NEXT_PUBLIC_SHOW_RQ_DEVTOOLS=true
```

## User Roles

| Role | Identifier | Access |
|------|------------|--------|
| Admin | `ROLE_ADMIN` | Full access: employee management, all tickets |
| Employee | `ROLE_USER` | Ticket operations: view, assign, respond, close |

## Build & Deployment

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run test         # Jest tests
npm run e2e          # Playwright E2E tests
```

### Docker
```bash
docker build -t easeport-frontend .
docker-compose up -d
```

## Known Technical Debt

1. **Mixed State**: Transitioning from Context to React Query
2. **Partial Migration**: Only auth moved to features/ folder initially
3. **Test Coverage**: Minimal (only login tests currently)
4. **Type Safety**: Some `any` types need proper definitions
5. **Delete Employee**: UI exists but backend not implemented

## Next Steps for Development

When working on this codebase:
1. Follow feature-based structure for new functionality
2. Use React Query for all data fetching
3. Invalidate queries after mutations
4. Add WebSocket subscriptions for real-time updates
5. Write TypeScript types in feature's types.ts
6. Export through barrel files (index.ts)
