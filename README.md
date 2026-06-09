# AIHire

An AI-powered hiring and recruitment platform built with a modern tech stack. AIHire helps streamline candidate management, job posting, interview scheduling, and applicant tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Packages](#packages)
- [Scripts](#scripts)
- [Contributing](#contributing)

## ✨ Features

- **Candidate Management**: Track and manage job candidates
- **Job Postings**: Create and manage job listings
- **Applications Tracking**: Monitor and track job applications
- **Interview Scheduling**: Schedule and manage interviews
- **Dashboard**: Comprehensive dashboard for hiring managers
- **Board View**: Kanban-style board for application management
- **AI-Powered Application Processing**: Automated candidate screening
- **Data Export**: Export candidates, jobs, and applications to CSV/JSON
- **Notification System**: In-app and email notifications for important events
- **Audit Logging**: Complete activity logging and change tracking
- **User Preferences**: Customizable notification and appearance settings
- **Advanced Filtering**: Search and filter across all entities
- **Pagination**: Efficient data loading with pagination support

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Router** - Routing

### Backend
- **Node.js/Express** - API server
- **TypeScript** - Type safety
- **Clerk** - Authentication & authorization

### Database
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** (configured via Drizzle)

### Tools & Libraries
- **pnpm** - Package manager
- **Monorepo** - Workspace structure
- **Zod** - Schema validation
- **OpenAPI** - API specification

## 📁 Project Structure

```
AIHire/
├── artifacts/                 # Application packages
│   ├── api-server/           # Express backend API
│   ├── cloudhire/            # React frontend application
│   └── mockup-sandbox/       # UI component preview environment
├── lib/                       # Shared libraries
│   ├── api-client-react/     # React API client
│   ├── api-spec/             # OpenAPI specification
│   ├── api-zod/              # Zod validation schemas
│   └── db/                   # Database schema & migrations
├── scripts/                   # Utility scripts
├── package.json              # Root workspace configuration
├── pnpm-workspace.yaml       # Workspace setup
└── tsconfig.base.json        # TypeScript base config
```

## 📦 Packages

### artifacts/api-server
Backend API server built with Express and TypeScript
- RESTful API endpoints
- Clerk authentication middleware
- Routes: candidates, jobs, applications, interviews, board, dashboard, AI apply
- Database integration via Drizzle ORM

### artifacts/cloudhire
React frontend application using Vite
- Responsive UI with Tailwind & Shadcn/ui
- Pages: Dashboard, Applications, Jobs, Candidates, Interviews, Board
- React hooks for state management
- Mobile-responsive design

### artifacts/mockup-sandbox
Storybook-like environment for component development and preview

### lib/api-client-react
Generated React hooks for API client
- Custom fetch implementation
- Auto-generated types from OpenAPI spec

### lib/api-spec
OpenAPI 3.0 specification for the API
- Orval code generation configuration

### lib/api-zod
Zod validation schemas
- Auto-generated from OpenAPI spec
- Type-safe validation

### lib/db
Database layer
- Drizzle ORM configuration
- Schema definitions: candidates, jobs, applications, interviews
- Database migrations

## 🚀 Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **PostgreSQL** (for production)

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prabaharans/AIHire.git
   cd AIHire
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   - Create `.env` files in `artifacts/api-server` and `artifacts/cloudhire`
   - Configure: database URL, Clerk keys, API endpoints

4. **Run database migrations** (if applicable)
   ```bash
   pnpm db migrate
   ```

## 💻 Development

### Start Development Servers

```bash
# Start all packages in development mode
pnpm dev

# Or start specific packages:
pnpm --filter=api-server dev
pnpm --filter=cloudhire dev
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter=api-server build
```

### Type Checking

```bash
# Type check all packages
pnpm type-check
```

### Linting

```bash
# Lint all packages
pnpm lint
```

## 📜 Scripts

Available scripts in the root workspace:

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages for production
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Lint all packages

## 🔌 API Endpoints

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/summary` - Get jobs summary with application counts

### Applications
- `GET /api/applications` - List all applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Interviews
- `GET /api/interviews` - List all interviews
- `POST /api/interviews` - Schedule interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Cancel interview

### Export
- `GET /api/export/candidates` - Export candidates (CSV/JSON)
- `GET /api/export/jobs` - Export jobs (CSV/JSON)
- `GET /api/export/applications` - Export applications (CSV/JSON)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (paginated)
- `GET /api/audit-logs/entity/:entityType/:entityId` - Get logs for specific entity

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/board` - Get board view data

### Health
- `GET /api/health` - Health check endpoint

## 🚀 Recent Improvements (v2.0)

### Backend Enhancements
- **Error Handling Middleware**: Comprehensive error handling with proper HTTP status codes
- **Request Validation**: Automatic request validation using Zod schemas
- **Pagination Utilities**: Built-in pagination support for all list endpoints
- **Query Utilities**: Advanced filtering and search capabilities
- **Audit Logging**: Complete audit trail for all changes (CREATE, UPDATE, DELETE)
- **Notifications System**: In-app and email notification support
- **Export Functionality**: CSV and JSON export for all major entities
- **Database Enhancements**: New tables for audit logs, notifications, user settings, and activity feed

### Frontend Enhancements
- **Notification Bell**: Real-time notification indicator in header
- **Export Component**: Easy-to-use export button for data export
- **User Settings Page**: Customize appearance, notifications, and regional settings
- **Activity Log Page**: View complete system audit trail
- **Notification Hooks**: React hooks for managing notifications
- **Export Hooks**: Utilities for exporting data

### New Database Tables
- `audit_logs` - Complete audit trail of all changes
- `notifications` - User notifications
- `email_templates` - Customizable email templates
- `user_settings` - User preferences and settings
- `activity_feed` - Activity tracking

## 🎯 Development Features

### Middleware
- `errorHandler` - Global error handling
- `validation` - Request body/query/params validation
- Async error wrapping

### Utilities
- Pagination helpers with configurable limits
- Search and filter builders
- CSV/JSON export functions
- Audit logging and change tracking
- Notification management

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Prabaharan S**
- GitHub: [@prabaharans](https://github.com/prabaharans)