import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <h1>Unauthorized Access</h1>
        <p>You do not have permission to access this page.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
        <Link to="/login" className="back-link">
          Return to Login
        </Link>
      </div>
    </div>
  );
}
