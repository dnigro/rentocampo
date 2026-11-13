# Formato compartido de cuenta — Preview

Mi cuenta, Mi perfil, Mis campos, Mis servicios rurales, Favoritos, Mensajes y Reporte gerencial utilizan una hoja de estilo común, limitada al marco Preview y a account-workspace. Jerarquía de títulos 34/28 px, encabezados celestes, tarjetas blancas con bordes suaves, iconos rurales azules, texto legible y botones primarios coral. Se conservan estados de peligro, controles deshabilitados y foco de teclado. Los formularios de publicación mantienen su adaptación anterior.

La capa account-readability permite sustituir las reglas heredadas sin cambiar sus estilos productivos. Los formularios, consultas, acciones de guardado, acceso privado y autorización gerencial no se modifican.

Web desktop / Web móvil / App Lite: el layout de dashboard aplica account-workspace; Lite reutiliza esos módulos mediante LiteWorkflowLayout. Su portada usa las mismas reglas de tarjetas y texto. Mensajes comparte InboxShell; el reporte conserva GerencialExplorador y sus permisos de servidor.

Inspección visual local puntual a 1440 y 320 px del dashboard (estructura de referencia), PerfilForm y GerencialExplorador (componentes reales con datos de muestra vacíos), además del contenedor Lite: sin desbordes ni errores JavaScript. Títulos de 34/28 px verificados. No se enviaron formularios ni se usó una sesión real. La ruta temporal de inspección se retiró antes del build final. No acredita operaciones autenticadas de usuario ni el reporte con datos productivos.

Sin suites WT/UAT o npm test por instrucción del usuario. Entrega exclusivamente en Preview, sin cambios productivos.
