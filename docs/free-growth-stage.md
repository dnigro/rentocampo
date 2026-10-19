# RentoCampo: etapa de crecimiento sin monetización

**Alcance del PR #232, solo preview; no despliegue productivo automático.**

- Publicaciones de campos y servicios gratuitas en todos los países, incluida Argentina.
- Campos sin límite de cupos ni plan: no se consultan, incrementan ni borran eventos históricos de uso en modo gratuito.
- La interfaz oculta planes/packs en Mis campos, App Lite y formularios. La URL antigua /lite/campos/packs redirige a Mis publicaciones.
- Checkout de nuevos packs devuelve HTTP 403 con código billing_paused, incluso si alguien lo intenta directamente. Mercado Pago, sus tablas y su webhook se conservan para procesar pagos anteriores que puedan quedar pendientes.
- Los avisos automáticos de renovación quedan pausados durante el período gratuito.
- La API de campos/fotos usa sesión de usuario y políticas RLS, sin credenciales privilegiadas en modo gratis; propietarios autorizados solamente. Se mantienen controles de fotos y autorización.
- No se han borrado compras, eventos de uso, planes comerciales ni credenciales existentes.
- Antes de activar en PROD: verificar RLS en DB productiva, publicar/editar/borrar fotos, recorridos web/Lite, acceso de usuario autenticado, webhook histórico, criterios anti-spam y tráfico.
- Futura monetización: cambiar bandera, revisar compra histórica y cuotas acumuladas, comunicar con anticipación. No reactivar sin definir reglas de migración y derechos adquiridos.
