import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import EmergencyView from './pages/EmergencyView';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/emergency/:dni" element={<EmergencyView />} />
          
          {/* Protected Routes for Admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes for Doctors */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requiredRole="doctor">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:id" 
            element={
              <ProtectedRoute requiredRole="doctor">
                <PatientDetail />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes for Patients */}
          <Route 
            path="/my-profile" 
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
