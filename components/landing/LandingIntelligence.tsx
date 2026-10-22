import Image from "next/image";
import fieldPhoto from "@/public/image_eol_pix.png";

const agro=["Pronóstico por campo y zona","Riesgo de heladas y precipitaciones","Humedad y temperatura del suelo","Ventanas de siembra y cosecha"];
const geo=["Visualización de campos y región","Zonas de alta demanda productiva","Información de suelos y aptitud","Accesos, infraestructura y servicios"];

export default function LandingIntelligence() {
 return <section className="rci" aria-labelledby="rci-title">
  <div className="rci-grid">
   <div className="rci-intro">
    <span className="rci-kicker">PRÓXIMAMENTE</span>
    <h2 id="rci-title">RentoCampo<br/>Intelligence</h2>
    <p className="rci-lead">Información que transforma el valor del campo.</p>
    <div className="rci-benefits">
     <p><span>▥</span><strong>Información para decidir</strong><small>Clima, suelo, territorio y demanda.</small></p>
     <p><span>♧</span><strong>Decisiones más claras</strong><small>Para productores, propietarios y servicios rurales.</small></p>
     <p><span>◎</span><strong>Más oportunidades</strong><small>En un solo lugar.</small></p>
    </div>
   </div>
   <article className="rci-card">
    <div className="rci-visual rci-weather">
     <Image src={fieldPhoto} alt="Vista rural ilustrativa para información agroclimática" fill sizes="(max-width:700px) 100vw, 35vw"/>
     <div className="rci-weather-panel"><span>Clima por campo</span><strong>☁ 23°</strong><small>Vista ilustrativa</small></div>
     <div className="rci-field-outline"/>
     <div className="rci-forecast"><span>☀ Hoy</span><span>☁ Mañana</span><span>☂ Próximos días</span></div>
    </div>
    <div className="rci-card-body"><div className="rci-heading"><span className="rci-symbol">☁</span><div><h3>AgroClimate</h3><p>Clima, pronósticos y análisis productivo para cada campo.</p></div></div>
     <ul>{agro.map(x=><li key={x}>{x}</li>)}</ul><span className="rci-coming">PRÓXIMAMENTE</span>
    </div>
   </article>
   <article className="rci-card">
    <div className="rci-visual rci-geo">
     <Image src={fieldPhoto} alt="Vista rural ilustrativa de mapas y oportunidades territoriales" fill sizes="(max-width:700px) 100vw, 35vw"/>
     <div className="rci-zones"/><div className="rci-geo-outline"/>
     <span className="rci-geo-pin">⌖</span><div className="rci-geo-panel">Zonas de demanda<small>Representación conceptual</small></div>
    </div>
    <div className="rci-card-body"><div className="rci-heading"><span className="rci-symbol">▱</span><div><h3>GeoMarket</h3><p>Mapas, planos, información territorial y zonas de demanda.</p></div></div>
     <ul>{geo.map(x=><li key={x}>{x}</li>)}</ul><span className="rci-coming">PRÓXIMAMENTE</span>
    </div>
   </article>
  </div>
  <style>{`
  .rci{background:#202223;color:#f0f0ef;padding:26px clamp(18px,2.5vw,48px);font-family:inherit}
  .rci-grid{display:grid;grid-template-columns:.85fr 1fr 1fr;gap:20px;max-width:1700px;margin:auto}
  .rci-intro{padding:42px 12px 20px 8px}
  .rci-kicker{font-size:12px;letter-spacing:.27em;color:#b9ad91}
  .rci-intro h2{font-size:clamp(33px,3.5vw,62px);line-height:1.04;letter-spacing:-.045em;margin:26px 0 20px}
  .rci-lead{font-size:clamp(18px,1.65vw,26px);line-height:1.4;color:#c5c5c5;max-width:370px}
  .rci-benefits{margin-top:36px;display:grid;gap:22px}
  .rci-benefits p{display:grid;grid-template-columns:44px 1fr;gap:2px 14px;margin:0}
  .rci-benefits p>span{grid-row:span 2;font-size:29px;color:#b8a67f}
  .rci-benefits strong{font-size:17px}.rci-benefits small{color:#bcbcbc;font-size:14px;line-height:1.5}
  .rci-card{border:1px solid #404243;border-radius:18px;background:#252728;overflow:hidden;min-width:0}
  .rci-visual{height:235px;position:relative;overflow:hidden;background:#424743}
  .rci-visual img{object-fit:cover;filter:grayscale(1) brightness(.65) contrast(1.05)}
  .rci-weather-panel,.rci-geo-panel{position:absolute;top:15px;left:15px;background:#1b1e1edb;border:1px solid #7777;border-radius:8px;padding:12px;display:grid;gap:6px;font-size:12px}
  .rci-weather-panel strong{font-size:28px}.rci-weather-panel small,.rci-geo-panel small{color:#bcbcbc;font-size:11px}
  .rci-field-outline{position:absolute;left:41%;top:18%;width:44%;height:56%;border:2px solid #dedede9c;background:#d1d1d124;transform:rotate(13deg) skew(-9deg)}
  .rci-forecast{position:absolute;bottom:12px;left:12px;right:12px;display:flex;justify-content:space-around;background:#171919cf;border-radius:8px;padding:12px 4px;font-size:12px}
  .rci-zones{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 45%,#b8b8b870,transparent 50%),radial-gradient(ellipse at 32% 67%,#f4f4f42a,transparent 55%)}
  .rci-geo-outline{position:absolute;left:25%;top:22%;width:54%;height:57%;border:2px solid #e1e1e1b0;transform:rotate(-10deg) skew(8deg)}
  .rci-geo-pin{position:absolute;left:57%;top:43%;font-size:42px;color:#fff}
  .rci-geo-panel{left:auto;right:12px}
  .rci-card-body{padding:24px 24px 28px}
  .rci-heading{display:flex;gap:17px;align-items:flex-start}.rci-symbol{font-size:40px;color:#bca77e;line-height:1}
  .rci-heading h3{font-size:clamp(23px,2vw,33px);margin:0 0 6px}.rci-heading p{color:#c6c6c6;line-height:1.4;font-size:16px;margin:0}
  .rci-card ul{list-style:none;padding:0;margin:24px 0;display:grid;gap:10px}
  .rci-card li{font-size:15px;color:#d2d2d2;line-height:1.35;display:flex;gap:12px}.rci-card li:before{content:"✓";color:#c4b08b;font-weight:700}
  .rci-coming{display:inline-block;border:1px solid #8e8168;border-radius:30px;color:#d0c0a1;font-size:11px;letter-spacing:.16em;padding:11px 17px}
  @media(max-width:1050px){.rci-grid{grid-template-columns:1fr 1fr}.rci-intro{grid-column:1/-1;padding:12px}.rci-benefits{grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}}
  @media(max-width:650px){.rci{padding:20px 14px}.rci-grid{display:grid;grid-template-columns:1fr;gap:16px}.rci-intro{grid-column:auto}.rci-intro h2{font-size:40px;margin:14px 0}.rci-lead{font-size:19px}.rci-benefits{grid-template-columns:1fr;gap:12px}.rci-benefits p>span{font-size:22px}.rci-visual{height:190px}.rci-card-body{padding:20px}.rci-heading h3{font-size:25px}.rci-card li{font-size:14px}}
  `}</style>
 </section>;
}
