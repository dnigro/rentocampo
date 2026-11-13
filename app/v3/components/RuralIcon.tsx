import { Beef, Bird, Building2, Droplets, Fence, HeartPulse, Landmark, MapPinned, Radio, Ruler, ShieldCheck, Sprout, Tractor, Trees, Truck, Warehouse, Wheat, Wrench, Zap } from "lucide-react";

// Lucide (ISC), already installed: one consistent icon family, without remote assets.
const icons = {
 agricola: Wheat, ganadera: Beef, mixta: Sprout, forestal: Trees,
 cosecha: Wheat, siembra: Sprout, pulverizacion: Droplets, fertilizacion: Sprout,
 maquinaria: Tractor, transporte: Truck, hoteleria_vacuna: Beef, granja: Bird,
 silos_almacenamiento: Warehouse, acondicionamiento_granos: Wheat, riego: Droplets,
 construcciones: Building2, electricidad_iluminacion: Zap, tecnologia_automatizacion: Radio,
 conectividad_monitoreo: Radio, alambrados: Fence, veterinaria: HeartPulse,
 agronomia: Sprout, seguros_financiacion: ShieldCheck, otro: Wrench,
 campo: MapPinned, servicio: Tractor, superficie: Ruler, operacion: Landmark,
};
export default function RuralIcon({ name, size = 18 }: { name: string; size?: number }) {
 const Icon = icons[name as keyof typeof icons] || Wrench;
 return <Icon size={size} strokeWidth={1.7} aria-hidden="true"/>;
}
