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
import { FeedbackBanner } from '../components/FeedbackBanner';

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
  const [success, setSuccess] = useState<string | null>(null);

  const { token, user, handleUnauthorized } = useAuthStore();
  const actorLabel = user?.role === 'admin' ? 'administrador' : 'usuario';

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
      setSuccess(editingId ? `Libro actualizado correctamente por ${actorLabel}.` : `Libro creado correctamente por ${actorLabel}.`);
      setError(null);
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || (editingId ? 'Error actualizando libro' : 'Error creando libro'));
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLibro = async (libro: Libro) => {
    if (user?.role !== 'admin') {
      setError('Solo los administradores pueden eliminar libros');
      return;
    }
    if (!window.confirm(`¿Eliminar "${libro.titulo}"? Esta acción no se puede deshacer.`)) return;
    if (!token) {
      handleUnauthorized();
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    try {
      await axios.delete(`${API_URL}/libros/${libro.id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchLibros();
      setSuccess('Libro eliminado correctamente por el administrador.');
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      setError(err.response?.data?.error || 'Error eliminando libro');
      setSuccess(null);
    }
  };

  const disponiblesCount = libros.filter((l) => l.disponible).length;
  const prestadosCount = libros.filter((l) => !l.disponible).length;

  const BookCard: React.FC<{ libro: Libro }> = ({ libro }) => (
    <div className="grid-card border-t-4 border-t-emerald-500">
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
                {user?.role === 'admin' && (
                  <Menu.Item>
                    {({ active }) => (
                      <button onClick={() => handleDeleteLibro(libro)} className={`w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}>
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
    <div className="app-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="hero-panel mb-8 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_24%)]" />
              <div className="relative z-10 max-w-2xl">
                <div className="toolbar-chip mb-4">Libros · Catálogo editorial</div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Un catálogo más limpio, actual y fácil de explorar.</h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">Gestiona títulos y disponibilidad en una experiencia visual más premium, lista para crecer con nuevos módulos.</p>
              </div>
            </div>
            <div className="border-t border-slate-200/80 bg-slate-50/80 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="metric-tile">
                  <p className="text-sm font-semibold text-slate-500">Disponibles</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">{disponiblesCount}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-sm font-semibold text-slate-500">En préstamo</p>
                  <p className="mt-2 text-3xl font-bold text-amber-600">{prestadosCount}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={openModal} className="action-primary w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                  <PlusIcon className="w-5 h-5" /> Agregar libro
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div className="metric-tile flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o autor..." className="form-field pl-12" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-field w-auto min-w-[180px]">
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="form-field w-auto min-w-[150px]">
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="borrowed">Prestados</option>
            </select>
          </div>
          <div className="metric-tile flex items-center justify-center">
            <p className="text-sm text-slate-500">Catálogo total: <span className="font-semibold text-slate-950">{libros.length}</span></p>
          </div>
        </div>

        {success && <FeedbackBanner type="success" title="Libros" message={success} onClose={() => setSuccess(null)} />}
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)}><XMarkIcon className="w-5 h-5" /></button></div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse grid-card h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length ? filtered.map((libro) => <BookCard key={libro.id} libro={libro} />) : (
              <div className="col-span-full grid-card py-12 text-center">
                <p className="text-xl font-semibold text-slate-700">No se encontraron libros</p>
                <p className="mt-2 text-slate-500">Intenta ajustar los filtros o añade un nuevo libro.</p>
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
                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2rem] bg-white p-6 text-left align-middle shadow-[0_30px_90px_rgba(15,23,42,0.18)] transition-all sm:p-8">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-950">{editingId ? 'Editar libro' : 'Agregar nuevo libro'}</Dialog.Title>
                    <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitLibro}>
                      <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título" className="form-field col-span-2" />
                      <input required value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Autor" className="form-field" />
                      <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="form-field">
                        <option value="">Categoría</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción (opcional)" className="form-field col-span-2" />

                      <div className="col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={closeModal} className="action-secondary">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="action-primary bg-gradient-to-r from-emerald-600 to-cyan-600">{isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}</button>
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

