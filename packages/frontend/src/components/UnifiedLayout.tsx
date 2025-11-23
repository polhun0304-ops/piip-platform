import { ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

interface UnifiedLayoutProps {
  children: ReactNode;
}

/**
 * UnifiedLayout component that provides consistent layout and navigation
 * Uses Redux auth state for user information
 */
export function UnifiedLayout({ children }: UnifiedLayoutProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="unified-layout">
      <header className="layout-header">
        <div className="header-content">
          <h1>PIIP Platform</h1>
          {isAuthenticated && user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">({user.role})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <p>&copy; 2024 PIIP Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
