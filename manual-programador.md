# Manual del Programador: Sistema de Gestión de Clubes de Pádel

## 1. Introducción

Este manual proporciona la documentación técnica para el desarrollo y mantenimiento del sistema de gestión de clubes de pádel. La aplicación está diseñada para facilitar la administración de clubes de pádel, permitiendo a los usuarios reservar pistas, inscribirse en torneos, formar parte de grupos sociales y participar en la comunidad.

### 1.1 Visión General

El sistema está compuesto por un backend en Flask con SQLAlchemy y un frontend desarrollado con Ionic y React. La arquitectura sigue un patrón cliente-servidor con una API REST como interfaz entre ambos componentes.

### 1.2 Alcance del Sistema

El sistema incluye funcionalidades para:
- Gestión de usuarios y perfiles
- Administración de clubes y pistas
- Sistema de reservas
- Gestión de torneos y competiciones
- Funcionalidades sociales (grupos, publicaciones, seguimiento)
- Notificaciones y recordatorios

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
+----------------+     +-----------------+     +------------------+
|                |     |                 |     |                  |
|  Cliente       |     |  Servidor API   |     |  Base de Datos   |
|  (Ionic/React) | <-> |  (Flask/Python) | <-> |  (PostgreSQL)    |
|                |     |                 |     |                  |
+----------------+     +-----------------+     +------------------+
```

### 2.2 Componentes Principales

#### Backend (Flask/Python)
- **Servidor API**: Implementado en Flask
- **ORM**: SQLAlchemy para mapeo y operaciones de base de datos
- **Serialización**: Marshmallow para la serialización/deserialización de datos
- **Autenticación**: Sistema JWT para la gestión de sesiones y autenticación

#### Frontend (Ionic/React)
- **Framework UI**: Ionic con React
- **Gestión de Estado**: Context API para gestión global del estado
- **Routing**: React Router para la navegación
- **HTTP Client**: Axios para las comunicaciones con el backend

## 3. Configuración del Entorno de Desarrollo

### 3.1 Requisitos Previos

- Python 3.8 o superior
- Node.js 14.x o superior
- npm 6.x o superior
- PostgreSQL o MySQL
- Git

### 3.2 Configuración del Backend

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/nombre-usuario/padel-club-management.git
   cd padel-club-management/backend
   ```

2. Crear y activar un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows
   venv\Scripts\activate
   # En macOS/Linux
   source venv/bin/activate
   ```

3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con los valores apropiados para el entorno
   ```

5. Inicializar la base de datos:
   ```bash
   flask db upgrade
   flask seed-db  # Si existe comando para poblar con datos de prueba
   ```

6. Iniciar el servidor de desarrollo:
   ```bash
   flask run
   ```

### 3.3 Configuración del Frontend

1. Navegar al directorio del frontend:
   ```bash
   cd ../frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con los valores apropiados para el entorno
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

## 4. Estructura del Proyecto

### 4.1 Estructura del Backend

```
backend/
├── app/
│   ├── __init__.py          # Inicialización de la aplicación
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── usuario.py       # Modelo de usuario
│   │   ├── club.py          # Modelo de club
│   │   ├── pista.py         # Modelo de pista
│   │   ├── reserva.py       # Modelo de reserva
│   │   ├── torneo.py        # Modelo de torneo
│   │   └── ...
│   ├── schemas/             # Esquemas Marshmallow
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── club.py
│   │   └── ...
│   ├── routes/              # Endpoints API
│   │   ├── __init__.py
│   │   ├── auth.py          # Rutas de autenticación
│   │   ├── usuarios.py      # Rutas de usuarios
│   │   ├── clubes.py        # Rutas de clubes
│   │   └── ...
│   ├── services/            # Lógica de negocio
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── reservas.py
│   │   └── ...
│   ├── utils/               # Utilidades
│   │   ├── __init__.py
│   │   ├── decorators.py    # Decoradores personalizados
│   │   ├── validators.py    # Validadores
│   │   └── ...
│   └── config.py            # Configuración
├── migrations/              # Migraciones Alembic
├── tests/                   # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   └── ...
├── .env                     # Variables de entorno (no en VCS)
├── .env.example             # Plantilla de variables de entorno
├── requirements.txt         # Dependencias
└── wsgi.py                  # Punto de entrada WSGI
```

### 4.2 Estructura del Frontend

```
frontend/
├── public/
│   ├── assets/
│   │   ├── icon/
│   │   └── ...
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── ExploreContainer.css
│   │   └── ExploreContainer.tsx
│   ├── context/             # Contextos de React
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   ├── interfaces/          # Definiciones de tipos TypeScript
│   │   └── index.ts
│   ├── pages/               # Páginas/Vistas de la aplicación
│   │   ├── css/
│   │   │   ├── Home.css
│   │   │   ├── Login.css
│   │   │   └── ...
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── CalendarView.tsx
│   │   ├── ManageCourts.tsx
│   │   ├── ManageUsers.tsx
│   │   ├── Reservas.tsx
│   │   └── ...
│   ├── services/            # Servicios API
│   │   ├── api.service.ts   # Cliente API base
│   │   ├── auth.service.ts  # Servicio de autenticación
│   │   └── ...
│   ├── theme/               # Estilos globales
│   │   └── variables.css
│   ├── utils/               # Utilidades
│   │   └── constants.ts     # Constantes del sistema
│   ├── App.tsx              # Componente raíz
│   ├── App.test.tsx         # Tests
│   ├── main.tsx             # Punto de entrada
│   ├── setupTests.ts        # Configuración de tests
│   └── vite-env.d.ts        # Definiciones para Vite
├── android/                 # Configuración para Android
├── ios/                     # Configuración para iOS
├── .browserslistrc
├── .gitignore
├── capacitor.config.ts      # Configuración de Capacitor
├── ionic.config.json        # Configuración de Ionic
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite
```

## 5. Modelos de Datos

Los principales modelos de datos en el sistema son:

### 5.1 Usuario

```python
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    id_rol = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)
    id_club = db.Column(db.Integer, db.ForeignKey('club.id'))
    avatar_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    # Relaciones con otros modelos
