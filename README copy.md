# Sasseri Frontend

Frontend para la aplicación de administración de bares y restaurantes Sasseri 2.0.

## Descripción General del proyecto donde se usa este front

Aplicativo web diseñado para la administración de bares y restaurantes, pensado en correr en entornos locales, es decir en el equipo del bar.

El administrador podrá gestionar su inventario y el precios de los productos, también podrá crear y actualizar cuentas por mesa y por cliente de la mesa, de tal manera que puede cargar la cuenta del cliente.  

En su vista de escritorio, el administrador, aparte de la vista principal donde se ve las mesas configuradas, tiene la opción de visualizar en el costado derecho ocupando uno 35% del ancho de la vista, el listado de las canciones solicitadas que se ordenaran de 1 por mesa activa, con la opción de marcar como atendida la canción solicitada para que de esa manera salga del listado de la vista y quede guardada el registro histórico.

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

