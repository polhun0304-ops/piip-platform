import { UnifiedLayout } from '../components/UnifiedLayout';
import { useAppSelector } from '../store/hooks';

export function ClientDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <UnifiedLayout>
      <div className="dashboard client-dashboard">
        <h2>Client Dashboard</h2>
        <p>Welcome, {user?.name}!</p>
        <div className="dashboard-content">
          <section className="dashboard-section">
            <h3>Your Cases</h3>
            <p>Manage your active and past cases here.</p>
          </section>
          <section className="dashboard-section">
            <h3>Request New Investigation</h3>
            <p>Submit a new case request to our detective network.</p>
          </section>
          <section className="dashboard-section">
            <h3>Messages</h3>
            <p>Communicate with assigned detectives.</p>
          </section>
        </div>
      </div>
    </UnifiedLayout>
  );
}
