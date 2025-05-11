# Sasseri Frontend

Frontend para la aplicación de administración de bares y restaurantes Sasseri 2.0.

## Descripción General del proyecto donde se usa este front

Aplicativo web diseñado para la administración de bares y restaurantes, pensado en correr en entornos locales, es decir en el equipo del negocio.

El administrador podrá gestionar su inventario y el precios de los productos, también podrá crear y actualizar cuentas por mesa y por cliente de la mesa, de tal manera que puede cargar la cuenta del cliente.  

En su vista de escritorio, el administrador, 

parte de la vista principal donde se ve las mesas configuradas, tiene la opción de visualizar en el costado derecho ocupando uno 35% del ancho de la vista, el listado de las canciones solicitadas que se ordenaran de 1 por mesa activa, con la opción de marcar como atendida la canción solicitada para que de esa manera salga del listado de la vista y quede guardada el registro histórico.

El administrador podrá realizar la facturación o cobro de las cuentas al final y el sistema le mostrará la información de la factura con la opción de imprimirla. El sistema debe contar con un módulo donde pueda ver el informe de ventas realizadas con las opciones de aplicar filtros (Nombre, rango de fecha, mesa, cliente, número de factura).

Por otro lado están los clientes que podrán escanear un código QR en su mesa el cual le pedirá que ingrese su nombre con lo que se le crea su cuenta ligada a la mesa y se le muestra una vista con el listado de productos ofrecidos en una presentación visual de rejilla con dos columnas y varias filas donde los productos estarán en las casillas de las filas, mostrando la imagen cargada del producto con el precio debajo y al darle click se muestra un con circulo en la esquina superior derecha de la imagen del producto con la cantidad de los productos agregados y se incrementa cada que se de click al producto, de esta manera se cargan al pedido que se creará cuado el cliente de click a un botón que estará fijo en la parte inferior de la vista con el mensaje confirmar pedido, al darle click le muestra la lista de los productos del pedido con la cantidad solicitada en frente de cada registro y la opción de confirmar pedido o cancelar. En caso de confirmar se notifica al administrador la creación del pedido. Los clientes tendrán la opción de cambiar a otra pestaña o vista, donde se mira el listado de canciones solicitadas por la mesa con el nombre de quien la solicita, si es o no para karaoke y listado en el orden en que fue solicitado y con la opción de solicitar una canción agregándola a la lista en el orden que corresponda (Se organiza la lista de canciones pedidas en rondas en el orden de la mesa, por ejemplo canción 1 de la mesa 3, canción 2 de la mesa 4, canción 3 de la mesa 5, canción 4 de la mesa 3, canción 5 de la mesa 4, canción 6 de la mesa 5), cuando hay varias cuentas de una misma mesa, las canciones se organizan de una a la vez por cliente de la mes que pida, pero el orden de canciones por mesa se mantiene.

## Características específicas del aplicativo

### Vista desktop para el administrador:

1. Sistema de login y creación de usuarios.
2. Módulo de administración de productos donde pueda cargar el nombre del producto, el precio de venta, código, observaciones, una imagen y las existencias iniciales, y la opción de registrar ingresos o egresos de existencias a productos ya creados.
3. Módulo para configurar las mesas que se atenderán.
4. Módulo para ver los clientes que se han registrado y crear nuevos.
5. Módulo de atención principal, donde en el lado derecho, ocupando el 65% de la vista, se ven una grid con las mesas configuradas a atender. Al dar click a una mesa, visualizará los detalles de la cuenta en curso o puede crearla manualmente, en general debe poder crear cuentas por mesa y cliente y agregar productos a la cuenta ya que puede que algunos clientes no deseen usar el app desde su celular. De igual manera puede cerrar la cuenta para generar la factura.
   
   En el lado izquierdo de la vista, ocupando un 35% el espacio y con la opción de ocultar colapsándola, se tiene la lista de las canciones pedidas por los clientes donde se puede marcar como atendida o eliminar los registros y también puede agregar manualmente canciones al listado.
        
### Vista mobil para los clientes:

