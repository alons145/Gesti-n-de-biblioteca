import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FeedbackBanner } from '../components/FeedbackBanner';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_registro: string;
}

const API_URL = 'http://localhost:5000/api';

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtered, setFiltered] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const { token, user } = useAuthStore();
  const actorLabel = user?.role === 'admin' ? 'administrador' : 'usuario';

  useEffect(() => { fetchClientes(); }, []);
  useEffect(() => { setFiltered(clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))); }, [search, clientes]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } });
      setClientes(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error cargando clientes');
    } finally { setLoading(false); }
  };

  const openModal = () => { setEditingId(null); setIsOpen(true); };
  const closeModal = () => { setIsOpen(false); setForm({ nombre: '', email: '', telefono: '', direccion: '' }); setEditingId(null); };

  const submitCliente = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/clientes/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/clientes`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchClientes();
      setSuccess(editingId ? `Cliente actualizado correctamente por ${actorLabel}.` : `Cliente creado correctamente por ${actorLabel}.`);
      setError(null);
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || (editingId ? 'Error actualizando cliente' : 'Error creando cliente'));
      setSuccess(null);
    }
  };

  const startEdit = (c: Cliente) => {
    setEditingId(c.id);
    setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono, direccion: c.direccion });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!user || user.role !== 'admin') {
      setError('Solo los administradores pueden eliminar clientes');
      return;
    }
    if (!window.confirm('¿Eliminar cliente? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`${API_URL}/clientes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchClientes();
      setSuccess('Cliente eliminado correctamente por el administrador.');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error eliminando cliente');
      setSuccess(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">👥 Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona los registros y la información de tus clientes</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openModal} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow"> <PlusIcon className="w-5 h-5"/> Nuevo Cliente</button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full pl-12 pr-4 py-3 border rounded-lg" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-end">
            <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">{clientes.length}</span></p>
          </div>
        </div>

        {success && <FeedbackBanner type="success" title="Clientes" message={success} onClose={() => setSuccess(null)} />}
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)}><XMarkIcon className="w-5 h-5" /></button></div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-white rounded-xl p-6 h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length ? filtered.map(cliente => (
              <div key={cliente.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{cliente.nombre.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{cliente.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded hover:bg-gray-100">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                      </Menu.Button>
                      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border rounded-md shadow-lg focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button onClick={() => startEdit(cliente)} className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}>
                                  <PencilSquareIcon className="w-4 h-4 inline mr-2" /> Editar
                                </button>
                              )}
                            </Menu.Item>
                            {user?.role === 'admin' && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button onClick={() => handleDelete(cliente.id)} className={`w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}>
                                    <TrashIcon className="w-4 h-4 inline mr-2" /> Eliminar
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">Tel: {cliente.telefono || '—'}</div>
                <div className="mt-2 text-sm text-gray-600">Dir: {cliente.direccion || '—'}</div>
                <div className="mt-4 text-xs text-gray-400">Registrado: {new Date(cliente.fecha_registro).toLocaleDateString()}</div>
              </div>
            )) : (
              <div className="col-span-full bg-white rounded-xl shadow p-12 text-center">
                <p className="text-xl text-gray-600">No se encontraron clientes</p>
                <p className="text-gray-400 mt-2">Añade tu primer cliente usando el botón superior.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">Agregar nuevo cliente</Dialog.Title>
                    <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitCliente}>
                      <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="col-span-2 px-4 py-3 border rounded-lg" />
                      <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-4 py-3 border rounded-lg" />
                      <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" className="px-4 py-3 border rounded-lg" />
                      <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección" className="px-4 py-3 border rounded-lg" />
                      <div className="col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Guardar</button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

// Small placeholder for menu actions (keeps file simple without heavy menu code)
const MenuPlaceholder: React.FC = () => (
  <div className="p-1 rounded hover:bg-gray-100">
    <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
  </div>
);
