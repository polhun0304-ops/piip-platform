import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';
import { UserRole } from '../store/authSlice';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = (role: UserRole) => {
    // Mock login - in production this would call an API
    const mockUsers = {
      client: {
        id: '1',
        name: 'John Client',
        email: 'client@example.com',
        role: 'client' as UserRole
      },
      admin: {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as UserRole
      },
      detective: {
        id: '3',
        name: 'Detective Holmes',
        email: 'detective@example.com',
        role: 'detective' as UserRole
      }
    };

    const user = mockUsers[role];
    const token = `mock-token-${role}-${Date.now()}`;

    dispatch(login({ user, token }));

    // Navigate to appropriate dashboard
    navigate(`/${role}-dashboard`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>PIIP Platform Login</h1>
        <p>Select a role to login (Demo)</p>
        <div className="login-buttons">
          <button onClick={() => handleLogin('client')} className="login-btn client-btn">
            Login as Client
          </button>
          <button onClick={() => handleLogin('admin')} className="login-btn admin-btn">
            Login as Admin
          </button>
          <button onClick={() => handleLogin('detective')} className="login-btn detective-btn">
            Login as Detective
          </button>
        </div>
      </div>
    </div>
  );
}
