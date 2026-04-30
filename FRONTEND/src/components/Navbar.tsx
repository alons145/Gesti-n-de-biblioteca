import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeftOnRectangleIcon, UserCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 border-b border-white/40 bg-slate-950/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(15,23,42,0.18)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3 text-white transition-transform hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20">
              <BookOpenIcon className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Biblioteca</p>
              <p className="text-lg font-semibold leading-none">Gestión inteligente</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/clientes" className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
              Clientes
            </NavLink>
            <NavLink to="/libros" className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
              Libros
            </NavLink>
            <NavLink to="/prestamos" className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
              Préstamos
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-white">
              <UserCircleIcon className="h-9 w-9 text-cyan-100" />
              <div>
                <p className="text-sm font-semibold leading-tight">{user?.nombre}</p>
                <p className={`text-xs ${isAdmin ? 'text-amber-200' : 'text-cyan-100/80'}`}>
                  {isAdmin ? 'Administrador' : 'Usuario regular'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-rose-500/90 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-500"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