```

### 5.2 Club

```python
class Club(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    direccion = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(100))
    horario_apertura = db.Column(db.String(5), nullable=False)
    horario_cierre = db.Column(db.String(5), nullable=False)
    id_administrador = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)
    imagen_url = db.Column(db.String(255))
    # Relaciones con otros modelos
```

### 5.3 Pista

```python
class Pista(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, nullable=False)
    id_club = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # Indoor, Outdoor, etc.
    estado = db.Column(db.String(50), nullable=False)  # disponible, mantenimiento, cerrada
    precio_hora = db.Column(db.Float, nullable=False)
    iluminacion = db.Column(db.Boolean, default=True)
    techada = db.Column(db.Boolean, default=False)
    # Relaciones con otros modelos
```

### 5.4 Reserva

```python
class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_pista = db.Column(db.Integer, db.ForeignKey('pista.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    precio_total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), nullable=False)  # pendiente, confirmada, cancelada, completada
    notas = db.Column(db.Text)
    # Relaciones con otros modelos
```

## 6. API Endpoints

A continuación se listan los principales endpoints de la API:

### 6.1 Autenticación

- `POST /login`: Iniciar sesión
- `POST /create-user`: Registrar nuevo usuario
- `POST /logout`: Cerrar sesión
- `PUT /update-password`: Actualizar contraseña

### 6.2 Usuarios

- `GET /user/{id}`: Obtener información de un usuario
- `PUT /user/{id}`: Actualizar información de un usuario
- `GET /users`: Listar usuarios

### 6.3 Clubes

- `GET /clubs`: Listar clubes
- `GET /clubs?id_administrador={id}`: Buscar clubes por administrador
- `POST /clubs`: Crear un nuevo club
- `GET /clubs/{id}`: Obtener información de un club
- `PUT /clubs/{id}`: Actualizar información de un club
- `DELETE /clubs/{id}`: Eliminar un club

### 6.4 Pistas

- `GET /clubs/{id}/pistas`: Listar pistas de un club
- `POST /clubs/{id}/pistas`: Crear una nueva pista
- `GET /pistas/{id}`: Obtener información de una pista
- `PUT /pistas/{id}`: Actualizar información de una pista
- `DELETE /pistas/{id}`: Eliminar una pista
- `GET /pistas/{id}/disponibilidad`: Consultar disponibilidad de una pista

### 6.5 Reservas

- `GET /reservas`: Listar reservas (filtrable por usuario, club, fecha)
- `POST /crear-reserva`: Crear una reserva
- `PUT /modificar-reserva/{id}`: Modificar una reserva
- `DELETE /eliminar-reserva/{id}`: Cancelar/eliminar una reserva

### 6.6 Gestión de Membresías

- `POST /add-club-member`: Añadir un usuario como socio del club

## 7. Sistema de Autenticación

El sistema utiliza un mecanismo de autenticación basado en tokens JWT.

### 7.1 Flujo de Autenticación

1. El usuario envía credenciales (email/password) al endpoint `/login`
2. El servidor verifica las credenciales y genera un token JWT
3. El frontend almacena el token en localStorage
4. Para solicitudes autenticadas, el token se envía en el header `Authorization: Bearer {token}`
5. El servidor verifica el token en cada solicitud protegida

### 7.2 Estructura de Almacenamiento en Cliente

```typescript
// Claves de almacenamiento
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
};
```

### 7.3 Contexto de Autenticación

El frontend utiliza un contexto React (`AuthContext`) para gestionar el estado de autenticación:

```typescript
// Ejemplo simplificado de AuthContext
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

## 8. Gestión de Pistas y Reservas

### 8.1 Modelo de Disponibilidad

Las pistas tienen un estado que puede ser:
- `disponible`: La pista está disponible para su uso
- `mantenimiento`: La pista está en mantenimiento
- `cerrada`: La pista está cerrada

### 8.2 Flujo de Reserva

1. El usuario selecciona un club
2. Selecciona una pista
3. Selecciona una fecha
4. El sistema muestra las franjas horarias disponibles
5. El usuario selecciona una o varias franjas
6. El sistema calcula el precio total
7. El usuario confirma la reserva

### 8.3 Validación de Disponibilidad

El sistema verifica la disponibilidad en tiempo real, considerando:
- Horario de apertura y cierre del club
- Estado de la pista (solo disponibles)
- Reservas existentes para evitar duplicidades

## 9. Guía de Testing

### 9.1 Testing del Backend

Los tests del backend utilizan pytest. Para ejecutar los tests:

```bash
cd backend
pytest
```

### 9.2 Testing del Frontend

Los tests del frontend utilizan Jest y React Testing Library. Para ejecutar los tests:

```bash
cd frontend
npm test
```

### 9.3 Testing End-to-End

Los tests end-to-end utilizan Cypress. Para ejecutar los tests:

```bash
cd frontend
npm run test.e2e
```

## 10. Despliegue

### 10.1 Despliegue del Backend

1. Preparar el entorno:
   ```bash
   cd backend
   pip install gunicorn  # o uwsgi
   ```

2. Configurar variables de entorno para producción en el servidor.

3. Ejecutar migraciones:
   ```bash
   flask db upgrade
   ```

4. Iniciar el servidor:
   ```bash
   gunicorn -w 4 wsgi:app
   ```

### 10.2 Despliegue del Frontend

1. Construir la aplicación:
   ```bash
   cd frontend
   npm run build
   ```

2. Desplegar los archivos generados en el directorio `dist/` a su servidor web o servicio de hosting.

### 10.3 Despliegue con Docker

Se puede utilizar Docker para simplificar el despliegue:

```dockerfile
# Ejemplo de Dockerfile para el backend
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "wsgi:app"]
```

## 11. Contribuir al Proyecto

### 11.1 Flujo de Trabajo de Git

1. Crear una rama desde `develop` para la nueva funcionalidad:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nombre-funcionalidad
   ```

2. Desarrollar y hacer commits regulares:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   ```

3. Enviar cambios al repositorio:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```

4. Crear un Pull Request a `develop`.

### 11.2 Estándares de Código

- **Backend**: Seguir PEP 8 para Python
- **Frontend**: Utilizar ESLint con la configuración del proyecto

### 11.3 Documentación

Documentar todo el código nuevo siguiendo los estándares existentes:
- **Python**: Docstrings de estilo Google
- **TypeScript/JavaScript**: JSDoc

## 12. Recursos y Referencias

### 12.1 Documentación Oficial

- [Flask](https://flask.palletsprojects.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Marshmallow](https://marshmallow.readthedocs.io/)
- [React](https://reactjs.org/docs/getting-started.html)
- [Ionic Framework](https://ionicframework.com/docs)

### 12.2 Recursos Internos

- Repositorio de código: `https://github.com/nombre-usuario/padel-club-management`
- Documentación de API: `/api/docs` (Swagger UI)

## 13. Solución de Problemas Comunes

### 13.1 Backend

- **Problemas de migración de base de datos**:
  ```bash
  flask db stamp head  # Marcar la base de datos como actualizada
  flask db migrate     # Crear nueva migración
  flask db upgrade     # Aplicar migración
  ```

- **Resetear la base de datos de desarrollo**:
  ```bash
  flask db downgrade base  # Revertir todas las migraciones
  flask db upgrade         # Aplicar migraciones desde cero
  flask seed-db            # Repoblar con datos de prueba
  ```

### 13.2 Frontend

- **Problemas de caché**:
  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

- **Problemas con Ionic/Capacitor**:
  ```bash
  npx cap sync  # Sincronizar cambios con proyectos nativos
  ```

---

Este manual será actualizado regularmente a medida que el proyecto evolucione. Para cualquier duda o sugerencia, contactar al equipo de desarrollo.
