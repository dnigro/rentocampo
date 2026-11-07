/** Keep the common navigation on its current web/Lite surface. */
export function siteSurfaceHref(href: string, lite: boolean): string {
  if (!lite || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/lite")) return href;
  const split = href.search(/[?#]/);
  const path = split < 0 ? href : href.slice(0, split);
  const suffix = split < 0 ? "" : href.slice(split);
  if (path === "/" && suffix === "#como-funciona") return "/lite#como-funciona-lite";
  const exact: Record<string,string> = {
    "/":"/lite", "/dashboard":"/lite/perfil", "/perfil":"/lite/perfil/editar",
    "/login":"/lite/cuenta/ingresar", "/register":"/lite/cuenta/registro",
    "/mis-campos":"/lite/campos/mis-publicaciones", "/mis-campos/nuevo":"/lite/campos/publicar",
    "/mis-servicios-rurales":"/lite/servicios/mis-publicaciones", "/mis-servicios-rurales/nuevo":"/lite/servicios/publicar",
  };
  if (exact[path]) return exact[path] + suffix;
  for (const [web, app] of [["/servicios-rurales","/lite/servicios"],["/campos","/lite/campos"],["/mensajes","/lite/perfil/mensajes"]]) {
    if (path === web || path.startsWith(web + "/")) return app + path.slice(web.length) + suffix;
  }
  return href;
}
