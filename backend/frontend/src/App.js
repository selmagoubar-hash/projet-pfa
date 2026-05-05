import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import PatientList from './components/Patients/PatientList';
import AppointmentCalendar from './components/Appointments/AppointmentCalendar';
import ConsultationForm from './components/Consultations/ConsultationForm';
import InvoiceList from './components/Billing/InvoiceList';

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container-fluid app-main">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <AppLayout><PatientList /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/rendez-vous"
            element={
              <PrivateRoute>
                <AppLayout><AppointmentCalendar /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <PrivateRoute>
                <AppLayout><ConsultationForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/factures"
            element={
              <PrivateRoute>
                <AppLayout><InvoiceList /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
