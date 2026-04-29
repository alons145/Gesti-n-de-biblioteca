import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  descripcion?: string;
  disponible: boolean;
  fecha_creacion: string;
}

const API_URL = 'http://localhost:5000/api';

const categorias = ['Clásicos', 'Fantasía', 'Romance', 'Psicológica', 'Drama', 'Distopía', 'Realismo Mágico'];

export const LibrosPage: React.FC = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [filtered, setFiltered] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('all');

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ titulo: '', autor: '', categoria: '', descripcion: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const { token, handleUnauthorized } = useAuthStore();

  useEffect(() => {
    fetchLibros();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [libros, search, category, availability]);

  const fetchLibros = async () => {
    if (!token) {
      handleUnauthorized();
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/libros`, { headers: { Authorization: `Bearer ${token}` } });
      setLibros(res.data);
      setError(null);
    } catch (e: any) {
      if (e.response?.status === 401) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(e.response?.data?.error || 'Error cargando libros');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let out = [...libros];
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((l) => l.titulo.toLowerCase().includes(s) || l.autor.toLowerCase().includes(s));
    }
    if (category) out = out.filter((l) => l.categoria === category);
    if (availability === 'available') out = out.filter((l) => l.disponible);
    if (availability === 'borrowed') out = out.filter((l) => !l.disponible);
    setFiltered(out);
  };

  const openModal = () => {
    setEditingId(null);
    setForm({ titulo: '', autor: '', categoria: '', descripcion: '' });
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setForm({ titulo: '', autor: '', categoria: '', descripcion: '' });
    setEditingId(null);
  };

  const startEdit = (libro: Libro) => {
    setEditingId(libro.id);
    setForm({
      titulo: libro.titulo,
      autor: libro.autor,
      categoria: libro.categoria,
      descripcion: libro.descripcion || '',
    });
    setIsOpen(true);
  };

  const submitLibro = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) {
      handleUnauthorized();
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/libros/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/libros`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchLibros();
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || (editingId ? 'Error actualizando libro' : 'Error creando libro'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLibro = async (libro: Libro) => {
    if (!window.confirm(`¿Eliminar "${libro.titulo}"? Esta acción no se puede deshacer.`)) return;
    if (!token) {
      handleUnauthorized();
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    try {
      await axios.delete(`${API_URL}/libros/${libro.id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchLibros();
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error eliminando libro');
    }
  };

  const disponiblesCount = libros.filter((l) => l.disponible).length;
  const prestadosCount = libros.filter((l) => !l.disponible).length;

  const BookCard: React.FC<{ libro: Libro }> = ({ libro }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border-t-4 border-green-500">
      <div className="flex justify-between items-start">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${libro.disponible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {libro.disponible ? <CheckCircleIcon className="w-4 h-4" /> : <span>⚠️</span>}
          {libro.disponible ? 'Disponible' : 'Prestado'}
        </span>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="p-1 rounded hover:bg-gray-100">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
          </Menu.Button>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border rounded-md shadow-lg focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => startEdit(libro)} className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}>
                      <PencilSquareIcon className="w-4 h-4 inline mr-2" /> Editar
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => handleDeleteLibro(libro)} className={`w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}>
                      <TrashIcon className="w-4 h-4 inline mr-2" /> Eliminar
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-3 mb-1 truncate">{libro.titulo}</h3>
      <p className="text-sm text-gray-600 mb-4">por <span className="text-gray-900 font-semibold">{libro.autor}</span></p>
      <p className="text-sm text-gray-600 mb-6 line-clamp-3">{libro.descripcion || 'Sin descripción'}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{libro.categoria}</span>
        <span>Añadido: {new Date(libro.fecha_creacion).toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3"><span className="text-3xl">📚</span> Catálogo de Libros</h1>
            <p className="text-gray-600 mt-1">Profesional · Escalable · Fácil de usar</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openModal} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow hover:scale-[1.01] transition">
              <PlusIcon className="w-5 h-5" /> Agregar Libro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-6 bg-white rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Libros disponibles</p>
              <p className="text-2xl font-bold text-green-600">{disponiblesCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Libros en préstamo</p>
              <p className="text-2xl font-bold text-orange-600">{prestadosCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o autor..." className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-200" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="borrowed">Prestados</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)}><XMarkIcon className="w-5 h-5" /></button></div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length ? filtered.map((libro) => <BookCard key={libro.id} libro={libro} />) : (
              <div className="col-span-full bg-white rounded-xl shadow p-12 text-center">
                <p className="text-xl text-gray-600">No se encontraron libros</p>
                <p className="text-gray-400 mt-2">Intenta ajustar los filtros o añade un nuevo libro.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal: Agregar/Editar Libro */}
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">{editingId ? 'Editar libro' : 'Agregar nuevo libro'}</Dialog.Title>
                    <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitLibro}>
                      <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título" className="col-span-2 px-4 py-3 border rounded-lg" />
                      <input required value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Autor" className="px-4 py-3 border rounded-lg" />
                      <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-4 py-3 border rounded-lg">
                        <option value="">Categoría</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción (opcional)" className="px-4 py-3 border rounded-lg col-span-2" />

                      <div className="col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">{isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}</button>
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

