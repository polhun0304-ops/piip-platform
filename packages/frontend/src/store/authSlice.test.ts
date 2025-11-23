import { describe, it, expect } from 'vitest';
import authReducer, { login, logout, updateUser, UserRole } from './authSlice';

describe('authSlice', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle login', () => {
    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'client' as UserRole
    };
    const token = 'test-token';

    const actual = authReducer(initialState, login({ user, token }));
    
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(user);
    expect(actual.token).toBe(token);
  });

  it('should handle logout', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'client' as UserRole
      },
      token: 'test-token'
    };

    const actual = authReducer(loggedInState, logout());
    
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
  });

  it('should handle updateUser', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'client' as UserRole
      },
      token: 'test-token'
    };

    const updatedUser = {
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
      role: 'admin' as UserRole
    };

    const actual = authReducer(loggedInState, updateUser(updatedUser));
    
    expect(actual.user).toEqual(updatedUser);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.token).toBe('test-token');
  });
});
