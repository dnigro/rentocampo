"use client";

import Image from "next/image";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { errorTextoPublico } from "@/lib/publication-content-guard";
import { createClient } from "@/lib/supabase/client";
import { FileText, Images, MapPinned, Sprout, WalletCards, Check, ImagePlus } from "lucide-react";
import { displayCountryName, COUNTRIES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions, type CountryCode } from "@/data/countries";
import type { CampoFormData, MonedaCampo } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { FREE_PUBLICATIONS_ENABLED } from "@/lib/commercial/free-publications";
import GeocoderInput, {
  type LugarSeleccionado,
} from "@/components/campos/GeocoderInput";

interface Props {
  campoId?: string;
  initialData?: Partial<CampoFormData>;
  fotosIniciales?: { id: string; url: string; orden: number }[];
  planNombre?: string;
  publicacionesUsadas?: number;
  publicacionesLimite?: number | null;
  publicacionesRestantes?: number | null;
  puedePublicar?: boolean;
  initialCountry?: CountryCode;
}

const APTITUDES = [
  { value: "agricola", label: "Agrícola" },
  { value: "ganadera", label: "Ganadera" },
  { value: "mixta", label: "Mixta" },
  { value: "forestal", label: "Forestal" },
  { value: "otro", label: "Otro" },
];

const DISPONIBILIDADES = [
  { value: "inmediata", label: "Inmediata" },
  { value: "campaña_próxima", label: "Campaña próxima" },
  { value: "a_convenir", label: "A convenir" },
];

