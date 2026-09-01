import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrecioHa(precio: number, moneda: "USD" | "ARS") {
  const num = precio.toLocaleString("es-AR");
  return moneda === "USD" ? `USD ${num}/ha` : `$ ${num}/ha`;
}

export function formatHectareas(ha: number) {
  return ha.toLocaleString("es-AR") + " ha";
}
