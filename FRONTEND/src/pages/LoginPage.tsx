import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LockClosedIcon, EnvelopeIcon, UserIcon, SparklesIcon, ShieldCheckIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { FeedbackBanner } from '../components/FeedbackBanner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      navigate('/', {
        state: {
          flash: {
            type: 'success',
            title: 'Inicio de sesión',
            message:
              user?.role === 'admin'
                ? 'Has iniciado sesión como administrador. Puedes crear, editar y eliminar registros.'
                : 'Has iniciado sesión como usuario. Puedes crear y editar registros; la eliminación queda reservada al administrador.',
          },
        },
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, nombre);
      setShowRegister(false);
      setEmail('');
      setPassword('');
      setNombre('');
      setNotice({ type: 'success', message: 'Registro completado. Ya puedes iniciar sesión con tu cuenta.' });
    } catch (err) {
      console.error('Register failed:', err);
    }
  };

  return (
    <div className="app-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950/95 p-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.20),transparent_28%)]" />
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <SparklesIcon className="h-4 w-4" />
              Biblioteca moderna para gestión real
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Una interfaz clara, rápida y lista para crecer.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              Administra clientes, libros y préstamos desde una experiencia más limpia, más actual y más fácil de escalar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <BookOpenIcon className="mb-3 h-6 w-6 text-cyan-200" />
                <p className="text-sm font-semibold">Catálogo vivo</p>
                <p className="mt-1 text-xs text-slate-300">Diseñado para navegar rápido entre módulos.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <ShieldCheckIcon className="mb-3 h-6 w-6 text-emerald-200" />
                <p className="text-sm font-semibold">Roles claros</p>
                <p className="mt-1 text-xs text-slate-300">Admin y usuario con permisos visualmente diferenciados.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <ArrowRightIcon className="mb-3 h-6 w-6 text-sky-200" />
                <p className="text-sm font-semibold">Escalable</p>
                <p className="mt-1 text-xs text-slate-300">La UI ya queda lista para seguir creciendo por módulos.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="toolbar-chip border-white/10 bg-white/10 text-white">Diseño editorial</span>
              <span className="toolbar-chip border-white/10 bg-white/10 text-white">Transiciones suaves</span>
              <span className="toolbar-chip border-white/10 bg-white/10 text-white">Panel administrativo</span>
            </div>
          </div>
        </section>

        <section className="glass-panel overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 px-8 py-8 text-white sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-50/80">Biblioteca</p>
                <h2 className="text-3xl font-bold leading-tight">Sistema de Gestión Integral</h2>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 sm:px-10 sm:py-10">
            {notice && <FeedbackBanner type={notice.type} title="Registro" message={notice.message} onClose={() => setNotice(null)} />}
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            {!showRegister ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <span className="mb-1 flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@biblioteca.local"
                    className="form-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <span className="mb-1 flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-blue-600" />
                      Contraseña
                    </span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="form-field"
                    required
                  />
                </div>

                <button type="submit" disabled={isLoading} className="action-primary mt-2 w-full">
                  {isLoading ? 'Cargando...' : 'Ingresar'}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="rounded-full bg-white px-3 py-1 text-slate-500 shadow-sm">¿No tienes cuenta?</span>
                  </div>
                </div>

                <button type="button" onClick={() => setShowRegister(true)} className="action-secondary w-full">
                  Registrarse
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <span className="mb-1 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      Nombre
                    </span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="form-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <span className="mb-1 flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="form-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <span className="mb-1 flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-blue-600" />
                      Contraseña
                    </span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="form-field"
                    required
                  />
                </div>

                <button type="submit" disabled={isLoading} className="action-primary mt-2 w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                  {isLoading ? 'Cargando...' : 'Registrarse'}
                </button>

                <button type="button" onClick={() => setShowRegister(false)} className="action-secondary w-full">
                  Volver al login
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-slate-200/80 bg-slate-50/80 px-8 py-4 text-center text-xs text-slate-500 sm:px-10">
            Credenciales de prueba: <span className="font-semibold text-slate-700">admin@biblioteca.local</span> / <span className="font-semibold text-slate-700">admin123</span>
          </div>
        </section>
      </div>
    </div>
  );
};

