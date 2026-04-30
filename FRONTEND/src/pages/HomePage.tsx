import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserGroupIcon, BookOpenIcon, DocumentDuplicateIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { FeedbackBanner } from '../components/FeedbackBanner';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const flash = (location.state as { flash?: { type: 'success' | 'error' | 'info'; title?: string; message: string } } | null)?.flash;

  const modules = [
    {
      icon: UserGroupIcon,
      title: 'Gestión de Clientes',
      description: 'Administra y mantén un registro de todos los clientes de la biblioteca',
      link: '/clientes',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: BookOpenIcon,
      title: 'Catálogo de Libros',
      description: 'Organiza y visualiza el inventario de libros disponibles',
      link: '/libros',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: DocumentDuplicateIcon,
      title: 'Control de Préstamos',
      description: 'Registra y monitorea todos los préstamos y devoluciones',
      link: '/prestamos',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="app-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          {flash ? (
            <FeedbackBanner type={flash.type} title={flash.title} message={flash.message} />
          ) : (
            <FeedbackBanner
              type="info"
              title={isAdmin ? 'Sesión de administrador' : 'Sesión de usuario'}
              message={isAdmin
                ? 'Puedes crear, editar y eliminar registros en todas las secciones.'
                : 'Puedes crear y editar registros; eliminar queda restringido al administrador.'}
            />
          )}
        </div>

        {/* Hero Section */}
        <section className="hero-panel mb-10 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_25%)]" />
              <div className="relative z-10 max-w-2xl">
                <div className="toolbar-chip mb-5">Biblioteca · Panel principal</div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  ¡Bienvenido, <span className="text-blue-600">{user?.nombre}</span>!
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                  Un espacio de control más limpio, más actual y preparado para crecer por módulos sin perder claridad visual.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className={`toolbar-chip ${isAdmin ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-violet-50 text-violet-800 border-violet-200'}`}>
                    <span>{isAdmin ? '👨‍💼' : '👤'}</span>
                    {isAdmin ? 'Administrador' : 'Usuario regular'}
                  </div>
                  <div className="toolbar-chip">Cliente / Libro / Préstamo</div>
                  <div className="toolbar-chip">Diseño escalable</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-slate-50/80 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <div className="grid gap-4">
                <div className="metric-tile">
                  <p className="text-sm font-semibold text-slate-500">Tu rol</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{isAdmin ? 'Administrador' : 'Usuario regular'}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-sm font-semibold text-slate-500">Permisos</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{isAdmin ? 'Acceso total al sistema' : 'Crear y editar registros'}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-sm font-semibold text-slate-500">Estado</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-600">Sesión activa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={module.title}
                to={module.link}
                className="group"
              >
                <div className="grid-card overflow-hidden p-0">
                  <div className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-r ${module.color}`}>
                    <div className="absolute inset-0 bg-black/0 transition-opacity group-hover:bg-black/10" />
                    <IconComponent className="h-16 w-16 text-white drop-shadow" />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 flex items-center justify-between text-xl font-bold text-slate-950">
                      {module.title}
                      <ArrowRightIcon className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                    </h3>
                    <p className="text-slate-600">{module.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Permissions Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isAdmin ? (
            <div className="metric-tile border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👨‍💼</div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-amber-950">Permisos de Administrador</h3>
                  <ul className="space-y-2 text-amber-900">
                    <li className="flex items-center gap-2">✅ Crear, editar y ver registros</li>
                    <li className="flex items-center gap-2">✅ Eliminar clientes, libros y préstamos</li>
                    <li className="flex items-center gap-2">✅ Acceso completo a todas las funciones</li>
                    <li className="flex items-center gap-2">✅ Control total del sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="metric-tile border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50 to-pink-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-violet-950">Permisos de Usuario</h3>
                  <ul className="space-y-2 text-violet-900">
                    <li className="flex items-center gap-2">✅ Crear y editar registros</li>
                    <li className="flex items-center gap-2">✅ Ver todos los datos</li>
                    <li className="flex items-center gap-2">❌ No puedes eliminar registros</li>
                    <li className="flex items-center gap-2">ℹ️ Contacta un admin si necesitas ayuda</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="metric-tile">
            <h3 className="mb-6 text-2xl font-bold text-slate-950">📊 Información rápida</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">Sistema</span>
                <span className="font-bold text-blue-600">Activo</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">Tu rol</span>
                <span className="font-bold capitalize text-emerald-600">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">Email</span>
                <span className="text-sm text-slate-600">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