1. Al escanear el código QR de la mesa el cliente será enviado a la ruta local de su mesa en su navegador web donde se le solicita inicialmente que ingrese su nombre para poder acceder. Este proceso crea una nueva cuenta o factura al cliente y lo liga a su mesa para efectos de la gestión de canciones.
2. Después de ingresar el nombre, el cliente es dirigido a la vista para realizar la solicitud de productos que se presentaran en un grid de 2 columnas y la cantidad de filas que se requieran. Cada producto sera presentado mostrando la imagen configurada con el precio en la parte inferior. Al dar click a un producto se muestra un circulo en la parte superior izquierda mostrando la cantidad de productos solicitados hasta el momento y se incrementa en uno cada que se da click o se "toca" el producto y al dar click en el circulo se descuenta de uno.
   
   En la parte de abajo de la vista de solicitar productos va estar fijo un botón de "confirmar pedido" que se activa si ha productos seleccionados, al darle click, mostrara un listado con los nombres de los productos con la cantidad solicitada en frente y con dos botones abajo con la opción de cancelar o confirmar.
        
3. En la parte de arriba de la vista para solicitar productos se tiene la opción de cambiar a la vista de canciones donde se ve el listado de canciones solicitadas por todas las mesas, puede filtrar las canciones de su mesa y puede agregar mas canciones a lista. El orden de las canciones lo define el sistema.
4. El usuario puede volver a la vista de solicitud de productos.
5. En la vista de solicitud de productos debe poder dar click en un botón que le muestre su cuenta actual en forma de listado (no grilla con imágenes).
6. Si el administrador cierra la cuenta, el usuario es dirigido a la vista donde se le solicita el nombre y ya no podrá ver los registros de la cuenta anterior.

## REGISTRO DE CLIENTES

En la vista mobil diseñada para los clientes del bar a la cual llegan despues de escanear el codigo QR de la mesa, su ruta en el sistema es table/:tableId donde se envia el id de la mesa registrado en la base de datos. En esta vista el cliente ingresa su nombre y da click en continuar. Este proceso debe registrar al cliente y crear una nueva orden en el sistema (tabla orders) ligada al cliente y su mesa y marcar la mesa como ocupada. En la vista del adminstrador /admin, donde se visualizan las mesas registradas en el sistema, se debe actualizar el estado de la mesa a ocupada.
Teniendo en cuenta que se tiene creada la funcionalidad para que al darle click a una de las mesas se nos cargue  en la vista el componente que muestra los detalles de la mesa (Estado, clientes y cuenta hasta el momento), esta vista tambien debe actualizarse al momento de registrarse un cliente con los datos del cliente y la cuenta de la mesa. Se debe tener muy en cuenta que la cuenta es registrada por cliente y la mesa y no una sola por mesa, es decir que una mesa puede tener varias cuentas pertencientes a los clientes registrados en ellas.
Recuerda que se tiene implementado un servicio de socket para la actualización en tiempo real de la vista del adminstrador al registrase un cliente en una mesa y por tanto actualizando el estado de la mesa a ocupada y se debe reflectar en la vista del el adminstrador que debe poder ver los clientes registrados.

La vista del componente de gestión de clientes de la vista del administrador con la ruta /admin/customers debe reflejar los clientes que se crean cuando se registran en una mesa. En esta vista el adminstrador debe poder tener la opcion para registrar sin necesidad de ligarlo a una mesa y la opción eliminar clientes siempre y cuando no tengan una cuenta creada.

El administrador  en la vista de los detalles de la mesa de la vista /admin que se muestra al darle click en la mesa, también debe reflejarse el cambio de estado de una mesa a ocupado y mostrar el nuevo cliente registrado.


## Tecnologías utilizadas

- React con TypeScript
- Vite como bundler
- React Router para la navegación
- Zustand para gestión de estado
- TailwindCSS para estilos
- React Hook Form para formularios
- Socket.io para comunicación en tiempo real

## Instalación y Ejecución

### Requisitos Previos

- Node.js (versión recomendada: 18 o superior)
- Backend de Sasseri en ejecución (para desarrollo completo)

### Configuración Inicial

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Ajustar las variables de entorno según tu configuración local

### Ejecutar el Proyecto

Para ejecutar el cliente en modo desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción

```bash
npm run build
```

El resultado de la compilación estará en la carpeta `dist/`. 

## Estructura del Proyecto

