import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from './ProtectedRoute';
import authReducer, { UserRole } from '../store/authSlice';

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    // Should not see protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated without role requirement', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'client' as UserRole
          },
          token: 'test-token'
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated with matching role', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Test Admin',
            email: 'admin@example.com',
            role: 'admin' as UserRole
          },
          token: 'test-token'
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects when authenticated but role does not match', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Test Client',
            email: 'client@example.com',
            role: 'client' as UserRole
          },
          token: 'test-token'
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    // Should not see admin content
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
