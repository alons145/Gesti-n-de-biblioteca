import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-xl">Biblioteca</span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/clientes" 
              className="text-white hover:text-blue-100 font-semibold transition-colors flex items-center gap-2"
            >
              <span>👥</span> Clientes
            </Link>
            <Link 
              to="/libros" 
              className="text-white hover:text-blue-100 font-semibold transition-colors flex items-center gap-2"
            >
              <span>📕</span> Libros
            </Link>
            <Link 
              to="/prestamos" 
              className="text-white hover:text-blue-100 font-semibold transition-colors flex items-center gap-2"
            >
              <span>📋</span> Préstamos
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-white" />
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm">{user?.nombre}</p>
                <p className={`text-xs font-semibold ${isAdmin ? 'text-yellow-200' : 'text-blue-100'}`}>
                  {isAdmin ? '👨‍💼 Administrador' : '👤 Usuario'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

