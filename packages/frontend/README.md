# Frontend Package

React-based frontend for the PIIP Platform with role-based authentication and access control.

## Features

### Authentication & Authorization
- **Redux-based Auth State**: Centralized authentication management
- **ProtectedRoute Component**: Guards routes based on authentication and roles
- **Role-Based Access Control**: Separate dashboards for client, admin, and detective roles
- **Automatic Redirects**: Unauthenticated users redirected to login, unauthorized to error page

### User Roles
- `client`: Access to client dashboard for case management
- `admin`: Access to admin dashboard for platform management
- `detective`: Access to detective dashboard for investigation work

### Routes
- `/login` - Public login page (demo mode with role selection)
- `/client-dashboard` - Protected, requires client role
- `/admin-dashboard` - Protected, requires admin role
- `/detective-dashboard` - Protected, requires detective role
- `/unauthorized` - Error page for unauthorized access

## Architecture

### Redux Store
- **Auth Slice**: Manages authentication state with actions:
  - `login({ user, token })`: Authenticate user
  - `logout()`: Clear authentication
  - `updateUser(user)`: Update user information

### Components
- **ProtectedRoute**: HOC for route protection
  - Props: `children`, `requiredRole?`
  - Redirects based on auth state and role
- **UnifiedLayout**: Consistent layout with header/footer
  - Displays user info from Redux state
  - Logout functionality

### Pages
- **LoginPage**: Mock authentication with role selection
- **ClientDashboard**: Client-specific features
- **AdminDashboard**: Administrative features
- **DetectiveDashboard**: Detective tools
- **UnauthorizedPage**: Access denied message

## Development

### Prerequisites
- Node.js >= 20 < 25

### Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Watch mode for tests
npm run test:watch

# Preview production build
npm run preview
```

### Technology Stack
- **React 18.3**: UI framework
- **Redux Toolkit 2.2**: State management
- **React Router 6.26**: Routing
- **TypeScript 5.5**: Type safety
- **Vite 5.4.21**: Build tool (Node 20 compatible)
- **vitest 1.6**: Testing framework
- **esbuild 0.21.5**: Fast bundling

## Testing

Comprehensive test suite covering:
- Auth slice reducers and actions
- ProtectedRoute authentication checks
- ProtectedRoute role-based authorization
- Navigation redirects

Run tests with:
```bash
npm run test
```

## ESM Configuration

This package uses ES modules (type: "module"). All imports use ES module syntax, and the build output is ESM-compatible.

## Node Version Compatibility

Supports Node.js versions 20-24. Version validation occurs automatically during installation via the root `check-node.cjs` script.
