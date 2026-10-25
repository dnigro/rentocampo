"use client";

import Image from "next/image";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileText, Images, MapPinned, Sprout, WalletCards } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions, type CountryCode } from "@/data/countries";
import type { CampoFormData, MonedaCampo } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { regionalText } from "@/lib/i18n/regional";
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
  const countryCode: CountryCode = form.country_code ?? "AR";
  const country = COUNTRIES[countryCode];
  const tt=(es:string,pt:string)=>regionalText(countryCode,es,pt);
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
    <form className="campo-form" onSubmit={(e) => e.preventDefault()}>
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
            {tt("Título del campo","Título da propriedade")} <span className="required">*</span>
          </label>
          <input
            name="titulo"
            type="text"
            className="form-input"
            placeholder={tt("Ej: Campo agrícola en Marcos Juárez","Ex.: Fazenda agrícola em São Paulo")}
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Descripción","Descrição")}</label>
          <textarea
            name="descripcion"
            className="form-input form-textarea"
            placeholder={tt("Describí las características principales del campo, accesos, infraestructura...","Descreva as características da propriedade, acessos, infraestrutura...")}
            value={form.descripcion ?? ""}
            onChange={handleChange}
            rows={4}
          />
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
            {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {COUNTRIES[code].name}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Buscar ubicación en el mapa","Buscar localização no mapa")}</label>
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
              {tt("Buscá la localidad o dirección más cercana al campo para que aparezca en el mapa.","Busque a cidade ou endereço mais próximo da propriedade para exibi-la no mapa.")}
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
              {countryCode === "BR" ? "Município / Região" : countryCode === "UY" ? "Zona / Sección" : "Departamento / Partido"}
            </label>
            <input
              name="departamento"
              type="text"
              className="form-input"
              placeholder={tt("Ej: Marcos Juárez","Ex.: Campinas")}
              value={form.departamento ?? ""}
              onChange={handleChange}
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
              {tt("Hectáreas","Hectares")} <span className="required">*</span>
            </label>
            <input
              name="hectareas"
              type="number"
              className="form-input"
              placeholder="Ej: 240"
              value={form.hectareas || ""}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">
              {tt("Aptitud","Aptidão")} <span className="required">*</span>
            </label>
            <select
              name="aptitud"
              className="form-input form-select"
              value={form.aptitud}
              onChange={handleChange}
            >
              {APTITUDES.map((a) => (
                <option key={a.value} value={a.value}>
                  {countryCode==="BR"?({agricola:"Agrícola",ganadera:"Pecuária",mixta:"Mista",forestal:"Florestal",otro:"Outro"} as Record<string,string>)[a.value]??a.label:a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">{tt("Ambiente / Suelo","Ambiente / Solo")}</label>
            <input
              name="ambiente"
              type="text"
              className="form-input"
              placeholder={tt("Ej: Agrícola típico, suelos profundos","Ex.: Solo fértil e profundo")}
              value={form.ambiente ?? ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">{tt("Rendimiento estimado (qq/ha)","Produtividade estimada (qq/ha)")}</label>
            <input
              name="rendimiento_estimado"
              type="text"
              className="form-input"
              placeholder="Ej: 35"
              value={form.rendimiento_estimado ?? ""}
              onChange={handleChange}
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
          <div className="rc-operation-select">
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
            <label className="form-label">{tt("Precio total estimado","Preço total estimado")}</label>
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
                placeholder="Ej: 320"
                value={form.precio ?? ""}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">{tt("Disponibilidad","Disponibilidade")}</label>
            <select
              name="disponibilidad"
              className="form-input form-select"
              value={form.disponibilidad}
              onChange={handleChange}
            >
              {DISPONIBILIDADES.map((d) => (
                <option key={d.value} value={d.value}>
                  {countryCode==="BR"?({inmediata:"Imediata","campaña_próxima":"Próxima safra",a_convenir:"A combinar"} as Record<string,string>)[d.value]??d.label:d.label}
                </option>
              ))}
            </select>
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
              <span className="foto-add-icon">+</span>
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
