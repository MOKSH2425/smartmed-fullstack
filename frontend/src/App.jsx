import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import AppointmentHistory from './pages/AppointmentHistory';
import PreviousDoctors from './pages/PreviousDoctors';
import MedicalReports from './pages/MedicalReports';
import SymptomChecker from './pages/SymptomChecker';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Chat from './pages/Chat'; 
import Login from './pages/Login';
import Signup from './pages/Signup';

// The Security Guard
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        
        {/* PUBLIC ROUTES (Anyone can see these) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* If you had a dedicated /login or /signup page, they would go here too */}

        {/* PRIVATE ROUTES (Protected by the Guard) */}
        <Route path="/dashboard" element={
          <ProtectedRoute> <Dashboard /> </ProtectedRoute>
        } />
        
        <Route path="/doctors" element={
          <ProtectedRoute> <Doctors /> </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute> <AppointmentHistory /> </ProtectedRoute>
        } />

        <Route path="/previous" element={
          <ProtectedRoute> <PreviousDoctors /> </ProtectedRoute>
        } />
        
        <Route path="/report" element={
          <ProtectedRoute> <MedicalReports /> </ProtectedRoute>
        } />

        <Route path="/symptom" element={
          <ProtectedRoute> <SymptomChecker /> </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute> <Profile /> </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute> <Settings /> </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute> <Chat /> </ProtectedRoute>
        } />

      </Routes>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Footer />
    </Router>
  );
}

export default App;