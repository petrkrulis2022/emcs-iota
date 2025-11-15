import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateConsignment from './pages/CreateConsignment';
import AllConsignments from './pages/AllConsignments';
import ConsignmentDetail from './pages/ConsignmentDetail';
import Login from './pages/Login';
import CustomsLogin from './pages/CustomsLogin';
import CustomsDashboard from './pages/CustomsDashboard';
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
          {/* Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/customs-login" element={<CustomsLogin />} />
          
          {/* Customs Dashboard Route (Standalone, no Layout) */}
          <Route path="/customs-dashboard" element={<CustomsDashboard />} />

          {/* Protected Routes */}
          <Route
            path="/"
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
