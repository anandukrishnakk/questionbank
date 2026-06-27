import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import AddQuestion from './pages/AddQuestion';
import Dashboard from './pages/Dashboard';
import Admin from './pages/admin/AdminDashboard';

// Route guarding helper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <span className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { fetchUser, initialized } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <span className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-dark text-slate-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
            
            {/* Protected Routes */}
            <Route 
              path="/add-question" 
              element={
                <ProtectedRoute>
                  <AddQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