```
bares_front/
├── public/                 # Archivos estáticos accesibles públicamente
├── src/                    # Código fuente de la aplicación
│   ├── App.tsx             # Componente principal de la aplicación
│   ├── index.css           # Estilos globales
│   ├── main.tsx            # Punto de entrada de React
│   ├── vite-env.d.ts       # Tipos para Vite
│   ├── env.d.ts            # Tipos para variables de entorno
│   ├── assets/             # Recursos (imágenes, fuentes, estilos, etc.)
│   ├── components/         # Componentes React reutilizables
│   │   ├── admin/          # Componentes específicos para la administración
│   │   │   ├── AuthDebug.tsx      # Componente para debug de autenticación
│   │   │   ├── Sidebar.tsx        # Barra lateral para el panel de administración
│   │   │   ├── TableDetail.tsx    # Detalles de una mesa
│   │   │   ├── TableGrid.tsx      # Grid de mesas disponibles
│   │   │   ├── SongRequestList.tsx # Lista de solicitudes de canciones
│   │   │   └── __tests__/         # Tests unitarios de componentes admin
│   │   │       └── TableGrid.test.tsx # Test para el componente TableGrid
│   │   ├── auth/           # Componentes de autenticación (login, registro)
│   │   │   └── ProtectedRoute.tsx  # Componente para rutas protegidas
│   │   ├── customer/       # Componentes para la vista de clientes
│   │   │   ├── OrderSummary.tsx    # Resumen de orden del cliente
│   │   │   ├── ProductGrid.tsx     # Grid de productos disponibles
│   │   │   ├── SongQueue.tsx       # Cola de canciones
│   │   │   └── SongRequestForm.tsx # Formulario para solicitar canciones
│   │   ├── realtime/       # Componentes para funcionalidades en tiempo real
│   │   └── ui/             # Componentes de interfaz de usuario genéricos
│   │       ├── Button.tsx         # Componente de botón
│   │       ├── Card.tsx           # Componente de tarjeta
│   │       ├── Icon.tsx           # Componente para mostrar iconos
│   │       ├── Input.tsx          # Componente de entrada de texto
│   │       └── icons/            # Iconos SVG y componentes de iconos
│   │           └── index.ts       # Exportaciones de iconos
│   ├── contexts/           # Contextos de React, incluido el SocketContext
│   │   └── SocketContext.tsx      # Contexto para gestión de websockets
│   ├── hooks/              # Custom hooks reutilizables
│   ├── layouts/            # Plantillas de diseño para diferentes secciones
│   │   ├── AdminLayout.tsx        # Layout para el área de administración
│   │   └── CustomerLayout.tsx     # Layout para la vista de clientes
│   ├── lib/                # Bibliotecas, hooks y utilidades internas
│   │   ├── imports.ts             # Utilidades para importación
│   │   └── utils.ts               # Funciones utilitarias generales
│   ├── pages/              # Páginas/rutas principales de la aplicación
│   │   ├── Login.tsx              # Página de inicio de sesión
│   │   ├── admin/          # Páginas del área de administración
│   │   │   ├── Customers.tsx      # Página de gestión de clientes
│   │   │   ├── Dashboard.tsx      # Dashboard principal de administración
│   │   │   ├── Products.tsx       # Página de gestión de productos
│   │   │   ├── Reports.tsx        # Página de informes y estadísticas
│   │   │   └── Tables.tsx         # Página de gestión de mesas
│   │   └── customer/       # Páginas para la vista de clientes
│   │       ├── Bill.tsx           # Página de cuenta/factura
│   │       ├── Menu.tsx           # Página de menú de productos
│   │       ├── Registration.tsx   # Página de registro para clientes
│   │       └── SongRequests.tsx   # Página para solicitudes de canciones
│   ├── services/           # Servicios para comunicación con APIs y websockets
│   │   ├── adminApi.ts            # API para funcionalidades de administración
│   │   ├── api.ts                 # Cliente base para APIs
│   │   ├── authService.ts         # Servicio de autenticación
│   │   ├── customerApi.ts         # API para funcionalidades de clientes
│   │   ├── socket.service.ts      # Implementación del servicio de sockets
│   │   └── socket/         # Módulos para la gestión de sockets
│   │       ├── events.ts          # Definiciones de eventos del socket
│   │       ├── listeners.ts       # Gestores de eventos entrantes
│   │       ├── emitters.ts        # Gestores de eventos salientes
│   │       ├── middleware.ts      # Interceptores para mensajes
│   │       └── index.ts           # Punto de entrada del servicio de socket
│   ├── stores/             # Gestión de estado global con Zustand
│   │   ├── authStore.ts           # Store para gestión de autenticación
│   │   ├── orderStore.ts          # Store para gestión de órdenes
│   │   ├── productStore.ts        # Store para gestión de productos
│   │   ├── songStore.ts           # Store para gestión de canciones
│   │   ├── tableStore.ts          # Store para gestión de mesas
│   │   └── __tests__/      # Tests unitarios para los stores
│   │       └── tableStore.test.ts # Test para el store de mesas
│   └── utils/              # Funciones utilitarias y helpers
│       ├── format.ts              # Utilidades de formateo
│       └── preload.ts             # Funciones de precarga
├── .env                    # Variables de entorno locales
├── .env.example            # Plantilla de variables de entorno
├── env                     # Archivo de entorno alternativo
├── env copy                # Copia de archivo de entorno
├── .gitignore              # Archivos y directorios ignorados por Git
├── index.html              # Punto de entrada HTML de la aplicación
├── package.json            # Dependencias y scripts del proyecto
├── package-lock.json       # Versiones exactas de dependencias
├── postcss.config.cjs      # Configuración de PostCSS para procesamiento CSS
├── README.md               # Documentación del proyecto
├── authTask.md             # Tareas para implementación de autenticación
├── tailwind.config.js      # Configuración de TailwindCSS
├── tsconfig.json           # Configuración de TypeScript para la aplicación
├── tsconfig.node.json      # Configuración de TypeScript para Node
└── vite.config.ts          # Configuración del bundler Vite
```

