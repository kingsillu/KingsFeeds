# KingsFeeds Blog

## Overview

KingsFeeds is a blog application that displays posts from a Medium RSS feed. It's built as a full-stack web application featuring a React frontend with TypeScript, an Express.js backend, and utilizes shadcn/ui components for the interface. The application fetches and displays blog posts from Medium through an RSS proxy endpoint to handle CORS restrictions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**September 27, 2025** - Project Setup and Rebranding:
- Fixed TypeScript import issues for case-sensitive file names
- Configured Vite development server to bind to 0.0.0.0:5000 for Replit proxy compatibility  
- Added HMR configuration for port 5000
- Set up deployment configuration for autoscale target with npm build/start commands
- **Rebranded from "The Curious Teens" to "KingsFeeds"**
- **Added dark/light theme toggle with default dark mode**
- **Updated RSS feed source to @kingsillu on Medium**
- **Updated all branding, content, and About section**
- Successfully tested application - blog posts loading from new RSS feed
- Workflow configured and running on port 5000

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing (lightweight React router alternative)
- **Build System**: Vite with hot module replacement and development server

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API with a single RSS proxy endpoint
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Data Layer
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Environment-based database URL configuration

### External Dependencies

#### RSS Feed Integration
- **Medium RSS Feed**: Fetches content from `https://medium.com/@kingsillu/feed`
- **CORS Proxy**: Uses `api.rss2json.com` service to bypass CORS restrictions
- **Data Validation**: Zod schemas for RSS response validation and type safety

#### UI and Styling
- **Component System**: Complete shadcn/ui component library with Radix UI primitives
- **Typography**: Google Fonts (Inter and Charter) for modern, readable text
- **Icons**: Lucide React icon library
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

#### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Error Handling**: Runtime error overlay for development debugging
- **Code Quality**: TypeScript strict mode with comprehensive type checking

#### Session Management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **User Storage**: In-memory storage implementation with interface for future database integration

The application follows a clean separation of concerns with shared TypeScript schemas between client and server, ensuring type safety across the full stack. The RSS proxy architecture solves CORS issues while maintaining a simple, efficient data flow from Medium to the user interface.