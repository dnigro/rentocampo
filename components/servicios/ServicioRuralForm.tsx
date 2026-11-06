"use client";

import Image from "next/image";
import { displayCountryName, COUNTRIES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions, resolveCountry, type CountryCode } from "@/data/countries";
import { useRouter } from "next/navigation";
import { errorTextoPublico } from "@/lib/publication-content-guard";
import { useRef, useState, useEffect } from "react";
import { Check, FileText, Images, MapPinned, UploadCloud, Wheat, Fence, Wifi, Handshake, Beef } from "lucide-react";
import { SERVICIO_GRUPOS, servicioGrupoLabel, servicioGrupoDescripcion, servicioLabel } from "@/data/servicios-rurales";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { type Profile, type RolPerfil, type ServicioRural } from "@/types";
import GeocoderInput, { type LugarSeleccionado } from "@/components/campos/GeocoderInput";

interface ServicioInicial {
  id: string;
  country_code?: CountryCode;
  servicios_rurales: ServicioRural[];
  nombre_comercial?: string | null;
  foto_url: string;
  fotos_urls?: string[] | null;
  provincia: string;
  localidad?: string | null;
  zona?: string | null;
  detalle?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

interface Props {
  profile: Partial<Profile> | null;
  publicacion?: ServicioInicial | null;
  initialCountry?: CountryCode;
  initialZona?: string;
}

export default function ServicioRuralForm({ profile, publicacion, initialCountry, initialZona }: Props) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<ServicioRural[]>(
    publicacion?.servicios_rurales ?? profile?.servicios_rurales ?? [],
  );
  const [country, setCountry] = useState<CountryCode>(resolveCountry(publicacion?.country_code ?? initialCountry, profile?.country_code));
  const selectedRegion = useRegionalCountry();
  const subdivisions = getCountrySubdivisions(country);
  const tt=(es:string,pt:string,en?:string)=>regionalText(country,es,pt,en);
  const [zona, setZona] = useState(publicacion?.zona ?? initialZona ?? profile?.zona_servicio ?? "");
  const [provincia, setProvincia] = useState(publicacion?.provincia ?? profile?.provincia_servicio ?? "");
  const [localidad, setLocalidad] = useState(publicacion?.localidad ?? profile?.localidad_servicio ?? "");
  const [ubicacion, setUbicacion] = useState([publicacion?.localidad, publicacion?.provincia].filter(Boolean).join(", "));
  const [latitud, setLatitud] = useState<number | undefined>(publicacion?.latitud ?? undefined);
  const [longitud, setLongitud] = useState<number | undefined>(publicacion?.longitud ?? undefined);
  const [nombreComercial, setNombreComercial] = useState(publicacion?.nombre_comercial ?? "");
  const [detalle, setDetalle] = useState(publicacion?.detalle ?? "");
  const [photos, setPhotos] = useState<{url:string;file?:File}[]>(() => {
    const saved = Array.isArray(publicacion?.fotos_urls) && publicacion.fotos_urls.length ? publicacion.fotos_urls : [publicacion?.foto_url ?? profile?.service_photo_url ?? ""];
    return saved.filter(Boolean).slice(0,8).map(url => ({url}));
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (publicacion || selectedRegion === country) return;
    // Evitar actualizaciones sincrónicas de estado dentro del efecto.
    const timeout = window.setTimeout(() => {
      setCountry(selectedRegion);
      setProvincia("");
      setLocalidad("");
      setZona("");
      setUbicacion("");
      setLatitud(undefined);
      setLongitud(undefined);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [selectedRegion, publicacion, country]);

  // La primera categoría seleccionada se guarda como principal sin cambiar el esquema SQL.
  function toggleServicio(servicio: ServicioRural) {
    setServicios((actuales) =>
      actuales.includes(servicio)
        ? actuales.filter((item) => item !== servicio)
        : [...actuales, servicio],
    );
  }

  function elegirPrincipal(servicio: ServicioRural) {
    setServicios((actuales) => [servicio, ...actuales.filter((item) => item !== servicio)]);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 8 - photos.length;
    if (files.length > remaining) setError(tt("Podés subir hasta 8 imágenes.","Você pode enviar até 8 imagens.","You can upload up to 8 photos."));
    setPhotos(previous => [...previous, ...files.slice(0,Math.max(0,remaining)).filter(file=>file.type.startsWith("image/")).map(file=>({file,url:URL.createObjectURL(file)}))]);
    e.target.value = "";
  }

  function removePhoto(index:number) {
    setPhotos(previous => previous.filter((photo,i)=>{if(i===index && photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);return i!==index;}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (nombreComercial.trim().length < 5) {
      setError(tt(
        "Escribí un título de al menos 5 caracteres para tu publicación.",
        "Informe um título com pelo menos 5 caracteres para seu anúncio.",
        "Enter a listing title with at least 5 characters.",
      ));
      nombreInputRef.current?.focus();
      return;
    }

    for (const [value, label, max, required] of [
      [nombreComercial, tt("Título", "Título", "Title"), 100, true],
      [detalle, tt("Descripción", "Descrição", "Description"), 2500, false],
      [zona, tt("Zona", "Área", "Area"), 200, false],
      [localidad, tt("Localidad", "Cidade", "Town"), 120, false],
    ] as const) {
      const message = errorTextoPublico(value, label, { required, min: required ? 5 : 0, max });
      if (message) { setError(message); return; }
    }

    if (!servicios.length) {
      setError(tt("Elegí al menos un servicio rural.","Selecione pelo menos um serviço rural."));
      return;
    }

    if (!photos.length) {
      setError(tt("Subí una foto clara y real del servicio que ofrecés.","Envie uma foto real e nítida do serviço que oferece."));
      return;
    }

    if (!provincia || !ubicacion || typeof latitud !== "number" || typeof longitud !== "number") {
      setError(tt("Seleccioná la zona de servicio usando el buscador del mapa.","Selecione a área de atendimento usando o buscador do mapa."));
      return;
    }

    setSaving(true);

    try {
      const resolvedPhotos:string[] = [];
      for (const photo of photos) {
        if (!photo.file) { resolvedPhotos.push(photo.url); continue; }
        const body = new FormData();
        body.set("file",photo.file);
        const response = await fetch("/api/profile/service-photo",{method:"POST",body});
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error ?? tt("No se pudo subir la foto del servicio","Não foi possível enviar a foto do serviço"));
        resolvedPhotos.push(result.url);
      }
      if (!resolvedPhotos.length) throw new Error(tt("La foto del servicio es obligatoria.","A foto do serviço é obrigatória."));
      const payload = {
        propietario_id: profile?.id,
        country_code: country,
        servicios_rurales: servicios,
        nombre_comercial: nombreComercial.trim(),
        foto_url: resolvedPhotos[0],
        fotos_urls: resolvedPhotos,
        zona: zona || null,
        provincia,
        localidad: localidad || null,
        latitud,
        longitud,
        detalle: detalle || null,
      };
      const response = await fetch("/api/servicios/publicar", {
        method: publicacion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicacion ? { id: publicacion.id, form: payload } : payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? tt("No se pudo guardar el servicio.", "Não foi possível salvar o serviço.", "Could not save your service."));

      const roles = (profile?.roles ?? ["productor"]) as RolPerfil[];
      const rolesActualizados = roles.includes("prestador")
        ? roles
        : [...roles, "prestador"];

      const roleResponse = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: rolesActualizados }),
      });
      const roleResult = await roleResponse.json();
      if (!roleResponse.ok) {
        throw new Error(roleResult.error ?? tt("No se pudo activar el perfil de servicios","Não foi possível ativar o perfil de serviços"));
      }

      router.push("/mis-servicios-rurales");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : tt("No se pudo guardar el servicio.","Não foi possível salvar o serviço."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="campo-form servicio-publicacion-form rc-publish-form rc-publish-form--service" onSubmit={handleSubmit}>
      <div className="rc-publish-hero">
        <span className="rc-publish-brand-mark">
          <Image src="/icon-512.png" alt="Escudo oficial de RentoCampo" width={60} height={60} />
        </span>
        <span className="rc-publish-eyebrow">RentoCampo · {tt("Servicios rurales","Serviços rurais","Rural services")}</span>
        <h1>{publicacion ? tt("Editar servicios rurales","Editar serviços rurais","Edit rural services") : tt("Publicá tus servicios rurales","Anuncie seus serviços rurais","List your rural services")}</h1>
        <p>{tt("Contá qué hacés, elegí tus actividades y marcá dónde trabajás. Tu publicación aparece en el mapa y en las fichas, sin comisiones.","Descreva seu trabalho, selecione suas atividades e indique onde atende. Seu anúncio aparece no mapa e nas fichas, sem comissão.","Describe your work, select your services and mark the areas you serve. Your listing appears on the map and in search, with zero commission.")}</p>
      </div>
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">01</span><span className="form-section-icon" aria-hidden="true"><FileText size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Información","Informações")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label" htmlFor="servicio-nombre-comercial">
          {tt("Título de la publicación","Título do anúncio","Listing title")} <span className="required">*</span>
        </label>
        <input
          id="servicio-nombre-comercial"
          ref={nombreInputRef}
          className="form-input"
          type="text"
          minLength={5}
          maxLength={100}
          required
          aria-describedby="servicio-nombre-ayuda"
          value={nombreComercial}
          onChange={(e) => setNombreComercial(e.target.value)}
          placeholder={tt("Ej.: Cosecha y siembra · Agroservicios López","Ex.: Colheita e plantio · Agroserviços Silva","E.g. Harvesting and planting · Farm Services")}
          autoComplete="off"
        />
        <p id="servicio-nombre-ayuda" className="form-hint">
          {tt(
            "Este título aparecerá en el mapa y las fichas. No agregues teléfono, email, redes ni links: el contacto se hace por chat.",
            "Este título aparecerá no mapa e na ficha. Não inclua telefone, e-mail, redes sociais ou links; o contato é pelo chat.",
            "This title appears on the map and listing. Don't add phones, emails, social handles or links; use the chat."
          )}
        </p>
      </div>
      <div className="form-field">
        <label className="form-label">
          {tt("¿Qué servicios ofrecés?","Quais serviços você oferece?")} <span className="required">*</span>
        </label>
        <p className="form-hint">
          {tt("Elegí las tareas que realmente ofrecés. Podés marcar varias; luego indicá cuál es tu actividad principal.","Selecione os serviços que você realmente oferece. É possível marcar vários e escolher a atividade principal.","Choose the work you actually offer. Select several if needed and mark your main service.")}
        </p>
        <div className="rc-publish-groups">
          {SERVICIO_GRUPOS.map((group) => (
            <section className="rc-publish-group" key={group.key} aria-label={servicioGrupoLabel(group, country)}>
              <div className="rc-publish-group-title">
                <span className="rc-publish-group-icon" aria-hidden="true">
                  {group.key === "agricultura" ? <Wheat size={22} /> : group.key === "ganaderia" ? <Beef size={22} /> : group.key === "infraestructura" ? <Fence size={22} /> : group.key === "tecnologia" ? <Wifi size={22} /> : <Handshake size={22} />}
                </span>
                <span className="rc-publish-group-copy">
                  <strong>{servicioGrupoLabel(group, country)}</strong>
                  <small>{servicioGrupoDescripcion(group, country)}</small>
                </span>
              </div>
              <div className="rc-publish-chips">
                {group.values.map((value) => (
                  <label className={`rc-publish-chip${servicios.includes(value) ? " is-selected" : ""}`} key={value}>
                    <input
                      type="checkbox"
                      checked={servicios.includes(value)}
                      onChange={() => toggleServicio(value)}
                    />
                    <span>{servicioLabel(value, country)}</span>
                    {servicios.includes(value) && <Check size={14} aria-hidden="true" />}
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="rc-publish-selected">
          <label className="rc-publish-primary">
            <span className="form-label">{tt("Actividad principal", "Atividade principal", "Main service")}</span>
            <select
              className="form-input form-select"
              aria-label={tt("Categoría principal", "Categoria principal", "Main category")}
              value={servicios[0] ?? ""}
              onChange={(e) => elegirPrincipal(e.target.value as ServicioRural)}
              disabled={servicios.length === 0}
            >
              {servicios.length === 0 && <option value="">{tt("Elegí un servicio", "Selecione um serviço", "Select a service")}</option>}
              {servicios.map((value) => (
                <option key={value} value={value}>{servicioLabel(value,country)}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="form-label">{tt("Otras actividades seleccionadas", "Outras atividades selecionadas", "Other selected services")}</span>
            <div className="rc-publish-selected-tags">
              {servicios.length < 2 && <small>{tt("Podés sumar otros rubros arriba.", "Você pode adicionar outras categorias acima.", "You can add more categories above.")}</small>}
              {servicios.slice(1).map((value) => (
                <button type="button" key={value} className="rc-publish-selected-tag" onClick={() => toggleServicio(value)} aria-label={tt("Quitar", "Remover", "Remove") + " " + servicioLabel(value,country)}>
                  {servicioLabel(value,country)} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">02</span><span className="form-section-icon" aria-hidden="true"><Images size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Foto","Foto")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label">{tt("Foto de tu servicio","Foto do seu serviço")} <span className="required">*</span></label>
        <p className="form-hint">{tt("Subí una foto clara y real de tu trabajo. Una buena imagen ayuda a que los productores entiendan rápidamente qué servicio ofrecés.","Envie uma foto nítida e real do seu trabalho. Uma boa imagem ajuda os produtores a entender seu serviço.")}</p>
        <div className="servicio-foto-editor">
          <div className="rc-publish-photo-guide">
            <Images size={23} aria-hidden="true" />
            <div><strong>{tt("Mostrá tu servicio con una foto real", "Mostre seu serviço com uma foto real", "Show your real work")}</strong>
            <small>{tt("Una imagen clara genera más confianza.", "Uma imagem clara transmite confiança.", "A clear photo builds trust.")}</small></div>
          </div>
          <div className="servicio-fotos-grid">
            {photos.map((photo,index)=>(<div className="servicio-fotos-item" key={photo.url}>
              <Image src={photo.url} alt={tt("Imagen del servicio","Imagem do serviço","Service photo")+` ${index+1}`} width={360} height={240} className="servicio-foto-preview" unoptimized={photo.url.startsWith("blob:")} />
              <button type="button" className="btn-secondary-lg" onClick={()=>removePhoto(index)}>{tt("Eliminar","Excluir","Remove")}</button>
            </div>))}
          </div>
          <button type="button" className="btn-secondary-lg rc-publish-photo-button" disabled={photos.length>=8} onClick={()=>photoInputRef.current?.click()}>
            <UploadCloud size={18} aria-hidden="true" /> {tt("Agregar imágenes","Adicionar imagens","Add photos")} ({photos.length}/8)
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">03</span><span className="form-section-icon" aria-hidden="true"><MapPinned size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Zona","Área")}</span> <em>{tt("de cobertura","de atendimento")}</em></span></h2>
      <div className="form-field">
        <label className="form-label" htmlFor="servicio-pais">{tt("País","País")}</label>
        <select id="servicio-pais" className="form-input" value={country} onChange={(e) => {
          setCountry(e.target.value as CountryCode);
          setProvincia(""); setLocalidad(""); setUbicacion(""); setZona("");
          setLatitud(undefined); setLongitud(undefined);
        }}>
          {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {displayCountryName(code, country)}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">{tt("Ubicá tu zona de trabajo en el mapa","Localize sua área de atendimento no mapa","Select your work area on the map")} <span className="required">*</span></label>
        <GeocoderInput
          key={country}
          countryCode={country}
          valorInicial={ubicacion}
          onChange={setUbicacion}
          onSelect={(lugar: LugarSeleccionado) => {
            setUbicacion(lugar.lugar);
            setLatitud(lugar.lat);
            setLongitud(lugar.lng);
            if (lugar.provincia) setProvincia(lugar.provincia);
            if (lugar.localidad) setLocalidad(lugar.localidad);
          }}
        />
        <p className="form-hint">{tt("Buscá una ciudad o punto de referencia y seleccioná un resultado. No necesitás publicar tu dirección exacta.", "Busque uma cidade ou ponto de referência e selecione um resultado. Não é necessário informar seu endereço exato.", "Search for a town or landmark and select a result. You don't need to publish your exact address.")}</p>
        {typeof latitud === "number" && typeof longitud === "number" && (
          <span className="geocoder-coords">✓ {tt("Ubicación seleccionada:","Localização selecionada:")} {latitud.toFixed(4)}, {longitud.toFixed(4)}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">
            {COUNTRIES[country].subdivisionLabel} {tt("principal","principal")} <span className="required">*</span>
          </label>
          <select
            className="form-input"
            value={provincia}
            onChange={(e) => { setProvincia(e.target.value); setUbicacion(""); setLatitud(undefined); setLongitud(undefined); }}
            required
          >
            <option value="">{tt(`Elegí ${COUNTRIES[country].subdivisionLabel.toLowerCase()}`,`Selecione ${COUNTRIES[country].subdivisionLabel.toLowerCase()}`)}</option>
            {subdivisions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Ciudad o localidad de referencia","Cidade ou município de referência","Reference town or city")}</label>
          <input
            className="form-input"
            value={localidad}
            maxLength={120}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder={tt("Ej: Rafaela","Ex.: Campinas")}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">{tt("¿Hasta dónde ofrecés el servicio?","Qual é sua área de atendimento?","Which areas do you serve?")}</label>
        <input
          className="form-input"
          value={zona}
          maxLength={200}
          onChange={(e) => setZona(e.target.value)}
          placeholder={tt("Ej.: Rafaela, Esperanza y zona rural cercana","Ex.: Campinas e municípios vizinhos","E.g. Austin and nearby rural areas")}
        />
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">04</span><span className="form-section-copy"><span>{tt("Detalles","Detalhes")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label">{tt("Descripción del trabajo que ofrecés","Descrição do serviço oferecido","Describe the services you offer")}</label>
        <p className="form-hint">{tt("Contá qué incluye el servicio, con qué equipo trabajás y cómo coordinás disponibilidad. El contacto se realiza por el chat.", "Explique o serviço, equipamentos e disponibilidade. O contato é feito pelo chat.", "Explain what you provide, equipment and availability. People contact you through the platform chat.")}</p>
        <textarea className="form-input form-textarea" rows={5} maxLength={2500} value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder={tt("Ej.: Realizo siembra directa y cosecha. Tengo equipo propio, trabajo por campaña y coordino fechas por mensaje.","Ex.: Realizo plantio direto e colheita com equipamentos próprios; combino datas por mensagem.","E.g. I provide planting and harvesting with my equipment and arrange schedules by message.")} />
      </div>

      </div>

      {error && <div className="form-error servicio-form-error" role="alert">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary-lg" disabled={saving}>
          {saving ? tt("Guardando...","Salvando...") : publicacion ? tt("Guardar cambios","Salvar alterações") : tt("Publicar servicio","Anunciar serviço")}
        </button>
      </div>
    </form>
  );
}