## Arquitectura de Tiempo Real

La aplicación implementa una arquitectura modular para la comunicación en tiempo real mediante Socket.IO:

### Estructura de Socket

- **Contexto React**: `SocketContext` proporciona acceso al socket desde cualquier componente.
- **Módulos especializados**:
  - `events.ts`: Define eventos, tipos y interfaces para la comunicación.
  - `listeners.ts`: Maneja la recepción de eventos del servidor.
  - `emitters.ts`: Gestiona el envío de eventos al servidor.
  - `middleware.ts`: Intercepta y transforma los mensajes.

### Tipado Seguro

- Interfaces TypeScript para todos los datos transmitidos.
- Definición explícita de eventos para evitar errores de cadenas.
- Tipado fuerte en callbacks para prevenir errores en tiempo de ejecución.

### Inyección de Dependencias

- El servicio Socket se implementa como singleton.
- La conexión es compartida a través del contexto de React.
- Se utilizan custom hooks para acceder a la funcionalidad desde componentes.

## Mejoras en la Implementación de Autenticación

Se han realizado importantes mejoras en el sistema de autenticación para aumentar la seguridad, rendimiento y experiencia de usuario:

### Archivos Modificados

1. **Servicio de autenticación**:
   - `src/services/authService.ts`: Mejora en la tipificación y función de renovación de tokens.

2. **Interceptores de API**:
   - `src/services/api.ts`: Implementación de un interceptor para manejar automáticamente la renovación de tokens expirados.

3. **Tipificación de servicios**:
   - Se han mejorado las interfaces para los servicios de clientes, añadiendo tipos más precisos.

4. **Protección de rutas**:
   - `src/components/auth/ProtectedRoute.tsx`: Optimización de la verificación de tokens para reducir llamadas innecesarias al servidor.

5. **Comunicación en tiempo real**:
   - `src/services/socket/events.ts`: Nuevos eventos para notificaciones de clientes.
   - `src/services/socket/listeners.ts`: Manejo de eventos para actualización de estado de mesas.

6. **Actualización automática de interfaz**:
   - `src/components/admin/TableGrid.tsx`: Implementación de actualizaciones en tiempo real.
   - `src/stores/tableStore.ts`: Añadido método para actualización de estado de mesas.

7. **Validación de formularios**:
   - `src/pages/customer/Registration.tsx`: Mejora en la validación del registro de clientes.

### Principales Mejoras

- **Renovación automática de tokens**: Los tokens expirados se renuevan automáticamente sin interrumpir la experiencia del usuario.
- **Optimización de verificaciones**: Se reduce el número de llamadas al servidor utilizando un sistema de cache temporal.
- **Tipado seguro**: Mejor tipificación para prevenir errores durante el desarrollo.
- **Validación de datos**: Validación más robusta en formularios de registro.
- **Actualizaciones en tiempo real**: Notificaciones instantáneas cuando los clientes se registran en mesas.

Para más detalles sobre la implementación de autenticación, consultar el archivo `authTask.md`.