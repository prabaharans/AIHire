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