export default function CampoForm({
  campoId,
  initialData,
  fotosIniciales = [],
  planNombre = "Gratis",
  publicacionesUsadas = 0,
  publicacionesLimite = 1,
  publicacionesRestantes = 1,
  puedePublicar = true,
  initialCountry = "AR",
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CampoFormData>({
    country_code: initialCountry,
    titulo: "",
    descripcion: "",
    ubicacion: "",
    provincia: "",
    departamento: "",
    localidad: "",
    hectareas: 0,
    aptitud: "agricola",
    ambiente: "",
    operacion: "alquiler",
    precio: undefined,
    moneda: initialCountry === "BR" ? "BRL" : initialCountry === "AR" ? "USD" : COUNTRIES[initialCountry].currency as MonedaCampo,
    disponibilidad: "a_convenir",
    rendimiento_estimado: "",
    mejoras: "No",
    ...initialData,
  });

  const [lugarGeocodificado, setLugarGeocodificado] = useState(
    initialData?.localidad ?? "",
  );
  const selectedRegion = useRegionalCountry();
  useEffect(() => {
    if (campoId) return;
    // La región proviene de un estado global externo: sincronizar luego del render.
    const timeout = window.setTimeout(() => {
      setForm(prev => prev.country_code === selectedRegion ? prev : { ...prev, country_code: selectedRegion, provincia: "", departamento: "", localidad: "", ubicacion: "", moneda: selectedRegion === "BR" ? "BRL" : COUNTRIES[selectedRegion].currency as MonedaCampo });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [selectedRegion, campoId]);
  const countryCode: CountryCode = form.country_code ?? "AR";
  const country = COUNTRIES[countryCode];
  const tt=(es:string,pt:string,en?:string)=>regionalText(countryCode,es,pt,en);
  const subdivisiones =
    getCountrySubdivisions(countryCode);

  const [fotos, setFotos] = useState<
    { id?: string; url: string; file?: File; orden: number }[]
  >(fotosIniciales.map((f) => ({ id: f.id, url: f.url, orden: f.orden })));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
  }

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (fotos.length + files.length > 8) {
      setError(tt("Máximo 8 fotos por campo.", "Máximo de 8 fotos por anúncio."));
      return;
    }
    setUploading(true);
    setError("");
    const nuevas = files.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      orden: fotos.length + i,
    }));
    setFotos((prev) => [...prev, ...nuevas]);
    setUploading(false);
  }

  function removeFoto(index: number) {
    setFotos((prev) =>
      prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, orden: i })),
    );
  }

  async function uploadFotos(id: string) {
    const subidas: { id: string; orden: number }[] = [];
    for (const foto of fotos) {
      if (foto.id) {
        subidas.push({ id: foto.id, orden: foto.orden });
        continue;
      }
      if (!foto.file) continue;

      const body = new FormData();
      body.set("campoId", id);
      body.set("orden", String(foto.orden));
      body.set("file", foto.file);
      const response = await fetch("/api/campos/fotos", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.url || !result.id) {
        throw new Error(result.error ?? tt("No se pudo subir la foto del campo", "Não foi possível enviar a foto da terra"));
      }
      subidas.push({ id: result.id, orden: foto.orden });
    }
    return subidas;
  }

  async function handleSubmit(
    e: React.FormEvent,
    estado: "borrador" | "activo",
  ) {
    e.preventDefault();
    setError("");

    for (const [key, label, max, required] of [
      ["titulo", tt("Título", "Título", "Title"), 100, true],
      ["descripcion", tt("Descripción", "Descrição", "Description"), 2500, false],
      ["departamento", tt("Departamento", "Município", "District"), 120, false],
      ["localidad", tt("Localidad", "Cidade", "Town"), 120, false],
      ["ambiente", tt("Suelo", "Solo", "Soil"), 250, false],
      ["rendimiento_estimado", tt("Rendimiento", "Produtividade", "Yield"), 120, false],
    ] as const) {
      const message = errorTextoPublico(form[key], label, { required, min: required ? 5 : 0, max });
      if (message) { setError(message); return; }
    }

    if (form.titulo.trim().length < 5) {
      setError(tt("Escribí un título descriptivo de al menos 5 caracteres para la ficha del campo.", "Escreva um título com pelo menos 5 caracteres para o anúncio.", "Enter a descriptive farmland title with at least 5 characters."));
      return;
    }
    if (!Number.isFinite(form.hectareas) || form.hectareas <= 0) {
      setError(tt("Ingresá una superficie en hectáreas mayor que cero.", "Informe uma área em hectares maior que zero.", "Enter a land area greater than zero hectares."));
      return;
    }
    if (form.precio !== undefined && (!Number.isFinite(form.precio) || form.precio <= 0)) {
      setError(tt("Si indicás un precio, debe ser mayor que cero. Si es a convenir, dejá el campo vacío.", "Se informar um preço, use um valor maior que zero. Caso seja a combinar, deixe em branco.", "If you enter a price, it must be greater than zero. Leave it blank if negotiable."));
      return;
    }
    setSaving(true);

    if (!form.titulo || !form.ubicacion || !form.provincia || !form.hectareas || !form.aptitud) {
      setError(
        tt(`Completá los campos obligatorios: título, ubicación, ${country.subdivisionLabel.toLowerCase()}, hectáreas y aptitud.`, `Preencha os campos obrigatórios: título, localização, ${country.subdivisionLabel.toLowerCase()}, hectares e aptidão.`),
      );
      setSaving(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      let id = campoId;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      if (!(profile?.roles?.includes("propietario"))) {
        throw new Error(
          "Solo los propietarios pueden publicar o administrar campos. Activá el rol Propietario desde tu perfil.",
        );
      }

      const response = await fetch("/api/campos/publicar", {
        method: campoId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campoId,
          form,
          estado,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (!FREE_PUBLICATIONS_ENABLED && result.code === "quota_exhausted") {
          throw new Error(
            "Ya utilizaste todas las publicaciones de tu plan. Volvé a Mis campos y elegí un plan superior para seguir publicando.",
          );
        }
        throw new Error(result.error ?? "No se pudo guardar el campo.");
      }

      id = result.id;

      if (id) {
        const seleccion = await uploadFotos(id);
        const syncResponse = await fetch("/api/campos/fotos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campoId: id, fotos: seleccion }),
        });
        if (!syncResponse.ok) {
          const syncResult = await syncResponse.json();
          throw new Error(syncResult.error ?? "No se pudieron guardar los cambios en las fotos");
        }
      }

      if (!campoId && estado === "activo") {
        trackEvent("publicar_campo", {
          pais: countryCode,
          aptitud: form.aptitud,
          operacion: form.operacion,
          hectareas: form.hectareas ?? 0,
        });
      }

      router.push("/mis-campos");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err &&
              typeof err.message === "string"
            ? err.message
            : "Ocurrió un error al guardar el campo.";
      setError(message);
      setSaving(false);
    }
  }

  return (
    <form className="campo-form rc-publish-form rc-publish-form--field" onSubmit={(e) => e.preventDefault()}>
      <div className="rc-publish-hero">
        <span className="rc-publish-brand-mark">
          <Image src="/icon-512.png" alt="Escudo oficial de RentoCampo" width={60} height={60} />
        </span>
        <span className="rc-publish-eyebrow">RentoCampo · {tt("Tierras rurales", "Terras rurais")}</span>
        <h1>{campoId ? tt("Editar campo", "Editar propriedade") : tt("Publicar campo", "Anunciar terra")}</h1>
        <p>{tt("Tu tierra tiene valor. Agregala al mapa y conectá directo.", "Sua terra tem valor. Adicione-a ao mapa e conecte-se diretamente.")}</p>
      </div>
      {!FREE_PUBLICATIONS_ENABLED && <div className="campo-plan-status">
        <div>
          <span className="campo-plan-kicker">{tt("Tu plan","Seu plano")}</span>
          <strong>{planNombre}</strong>
        </div>
        <div className="campo-plan-usage">
          {publicacionesLimite === null ? (
            <span>{tt("Publicaciones ilimitadas","Anúncios ilimitados")}</span>
          ) : (
            <>
              <span>
                {publicacionesRestantes} de {publicacionesLimite} publicación
                {publicacionesLimite === 1 ? "" : "es"} disponible
                {publicacionesRestantes === 1 ? "" : "s"}
              </span>
              <small>{publicacionesUsadas} {tt("utilizadas","utilizadas")}</small>
            </>
          )}
        </div>
      </div>}

      {!FREE_PUBLICATIONS_ENABLED && !puedePublicar && !campoId && (
        <div className="campo-plan-alert">
          {tt("Alcanzaste el límite de tu plan. Podés guardar un borrador, pero para publicar una nueva tierra necesitás ampliar tu plan desde Mis campos.","Você atingiu o limite do seu plano. Pode salvar um rascunho, mas para publicar uma nova terra será necessário ampliar seu plano.")}
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      {/* Información básica */}
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial">
          <span className="form-section-number">01</span>
          <span className="form-section-icon" aria-hidden="true"><FileText size={24} strokeWidth={1.8} /></span>
          <span className="form-section-copy"><span>{tt("Información","Informações")}</span> <em>{tt("básica","básicas")}</em></span>
        </h2>

        <div className="form-field">
          <label className="form-label">
            {tt("Título de la publicación del campo","Título do anúncio da propriedade","Farmland listing title")} <span className="required">*</span>
          </label>
          <input
            name="titulo"
            type="text"
            className="form-input"
            placeholder={tt("Ej.: Campo agrícola de 240 ha en Marcos Juárez","Ex.: Fazenda agrícola de 240 ha em São Paulo","E.g. 240-hectare farm near Austin")}
            value={form.titulo}
            onChange={handleChange}
            required
            maxLength={100}
          />
          <p className="form-hint">{tt("Este primer campo será el título visible en el mapa, los listados y la ficha. Describí la propiedad, no pongas tu nombre personal.", "Este primeiro campo será o título exibido no mapa, nas listas e na ficha. Descreva a propriedade, não use seu nome pessoal.", "This will be the public title on the map, search results and listing. Describe the property, not your personal name.")}</p>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Descripción del campo","Descrição da propriedade","Farmland description")}</label>
          <textarea
            name="descripcion"
            className="form-input form-textarea"
            placeholder={tt("Ej.: Campo agrícola con acceso por camino rural, agua disponible y mejoras. Ideal para producción extensiva.","Ex.: Fazenda agrícola com estrada rural, água e benfeitorias.","E.g. Productive farmland with road access, water and improvements.")}
            value={form.descripcion ?? ""}
            onChange={handleChange}
            rows={4}
            maxLength={2500}
          />
          <p className="form-hint">{tt("Contá el uso, accesos, agua y condiciones. No escribas teléfono, email, redes ni links: los contactos se hacen por chat.", "Descreva uso, acesso, água e condições. Não inclua telefone, e-mail, redes ou links: o contato é pelo chat.", "Describe use, access, water and conditions. Do not add phone numbers, emails, social handles or links; contact happens through chat.")}</p>
        </div>
      </div>

      {/* Ubicación */}
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial">
          <span className="form-section-number">02</span>
          <span className="form-section-icon" aria-hidden="true"><MapPinned size={24} strokeWidth={1.8} /></span>
          <span className="form-section-copy"><span>{tt("Ubicación","Localização")}</span> <em>{tt("del campo","da propriedade")}</em></span>
        </h2>

        <div className="form-field">
          <label className="form-label">
            {tt("País","País")} <span className="required">*</span>
          </label>
          <select
            name="country_code"
            className="form-input form-select"
            value={countryCode}
            onChange={(event) => {
              const nextCountry = event.target.value as CountryCode;
              setForm((prev) => ({
                ...prev,
                country_code: nextCountry,
                provincia: "",
                departamento: "",
                localidad: "",
                ubicacion: "",
                latitud: undefined,
                longitud: undefined,
                moneda: nextCountry === "BR" ? "BRL" : nextCountry === "AR" ? "USD" : COUNTRIES[nextCountry].currency as MonedaCampo,
              }));
              setLugarGeocodificado("");
            }}
            required
          >
            {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {displayCountryName(code, countryCode)}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Elegí la ubicación aproximada en el mapa","Selecione a localização aproximada no mapa","Choose an approximate location on the map")} <span className="required">*</span></label>
          <GeocoderInput
            countryCode={countryCode}
            valorInicial={lugarGeocodificado}
            onChange={(ubicacion) =>
              setForm((prev) => ({ ...prev, ubicacion }))
            }
            onSelect={(lugar: LugarSeleccionado) => {
              setForm((prev) => ({
                ...prev,
                ubicacion: lugar.lugar,
                latitud: lugar.lugar ? lugar.lat : undefined,
                longitud: lugar.lugar ? lugar.lng : undefined,
                ...(lugar.localidad && { localidad: lugar.localidad }),
                ...(lugar.departamento && { departamento: lugar.departamento }),
                ...(lugar.provincia && { provincia: lugar.provincia }),
              }));
              setLugarGeocodificado(lugar.lugar);
            }}
          />
          {typeof form.latitud === "number" && typeof form.longitud === "number" ? (
            <span className="geocoder-coords">
              ✓ {tt("Ubicación seleccionada:","Localização selecionada:")} {form.latitud.toFixed(4)},{" "}
              {form.longitud.toFixed(4)}
            </span>
          ) : (
            <span className="geocoder-hint">
              {tt("Buscá una localidad o punto cercano y seleccioná un resultado. No hace falta exponer la dirección exacta del campo.", "Busque uma cidade ou ponto próximo e selecione um resultado. Não é necessário divulgar o endereço exato.", "Search for a nearby town and select a result. You don\u0027t need to reveal the exact address.")}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              {country.subdivisionLabel} <span className="required">*</span>
            </label>
            <select
              name="provincia"
              className="form-input form-select"
              value={form.provincia}
              onChange={handleChange}
              required
            >
              <option value="">{tt("Seleccioná...","Selecione...")}</option>
              {subdivisiones.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">
              {countryCode === "BR" ? "Município / Região" : countryCode === "US" ? "Condado (county)" : countryCode === "UY" ? "Zona / Sección" : "Departamento / Partido"}
            </label>
            <input
              name="departamento"
              type="text"
              className="form-input"
              placeholder={tt("Ej: Marcos Juárez","Ex.: Campinas")}
              value={form.departamento ?? ""}
              onChange={handleChange}
              maxLength={120}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Localidad más cercana","Cidade mais próxima")}</label>
          <input
            name="localidad"
            type="text"
            className="form-input"
            placeholder={tt("Ej: Corral de Bustos","Ex.: Ribeirão Preto")}
            value={form.localidad ?? ""}
            onChange={handleChange}
            maxLength={120}
          />
        </div>
      </div>

      {/* Características */}
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial">
          <span className="form-section-number">03</span>
          <span className="form-section-icon" aria-hidden="true"><Sprout size={24} strokeWidth={1.8} /></span>
          <span className="form-section-copy"><span>{tt("Características","Características")}</span> <em>{tt("productivas","produtivas")}</em></span>
        </h2>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              {tt("Superficie total (hectáreas)","Área total (hectares)","Total area (hectares)")} <span className="required">*</span>
            </label>
            <input
              name="hectareas"
              type="number"
              className="form-input"
              placeholder={tt("Ej: 240", "Ex.: 240")}
              value={form.hectareas || ""}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">
              {tt("Uso principal del campo","Uso principal da propriedade","Main land use")} <span className="required">*</span>
            </label>
            <div className="rc-publish-choice-row" role="group" aria-label={tt("Aptitud", "Aptidão")}>
              {APTITUDES.map((a) => (
                <button
                  type="button"
                  key={a.value}
                  className={`rc-publish-choice${form.aptitud === a.value ? " is-selected" : ""}`}
                  aria-pressed={form.aptitud === a.value}
                  onClick={() => setForm((prev) => ({...prev, aptitud:a.value as CampoFormData["aptitud"]}))}
                >
                  {countryCode==="BR"?({agricola:"Agricultura",ganadera:"Pecuária",mixta:"Agrícola e pecuária",forestal:"Florestal",otro:"Outro"} as Record<string,string>)[a.value]??a.label:countryCode==="US"?({agricola:"Cropland",ganadera:"Livestock",mixta:"Mixed use",forestal:"Forestry",otro:"Other"} as Record<string,string>)[a.value]??a.label:({agricola:"Agrícola",ganadera:"Ganadero",mixta:"Agrícola y ganadero",forestal:"Forestal",otro:"Otro"} as Record<string,string>)[a.value]??a.label}
                  {form.aptitud === a.value && <Check size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
            <select
              name="aptitud"
              className="form-input form-select rc-publish-hidden-native"
              value={form.aptitud}
              onChange={handleChange}
            >
              {APTITUDES.map((a) => (
                <option key={a.value} value={a.value}>
                  {countryCode==="BR"?({agricola:"Agrícola",ganadera:"Pecuária",mixta:"Mista",forestal:"Florestal",otro:"Outro"} as Record<string,string>)[a.value]??a.label:countryCode==="US"?regionalText(countryCode,a.label,a.label):a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">{tt("Tipo de suelo y ambiente (opcional)","Solo e ambiente (opcional)","Soil and environment (optional)")}</label>
            <input
              name="ambiente"
              type="text"
              className="form-input"
              placeholder={tt("Ej: Agrícola típico, suelos profundos","Ex.: Solo fértil e profundo")}
              value={form.ambiente ?? ""}
              onChange={handleChange}
              maxLength={250}
            />
          </div>
          <div className="form-field">
            <label className="form-label">{tt("Rendimiento agrícola orientativo (qq/ha)","Produtividade agrícola estimada (qq/ha)","Estimated crop yield (quintals/ha)")}</label>
            <input
              name="rendimiento_estimado"
              type="text"
              className="form-input"
              placeholder={tt("Ej: 35", "Ex.: 35")}
              value={form.rendimiento_estimado ?? ""}
              onChange={handleChange}
              maxLength={120}
            />
          </div>
        </div>

        <div className="form-field form-check">
          <input
            type="checkbox"
            id="mejoras"
            name="mejoras"
            checked={form.mejoras === "Sí"}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, mejoras: e.target.checked ? "Sí" : "No" }))
            }
          />
          <label htmlFor="mejoras" className="form-check-label">
            {tt("El campo tiene mejoras (galpones, corrales, silos, perforaciones, etc.)","A propriedade possui benfeitorias (galpões, currais, silos, poços etc.)")}
          </label>
        </div>
      </div>

      {/* Precio y disponibilidad */}
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial">
          <span className="form-section-number">04</span>
          <span className="form-section-icon" aria-hidden="true"><WalletCards size={24} strokeWidth={1.8} /></span>
          <span className="form-section-copy"><span>{tt("Precio","Preço")}</span> <em>{tt("y disponibilidad","e disponibilidade")}</em></span>
        </h2>

        <div className="form-field">
          <label className="form-label">
            {tt("Tipo de operación","Tipo de operação")} <span className="required">*</span>
          </label>
          <div className="rc-publish-choice-row" role="group" aria-label={tt("Tipo de operación", "Tipo de operação")}>
            {([
              ["alquiler", tt("Alquiler","Arrendamento")],
              ["venta", tt("Venta","Venda")],
              ["ambas", tt("Alquiler y venta","Arrendamento e venda")],
            ] as const).map(([value,label]) => (
              <button
                type="button"
                key={value}
                className={`rc-publish-choice${form.operacion === value ? " is-selected" : ""}`}
                aria-pressed={form.operacion === value}
                onClick={() => setForm((prev) => ({...prev, operacion:value}))}
              >
                {label} {form.operacion === value && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="rc-operation-select rc-publish-hidden-native">
            <select
              name="operacion"
              aria-label={tt("Tipo de operación","Tipo de operação")}
              className="form-input form-select"
            value={form.operacion}
            onChange={handleChange}
            required
          >
            <option value="alquiler">{tt("Alquiler","Arrendamento")}</option>
            <option value="venta">{tt("Venta","Venda")}</option>
            <option value="ambas">{tt("Alquiler y venta","Arrendamento e venda")}</option>
            </select>
            <span className="rc-operation-chevron" aria-hidden="true" />
          </div>
          <span className="geocoder-hint">
            {tt("RentoCampo está orientado principalmente al alquiler rural. Si también evaluás vender, podés indicarlo acá.","A RentoCampo prioriza o arrendamento rural. Se também pretende vender, indique aqui.")}
          </span>
        </div>

        <div className="form-row">
          <div className="form-field form-field-price">
            <label className="form-label">{tt("Precio total orientativo (opcional)","Preço total de referência (opcional)","Estimated total price (optional)")}</label>
            <div className="input-with-prefix">
              <select
                name="moneda"
                className="input-prefix"
                value={form.moneda}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                {countryCode === "UY" && <option value="UYU">UYU</option>}
                {countryCode === "PY" && <option value="PYG">PYG</option>}
                {countryCode === "CL" && <option value="CLP">CLP</option>}
                {countryCode === "BO" && <option value="BOB">BOB</option>}
                {countryCode === "PE" && <option value="PEN">PEN</option>}
                {countryCode === "BR" && <option value="BRL">BRL</option>}
                {!["AR","UY","PY","CL","BO","PE","BR"].includes(countryCode) && COUNTRIES[countryCode].currency !== "USD" && <option value={COUNTRIES[countryCode].currency}>{COUNTRIES[countryCode].currency}</option>}
              </select>
              <input
                name="precio"
                type="number"
                className="form-input input-after-prefix"
                placeholder={tt("Ej: 320","Ex.: 320")}
                value={form.precio ?? ""}
                onChange={handleChange}
                min={0.01}
                step="any"
              />
            </div>
            <p className="form-hint">{tt("Ingresá el monto total que querés mostrar. Si calculás por hectárea, por mes o por campaña, explicalo en la descripción para evitar confusiones.", "Informe o valor total que deseja exibir. Se o preço é por hectare, mês ou safra, explique na descrição.", "Enter the total amount you want displayed. Explain any per-hectare, monthly or seasonal pricing in the description.")}</p>
          </div>
          <div className="form-field">
            <label className="form-label">{tt("¿Cuándo está disponible?","Quando estará disponível?","When is the land available?")}</label>
            <select
              name="disponibilidad"
              className="form-input form-select"
              value={form.disponibilidad}
              onChange={handleChange}
            >
              {DISPONIBILIDADES.map((d) => (
                <option key={d.value} value={d.value}>
                  {countryCode==="BR"?({inmediata:"Imediata","campaña_próxima":"Próxima safra",a_convenir:"A combinar"} as Record<string,string>)[d.value]??d.label:countryCode==="US"?regionalText(countryCode,d.label,d.label):d.label}
                </option>
              ))}
            </select>
            <p className="form-hint">{tt("Elegí si está disponible ahora, en la próxima campaña o si la fecha se acuerda con el interesado.", "Indique se está disponível agora, na próxima safra ou em data a combinar.", "Choose available now, next season or a date to be agreed upon.")}</p>
          </div>
        </div>
      </div>

      {/* Fotos */}
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial">
          <span className="form-section-number">05</span>
          <span className="form-section-icon" aria-hidden="true"><Images size={24} strokeWidth={1.8} /></span>
          <span className="form-section-copy"><span>{tt("Fotos","Fotos")}</span> <em>{tt("del campo","da propriedade")}</em></span>
          <span className="form-section-hint">{tt("(máx. 8)","(máx. 8)")}</span>
        </h2>

        <div className="rc-publish-photo-guide rc-publish-photo-guide--field">
          <ImagePlus size={23} aria-hidden="true" />
          <div>
            <strong>{tt("Subí fotos reales de tu campo", "Envie fotos reais da propriedade")}</strong>
            <small>{tt("Hasta 8 imágenes. La primera será la foto principal.", "Até 8 imagens. A primeira será a capa.")}</small>
          </div>
        </div>
        <div className="fotos-grid">
          {fotos.map((foto, i) => (
            <div key={i} className="foto-thumb">
              <Image
                src={foto.url}
                alt={"Foto " + (i + 1)}
                width={320}
                height={240}
                unoptimized={foto.url.startsWith("blob:")}
              />
              <button
                type="button"
                className="foto-remove"
                onClick={() => removeFoto(i)}
                title={tt("Eliminar foto","Excluir foto")}
              >
                ×
              </button>
              {i === 0 && <span className="foto-principal">{tt("Principal","Principal")}</span>}
            </div>
          ))}
          {fotos.length < 8 && (
            <button
              type="button"
              className="foto-add"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span className="foto-add-icon"><ImagePlus size={26} aria-hidden="true" /></span>
              <span className="foto-add-label">
                {uploading ? tt("Subiendo...","Enviando...") : tt("Agregar foto","Adicionar foto")}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFotos}
        />
      </div>

      {/* Acciones */}
      {error && <div className="form-error" role="alert" aria-live="polite">{error}</div>}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary-lg"
          onClick={(e) => handleSubmit(e, "borrador")}
          disabled={saving}
        >
          {saving ? tt("Guardando...","Salvando...") : tt("Guardar borrador","Salvar rascunho")}
        </button>
        <button
          type="button"
          className="btn-primary-lg"
          onClick={(e) => handleSubmit(e, "activo")}
          disabled={saving || (!FREE_PUBLICATIONS_ENABLED && !puedePublicar && !campoId)}
        >
          {saving
            ? tt("Publicando...","Publicando...")
            : !FREE_PUBLICATIONS_ENABLED && !puedePublicar && !campoId
              ? tt("Sin cupo disponible","Sem vagas disponíveis")
              : tt("Publicar campo","Anunciar terra")}
        </button>
      </div>
    </form>
  );
}
