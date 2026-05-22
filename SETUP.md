# Librería 3D — Guía de configuración

## 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Haz clic en **"New project"** y rellena los datos:
   - **Name**: libreria-3d (o el nombre que prefieras)
   - **Database Password**: elige una contraseña segura
   - **Region**: elige la más cercana a ti (ej. EU West)
3. Espera a que el proyecto se inicialice (~2 minutos).

## 2. Ejecutar el esquema SQL

1. En el panel de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral).
2. Haz clic en **"New query"**.
3. Copia y pega el contenido del archivo `supabase/schema.sql`.
4. Haz clic en **"Run"** (o pulsa `Ctrl+Enter`).
5. Deberías ver el mensaje: *"Success. No rows returned"*.

Esto creará las tablas `profiles`, `books`, `ratings` y `comments`, activará las políticas de seguridad (RLS) y configurará el trigger automático para crear perfiles al registrarse.

## 3. Configurar las variables de entorno

1. En Supabase, ve a **Settings → API**.
2. Copia los valores de:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY`
3. En la raíz del proyecto, crea un archivo `.env`:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus valores reales:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Importante**: El archivo `.env` nunca debe subirse a Git. Está incluido en `.gitignore` por defecto.

## 4. Ejecutar en local

### Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### Otros comandos

```bash
# Compilar para producción
npm run build

# Vista previa de la build de producción
npm run preview
```

## 5. Desplegar en Vercel

### Opción A: Desde la interfaz web de Vercel

1. Sube el proyecto a GitHub (si aún no lo has hecho):
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New → Project"**.
4. Importa tu repositorio de GitHub.
5. En la sección **"Environment Variables"**, añade:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anónima
6. Haz clic en **"Deploy"**.

### Opción B: Desde la terminal con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar (sigue las instrucciones en pantalla)
vercel

# Para despliegues futuros
vercel --prod
```

### Configurar el dominio personalizado (opcional)

En el panel de Vercel, ve a **Settings → Domains** y añade tu dominio.

---

## Notas adicionales

### Autenticación de correo electrónico

Por defecto, Supabase requiere confirmación de correo. Para deshabilitar esto durante el desarrollo:

1. Ve a **Authentication → Providers → Email**.
2. Desactiva **"Confirm email"**.

### Estructura del proyecto

```
src/
├── components/
│   ├── shelf/        # Componentes 3D (Three.js / R3F)
│   └── ui/           # Componentes de interfaz
├── contexts/         # Contextos de React (autenticación)
├── lib/              # Configuración de Supabase
└── pages/            # Páginas de la aplicación
```

### Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 5 | Bundler / Dev server |
| Three.js | 0.169 | Motor 3D |
| @react-three/fiber | 8 | React + Three.js |
| @react-three/drei | 9 | Helpers para R3F |
| Supabase | 2 | Backend / Auth / DB |
| Tailwind CSS | 3 | Estilos |
| React Router | 6 | Navegación |
