import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserGroupIcon, BookOpenIcon, DocumentDuplicateIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

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
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ¡Bienvenido, <span className="text-blue-600">{user?.nombre}</span>!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema integral de gestión de biblioteca
          </p>
          
          {/* User Role Badge */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white ${isAdmin ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
            <span className="text-2xl">{isAdmin ? '👨‍💼' : '👤'}</span>
            <span>{isAdmin ? 'Administrador' : 'Usuario Regular'}</span>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={module.title}
                to={module.link}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                  <div className={`bg-gradient-to-r ${module.color} h-32 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <IconComponent className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                      {module.title}
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-2 transition-all" />
                    </h3>
                    <p className="text-gray-600">{module.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Permissions Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isAdmin ? (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👨‍💼</div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-900 mb-2">Permisos de Administrador</h3>
                  <ul className="space-y-2 text-yellow-800">
                    <li className="flex items-center gap-2">✅ Crear, editar y ver registros</li>
                    <li className="flex items-center gap-2">✅ Eliminar clientes, libros y préstamos</li>
                    <li className="flex items-center gap-2">✅ Acceso completo a todas las funciones</li>
                    <li className="flex items-center gap-2">✅ Control total del sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">Permisos de Usuario</h3>
                  <ul className="space-y-2 text-purple-800">
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
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Información Rápida</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Sistema</span>
                <span className="text-blue-600 font-bold">Activo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Tu Rol</span>
                <span className="text-green-600 font-bold capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Email</span>
                <span className="text-gray-600 text-sm">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

