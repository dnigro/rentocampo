import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/campos", "/campos/", "/alquiler-de-campos/"],
      disallow: [
        "/api/",
        "/dashboard",
        "/favoritos",
        "/mensajes",
        "/mis-campos",
        "/perfil",
        "/auth/",
      ],
    },
    sitemap: "https://rentocampo.com/sitemap.xml",
    host: "https://rentocampo.com",
  };
}
