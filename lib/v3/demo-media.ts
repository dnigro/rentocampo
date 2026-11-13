/** Existing project images, used only for explicitly labelled DEMO/reference cards. */
export function demoFieldPhoto(aptitude?: string | null) {
  return aptitude === "ganadera" ? "/image_vaca_pix.png" : aptitude === "agricola" ? "/image_trigo_pix.png" : "/hero-campo.jpeg";
}
export function demoServicePhoto(services: readonly string[] = []) {
  if (services.includes("transporte")) return "/image_truck_pix.png";
  if (services.some(value=>["veterinaria","hoteleria_vacuna","granja"].includes(value))) return "/demo-servicio-veterinaria.jpg";
  if (services.some(value=>["siembra","cosecha","agronomia","fertilizacion"].includes(value))) return "/image_trigo_pix.png";
  return "/hero-campo.jpeg";
}
