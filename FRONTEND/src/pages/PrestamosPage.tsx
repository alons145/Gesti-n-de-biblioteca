import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, XMarkIcon, CheckIcon, TrashIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { FeedbackBanner } from '../components/FeedbackBanner';

interface Prestamo {
  id: number;
  cliente_id: number;
  libro_id: number;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real: string | null;
  cliente: { nombre: string };
  libro: { titulo: string };
}

interface Cliente {
  id: number;
  nombre: string;
}

interface Libro {
  id: number;
  titulo: string;
  disponible: boolean;
}

const API_URL = 'http://localhost:5000/api';

export const PrestamosPage: React.FC = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ cliente_id: '', libro_id: '', fecha_devolucion_esperada: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { token, user, handleUnauthorized } = useAuthStore();
  const actorLabel = user?.role === 'admin' ? 'administrador' : 'usuario';

  useEffect(() => {
    fetchData();
  }, []);

  const isUnauthorizedError = (err: any) => err?.response?.status === 401;

  const requireToken = () => {
    if (!token) {
      handleUnauthorized();
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    if (!requireToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [prestamosRes, clientesRes, librosRes] = await Promise.all([
        axios.get(`${API_URL}/prestamos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/libros`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPrestamos(prestamosRes.data);
      setClientes(clientesRes.data);
      setLibros(librosRes.data);
      setError(null);
    } catch (err: any) {
      if (isUnauthorizedError(err)) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrestamo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!requireToken()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/prestamos`, {
        cliente_id: parseInt(formData.cliente_id),
        libro_id: parseInt(formData.libro_id),
        fecha_devolucion_esperada: formData.fecha_devolucion_esperada,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ cliente_id: '', libro_id: '', fecha_devolucion_esperada: '' });
      setShowForm(false);
      await fetchData();
      setSuccess(`Préstamo registrado correctamente por ${actorLabel}.`);
      setError(null);
    } catch (err: any) {
      if (isUnauthorizedError(err)) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error al crear préstamo');
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrestamo = async (prestamoId: number) => {
    if (!requireToken()) return;
    if (!user || user.role !== 'admin') {
      setError('Solo los administradores pueden eliminar préstamos');
      return;
    }
    if (!window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) return;
    try {
      await axios.delete(`${API_URL}/prestamos/${prestamoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setSuccess('Préstamo eliminado correctamente por el administrador.');
      setError(null);
    } catch (err: any) {
      if (isUnauthorizedError(err)) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error al eliminar préstamo');
      setSuccess(null);
    }
  };

  const handleReturnBook = async (prestamoId: number) => {
    if (!requireToken()) return;
    try {
      await axios.put(`${API_URL}/prestamos/${prestamoId}`, {
        fecha_devolucion_real: new Date().toISOString().split('T')[0],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setSuccess(`Libro devuelto correctamente por ${actorLabel}.`);
      setError(null);
    } catch (err: any) {
      if (isUnauthorizedError(err)) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error al registrar devolución');
      setSuccess(null);
    }
  };

  const prestamosActivos = prestamos.filter((p) => !p.fecha_devolucion_real).length;
  const prestamosDevueltos = prestamos.filter((p) => p.fecha_devolucion_real).length;

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📋 Control de Préstamos</h1>
            <p className="text-gray-600 mt-2">Registra y monitorea todos los préstamos de libros</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Préstamo
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6">
            <p className="text-sm text-gray-600">Préstamos activos</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{prestamosActivos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
            <p className="text-sm text-gray-600">Préstamos devueltos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{prestamosDevueltos}</p>
          </div>
        </div>

        {/* Error */}
        {success && <FeedbackBanner type="success" title="Préstamos" message={success} onClose={() => setSuccess(null)} />}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><XMarkIcon className="w-5 h-5" /></button>
          </div>
        )}

        {/* Form as Modal */}
        <Transition appear show={showForm} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowForm(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">Registrar nuevo préstamo</Dialog.Title>
                    <form onSubmit={handleCreatePrestamo} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select required value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })} className="px-4 py-3 border rounded-lg">
                        <option value="">Selecciona un cliente</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <select required value={formData.libro_id} onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })} className="px-4 py-3 border rounded-lg">
                        <option value="">Selecciona un libro</option>
                        {libros.filter(l => l.disponible).map(l => <option key={l.id} value={l.id}>{l.titulo}</option>)}
                      </select>
                      <input type="date" value={formData.fecha_devolucion_esperada} onChange={(e) => setFormData({ ...formData, fecha_devolucion_esperada: e.target.value })} className="px-4 py-3 border rounded-lg" />
                      <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-purple-600 text-white">{isSubmitting ? 'Registrando...' : 'Registrar'}</button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : prestamos.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Libro</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Préstamo</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Devolución</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prestamos.map((prestamo, index) => {
                    const isDevuelto = !!prestamo.fecha_devolucion_real;
                    return (
                      <tr key={prestamo.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-6 py-4 font-semibold text-gray-900">{prestamo.cliente.nombre}</td>
                        <td className="px-6 py-4 text-gray-700">{prestamo.libro.titulo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4 inline mr-2" />
                          {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {isDevuelto ? (
                            <span className="text-green-600 font-semibold">✓ {prestamo.fecha_devolucion_real}</span>
                          ) : (
                            <span className="text-orange-600 font-semibold">{prestamo.fecha_devolucion_esperada}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            isDevuelto
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isDevuelto ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4" />
                                Devuelto
                              </>
                            ) : (
                              <>
                                <span>📖</span>
                                En préstamo
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          {!isDevuelto && (
                            <button
                              onClick={() => handleReturnBook(prestamo.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 transition text-sm"
                            >
                              Devolver
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDeletePrestamo(prestamo.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded hover:bg-red-200 transition text-sm"
                            >
                              <TrashIcon className="w-4 h-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-500">📭 No hay préstamos registrados</p>
            <p className="text-gray-400 mt-2">¡Comienza registrando el primer préstamo!</p>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">📊 Total de préstamos:</span> {prestamos.length} | 
            <span className="font-semibold ml-4">📖 Activos:</span> {prestamosActivos} | 
            <span className="font-semibold ml-4">✅ Devueltos:</span> {prestamosDevueltos}
          </p>
        </div>
      </div>
    </div>
  );
};
