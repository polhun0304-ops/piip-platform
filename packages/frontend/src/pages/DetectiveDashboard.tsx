import { UnifiedLayout } from '../components/UnifiedLayout';
import { useAppSelector } from '../store/hooks';

export function DetectiveDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <UnifiedLayout>
      <div className="dashboard detective-dashboard">
        <h2>Detective Dashboard</h2>
        <p>Welcome, {user?.name}!</p>
        <div className="dashboard-content">
          <section className="dashboard-section">
            <h3>Active Cases</h3>
            <p>View and manage your assigned investigations.</p>
          </section>
          <section className="dashboard-section">
            <h3>Case Assignments</h3>
            <p>Browse and accept new case requests.</p>
          </section>
          <section className="dashboard-section">
            <h3>Evidence Management</h3>
            <p>Upload and organize case evidence securely.</p>
          </section>
          <section className="dashboard-section">
            <h3>Client Communication</h3>
            <p>Secure messaging with clients.</p>
          </section>
        </div>
      </div>
    </UnifiedLayout>
  );
}
