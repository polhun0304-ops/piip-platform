import { UnifiedLayout } from '../components/UnifiedLayout';
import { useAppSelector } from '../store/hooks';

export function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <UnifiedLayout>
      <div className="dashboard admin-dashboard">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user?.name}!</p>
        <div className="dashboard-content">
          <section className="dashboard-section">
            <h3>User Management</h3>
            <p>Manage platform users, roles, and permissions.</p>
          </section>
          <section className="dashboard-section">
            <h3>System Analytics</h3>
            <p>View platform usage statistics and performance metrics.</p>
          </section>
          <section className="dashboard-section">
            <h3>Case Oversight</h3>
            <p>Monitor all active cases and investigations.</p>
          </section>
          <section className="dashboard-section">
            <h3>Platform Configuration</h3>
            <p>Configure system settings and features.</p>
          </section>
        </div>
      </div>
    </UnifiedLayout>
  );
}
