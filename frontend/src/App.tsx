import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateConsignment from './pages/CreateConsignment';
import AllConsignments from './pages/AllConsignments';
import ConsignmentDetail from './pages/ConsignmentDetail';
import Login from './pages/Login';
import CustomsLogin from './pages/CustomsLogin';
import CustomsDashboard from './pages/CustomsDashboard';
import OfficerVerification from './pages/OfficerVerification';
import LandingPage from './pages/LandingPage';
import NotificationProvider from './components/NotificationProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { useWalletStore } from './stores/useWalletStore';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/customs-login" element={<CustomsLogin />} />
          
          {/* Customs Dashboard Route (Standalone, no Layout) */}
          <Route path="/customs-dashboard" element={<CustomsDashboard />} />
          
          {/* Officer Verification Route (Standalone, no Layout) */}
          <Route path="/officer-verification" element={<OfficerVerification />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateConsignment />} />
            <Route path="all-consignments" element={<AllConsignments />} />
            <Route path="consignment/:arc" element={<ConsignmentDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
