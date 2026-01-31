# Easeport Frontend - Context Index

This directory contains pre-generated context files to help AI assistants (like Automaker) quickly understand the codebase structure without having to explore every file.

## Context Files

### Core Architecture
- `01-project-overview.md` - High-level architecture, tech stack, and project structure
- `02-features-overview.md` - Detailed breakdown of all feature modules
- `03-routing-pages.md` - All Next.js routes and page components
- `04-api-integration.md` - API endpoints, HTTP client, and WebSocket setup
- `05-state-management.md` - React Query patterns, cache keys, and invalidation strategies

### Feature Details
- `features-auth.md` - Authentication system details
- `features-tickets.md` - Ticket management system
- `features-employees.md` - Employee management system
- `features-notifications.md` - Notification system

### Infrastructure
- `lib-utilities.md` - Shared utilities, hooks, and helper functions
- `shared-components.md` - Reusable UI components

### Reference
- `type-definitions.md` - All TypeScript types and interfaces
- `environment-config.md` - Environment variables and configuration
- `testing-setup.md` - Testing framework and patterns

## Usage Guidelines

When starting a new conversation or task:
1. Read `01-project-overview.md` first for high-level understanding
2. Read specific feature files based on the task at hand
3. Reference type definitions as needed

## Last Updated
- Date: 2026-01-28
- App Version: v0.1.0
- Branch: staging

## Quick Reference

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `features/` - Feature-based modules (auth, tickets, employees, notifications)
- `lib/` - Shared utilities (API client, WebSocket)
- `shared/` - Reusable UI components

### Tech Stack
- Next.js 16.1.6
- React 19.1.1
- TypeScript 5.9.2
- Mantine UI 8.3.1
- React Query 5.90.10
- STOMP over SockJS for WebSocket
