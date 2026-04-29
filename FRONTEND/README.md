# Frontend - Sistema de Gestión de Biblioteca

Frontend de React + TypeScript para la gestión de biblioteca con autenticación JWT y control de roles.

## Características

- ✅ Autenticación con JWT (Login/Register)
- ✅ Rutas protegidas por rol (Admin/Usuario)
- ✅ Gestión de Clientes (CRUD)
- ✅ Gestión de Libros (CRUD)
- ✅ Gestión de Préstamos con control de permisos
  - Admin: puede eliminar préstamos
  - Usuario: solo puede crear, ver y registrar devoluciones
- ✅ Estado global con Zustand
- ✅ Requests HTTP con Axios

## Instalación

### 1. Instalar dependencias

```bash
cd D:\seminario\FRONTEND
npm install
# o
pnpm install
```

### 2. Configurar la API

Asegúrate de que la API backend esté corriendo en `http://localhost:5000`.

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
# o
pnpm dev
```

El frontend se abrirá en http://localhost:5173

## Estructura de archivos

```
FRONTEND/
├── src/
│   ├── stores/
│   │   └── authStore.ts          # Estado global (Zustand)
│   ├── pages/
│   │   ├── LoginPage.tsx         # Página de login/registro
│   │   ├── HomePage.tsx          # Página de inicio
│   │   ├── ClientesPage.tsx      # Gestión de clientes
│   │   ├── LibrosPage.tsx        # Gestión de libros
│   │   └── PrestamosPage.tsx     # Gestión de préstamos
│   ├── components/
│   │   ├── Navbar.tsx            # Barra de navegación
│   │   └── ProtectedRoute.tsx    # Componente para rutas protegidas
│   ├── App.tsx                   # Router principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Estilos globales
├── index.html                    # HTML principal
├── vite.config.ts                # Configuración de Vite
├── tsconfig.json                 # Configuración de TypeScript
└── package.json                  # Dependencias

## Credenciales de prueba

Admin:
- Email: `admin@biblioteca.local`
- Contraseña: `admin123`

Usuario normal (para registrar):
- Email: `user@example.com`
- Contraseña: `pass123`
- Nombre: `Usuario Test`

## Build para producción

```bash
npm run build
# o
pnpm build
```

Los archivos compilados estarán en `dist/`.

## Notas sobre seguridad

- El token JWT se almacena en `localStorage` (considera usar `httpOnly` cookies en producción)
- Los roles se incluyen en los claims del JWT
- Las rutas protegidas validan el rol del usuario antes de permitir acciones sensibles

## Troubleshooting

- **Error de CORS**: Asegúrate de que el backend tiene CORS configurado para permitir `http://localhost:5173`
- **Token expirado**: Recarga la página e intenta login nuevamente
- **Permisos denegados**: Verifica que tienes el rol correcto (admin para eliminar)
