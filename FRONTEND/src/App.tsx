import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ClientesPage } from './pages/ClientesPage';
import { LibrosPage } from './pages/LibrosPage';
import { PrestamosPage } from './pages/PrestamosPage';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppRouter: React.FC = () => {
  const { token, user, initializeAuth } = useAuthStore();

  // Inicializar auth al montar el componente
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
        <Route path="/libros" element={<ProtectedRoute><LibrosPage /></ProtectedRoute>} />
        <Route path="/prestamos" element={<ProtectedRoute><PrestamosPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
