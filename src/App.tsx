import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';

import { LandingPage } from './pages/LandingPage';
import { MedicineSearchPage } from './pages/MedicineSearchPage';
import { MedicineDetailPage } from './pages/MedicineDetailPage';
import { PharmacyFinderPage } from './pages/PharmacyFinderPage';
import { PharmacyDetailPage } from './pages/PharmacyDetailPage';
import { PriceComparisonPage } from './pages/PriceComparisonPage';
import { AlternativesDirectoryPage } from './pages/AlternativesDirectoryPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { PharmacyDashboardPage } from './pages/PharmacyDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Protected Route wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: ('USER' | 'PHARMACY' | 'ADMIN')[] }> = ({
  children,
  roles
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <NotificationDrawer />
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/medicines" element={<MedicineSearchPage />} />
                <Route path="/medicines/:id" element={<MedicineDetailPage />} />
                <Route path="/pharmacies" element={<PharmacyFinderPage />} />
                <Route path="/pharmacies/:id" element={<PharmacyDetailPage />} />
                <Route path="/compare" element={<PriceComparisonPage />} />
                <Route path="/alternatives" element={<AlternativesDirectoryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Patient Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['USER', 'ADMIN', 'PHARMACY']}>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reservations"
                  element={
                    <ProtectedRoute>
                      <ReservationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Pharmacy Staff Route */}
                <Route
                  path="/pharmacy-dashboard"
                  element={
                    <ProtectedRoute roles={['PHARMACY', 'ADMIN']}>
                      <PharmacyDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* System Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
