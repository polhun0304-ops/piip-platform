import { Routes, Route } from 'react-router-dom';
import UnifiedLayout from './components/UnifiedLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import HomePage from './pages/HomePage';
import CaseCreateForm from './pages/CaseCreateForm';
import SplashScreen from './pages/SplashScreen';
import HomeSelector from './pages/HomeSelector';
import LegacyHomePage from './pages/LegacyHomePage';
import Port3000HomePage from './pages/Port3000HomePage';
import DetectiveDashboard from './pages/DetectiveDashboard';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import PersonList from './pages/PersonList';
import EvidenceList from './pages/EvidenceList';
import ReportsList from './pages/ReportsList';
import ReportCreate from './pages/ReportCreate';
import AdminDashboard from './pages/AdminDashboard';
import ApiDocsPage from './pages/ApiDocsPage';
import AboutPage from './pages/AboutPage';
import HomeModern from './pages/HomeModern';
import AIEvidenceAnalysis from './pages/AIEvidenceAnalysis';
import InternationalRequest from './pages/InternationalRequest';
import LegalChatbot from './pages/LegalChatbot';
import FranchiseManagement from './pages/FranchiseManagement';
import LoginPage from './pages/LoginPage';
import EnhancedHomePage from './pages/EnhancedHomePage';
import ClientDashboard from './pages/ClientDashboard';

console.log('📱 App component loading...');

const App = () => {
  console.log('📱 App component rendering...');

  return (
    <Routes>
      {/* Login Page - 기본 진입점 (레이아웃 없음) */}
      <Route path="/" element={<LoginPage />} />

      {/* Splash Screen - 독립적인 초기 로딩 화면 (레이아웃 없음) */}
      <Route path="/splash" element={<SplashScreen />} />

      {/* 메인 통합 레이아웃이 적용된 모든 페이지 */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <UnifiedLayout>
              <Routes>
                {/* 홈페이지 - 통합 메인 */}
                <Route path="/home" element={<HomePage />} />
                {/* 사건 생성 폼 */}
                <Route path="/case-create" element={<CaseCreateForm />} />
                {/* 신규 모던 홈페이지 미리보기 */}
                <Route path="/modern" element={<HomeModern />} />
                <Route path="/enhanced-home" element={<EnhancedHomePage />} />

                {/* v2.0 확장 기능 */}
                <Route path="/ai-evidence" element={<AIEvidenceAnalysis />} />
                <Route path="/international" element={<InternationalRequest />} />
                <Route path="/legal-chatbot" element={<LegalChatbot />} />
                <Route path="/franchise" element={<FranchiseManagement />} />

                {/* API 문서 */}
                <Route path="/api-docs" element={<ApiDocsPage />} />

                {/* 대시보드 & 데이터 관리 */}
                <Route path="/dashboard" element={<DetectiveDashboard />} />
                <Route
                  path="/client-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/detective-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['detective', 'admin']}>
                      <DetectiveDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/cases" element={<CaseList />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/reports" element={<ReportsList />} />
                <Route path="/reports/new" element={<ReportCreate />} />
                <Route path="/persons" element={<PersonList />} />
                <Route path="/evidence" element={<EvidenceList />} />

                {/* 홈페이지 버전 비교 & 레거시 */}
                <Route path="/homes" element={<HomeSelector />} />
                <Route path="/legacy" element={<LegacyHomePage />} />
                <Route path="/mobile-web" element={<Port3000HomePage />} />
                <Route path="/home-full" element={<Home />} />

                {/* 프로젝트 정보 */}
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </UnifiedLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
