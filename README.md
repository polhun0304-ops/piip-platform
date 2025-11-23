# piip-platform
전 세계 최고 전문가 수준의 탐정 플랫폼으로, 보안, 협업, 확장성, 법적 대응까지 고려한 모든 기능과 기술 스택을 탑재한 탐정플랫폼입니다.

## Project Structure

This is a monorepo using npm workspaces:

```
piip-platform/
├── packages/
│   └── frontend/          # React frontend with Redux and role-based auth
├── check-node.cjs         # Node version validation script
└── package.json           # Root package with workspace configuration
```

## Requirements

- Node.js >= 20 < 25
- npm (comes with Node.js)

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests for all packages
npm run test
```

## Features

### Frontend Package
- ✅ **ProtectedRoute Component**: Redux-based authentication and role guards
- ✅ **Role-Based Access Control**: Separate dashboards for client, admin, detective
- ✅ **Redux Integration**: Centralized auth state management
- ✅ **UnifiedLayout**: Consistent layout using Redux auth state
- ✅ **ESM Support**: Full ES module configuration
- ✅ **Comprehensive Tests**: 8 tests covering auth and routing

### Technical Stack
- **React 18.3** + **Redux Toolkit 2.2** for UI and state
- **React Router 6.26** for routing with protected routes
- **TypeScript 5.5** for type safety
- **Vite 5.4.21** for fast builds (Node 20 compatible)
- **vitest 1.6** for testing
- **esbuild 0.21.5** for bundling

## Development

See individual package READMEs for package-specific instructions:
- [Frontend Package](./packages/frontend/README.md)

## Node Version Compatibility

This project supports Node.js versions 20 through 24. The `check-node.cjs` script validates the Node version during installation.

## License

MIT
