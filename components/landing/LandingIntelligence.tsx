
export default function LandingIntelligence() {
 return <section className="rci" aria-labelledby="rci-title">
  <div className="rci-grid">
   <div className="rci-intro">
    <span className="rci-kicker">PRÓXIMAMENTE</span>
    <h2 id="rci-title">RentoCampo</h2>
    <p className="rci-lead">Información que transforma el valor del campo.</p>
    <div className="rci-benefits">
     <p><span>▥</span><strong>Información para decidir</strong><small>Clima, suelo, territorio y demanda.</small></p>
     <p><span>♧</span><strong>Decisiones más claras</strong><small>Para productores, propietarios y servicios rurales.</small></p>
     <p><span>◎</span><strong>Más oportunidades</strong><small>En un solo lugar.</small></p>
    </div>
   </div>
   <article className="rci-card">
    <div className="rci-visual rci-weather">
     <div className="rci-background rci-background-agro" role="img" aria-label="Paisaje agrícola de cultivo en tonos grises"/>
    </div>
    <div className="rci-card-body"><div className="rci-heading"><span className="rci-symbol">☁</span><div><h3>AgroClimate</h3><p>Datos históricos del clima y pronósticos por campo y zona, con alertas de heladas y precipitaciones, humedad y temperatura del suelo y ventanas de siembra y cosecha. Más información para planificar la producción.</p></div></div>
     <span className="rci-coming">PRÓXIMAMENTE</span>
    </div>
   </article>
   <article className="rci-card">
    <div className="rci-visual rci-geo">
     <div className="rci-background rci-background-geo" role="img" aria-label="Vista aérea de parcelas agrícolas y caminos rurales en tonos grises"/>
    </div>
    <div className="rci-card-body"><div className="rci-heading"><span className="rci-symbol">▱</span><div><h3>GeoMarket</h3><p>Mapas y planos para explorar campos y regiones, conocer suelos y aptitud productiva, identificar zonas de interés y evaluar accesos, infraestructura y servicios rurales cercanos.</p></div></div>
     <span className="rci-coming">PRÓXIMAMENTE</span>
    </div>
   </article>
  </div>
  <div className="rci-footer"><span>LA MISMA RED, MÁS HERRAMIENTAS PARA EL CAMPO.</span><span>TECNOLOGÍA AVANZADA. DECISIONES SIMPLES. →</span></div>
  <style>{`
  .rci{background:#111719;color:#f0f0ef;padding:26px clamp(18px,2.5vw,48px);font-family:inherit}
  .rci-grid{display:grid;grid-template-columns:.85fr 1fr 1fr;gap:20px;max-width:1700px;margin:auto}
  .rci-intro{padding:42px 12px 20px 8px}
  .rci-kicker{display:block;font-size:clamp(28px,2.65vw,46px);font-weight:800;line-height:1.12;letter-spacing:.035em;color:#d4b16e;white-space:nowrap}
  .rci-intro h2{font-weight:400;font-size:clamp(30px,3vw,50px);line-height:1.12;letter-spacing:-.035em;margin:12px 0 20px;white-space:nowrap}
  .rci-lead{font-size:clamp(18px,1.65vw,26px);line-height:1.4;color:#c5c5c5;max-width:370px}
  .rci-benefits{margin-top:36px;display:grid;gap:22px}
  .rci-benefits p{display:grid;grid-template-columns:44px 1fr;gap:2px 14px;margin:0}
  .rci-benefits p>span{grid-row:span 2;font-size:29px;color:#b8a67f}
  .rci-benefits strong{font-size:17px}.rci-benefits small{color:#bcbcbc;font-size:14px;line-height:1.5}
  .rci-card{border:1px solid #404243;border-radius:18px;background:#151b1d;overflow:hidden;min-width:0;align-self:start}
  .rci-visual{aspect-ratio:2.05 / 1;height:auto;position:relative;overflow:hidden;background:#111719}
  .rci-background{position:absolute;inset:0;background-size:contain;background-repeat:no-repeat;background-position:center;background-color:#111719;filter:grayscale(1) brightness(.8) contrast(1.05)}.rci-background-agro{background-image:url("/intelligence-agro-approved.webp");background-position:center;filter:none}.rci-background-geo{background-image:url("/intelligence-geo-approved.webp");background-position:center;filter:none}
  .rci-weather-panel,.rci-geo-panel{position:absolute;top:15px;left:15px;background:#1b1e1edb;border:1px solid #7777;border-radius:8px;padding:12px;display:grid;gap:6px;font-size:12px}
  .rci-weather-panel strong{font-size:28px}.rci-weather-panel small,.rci-geo-panel small{color:#bcbcbc;font-size:11px}
  .rci-field-outline{position:absolute;left:41%;top:18%;width:44%;height:56%;border:2px solid #dedede9c;background:#d1d1d124;transform:rotate(13deg) skew(-9deg)}
  .rci-forecast{position:absolute;bottom:12px;left:12px;right:12px;display:flex;justify-content:space-around;background:#171919cf;border-radius:8px;padding:12px 4px;font-size:12px}
  .rci-zones{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 45%,#b8b8b870,transparent 50%),radial-gradient(ellipse at 32% 67%,#f4f4f42a,transparent 55%)}
  .rci-geo-outline{position:absolute;left:25%;top:22%;width:54%;height:57%;border:2px solid #e1e1e1b0;transform:rotate(-10deg) skew(8deg)}
  .rci-geo-pin{position:absolute;left:57%;top:43%;font-size:42px;color:#fff}
  .rci-geo-panel{left:12px;right:auto;min-width:170px}.rci-map-thumbs{position:absolute;right:10px;top:12px;bottom:12px;width:100px;display:flex;flex-direction:column;justify-content:space-around;gap:5px}.rci-map-thumbs span{flex:1;border:1px solid #5c5c5c;background:#151a1ac9;border-radius:5px;display:flex;align-items:end;padding:5px;color:#e0e0e0;font-size:10px}
  .rci-metric,.rci-wind{position:absolute;right:12px;top:12px;padding:10px 12px;background:#111719e8;border-radius:8px;display:grid;gap:4px}
  .rci-wind{top:94px}.rci-metric small,.rci-wind small{color:#bdbdbd;font-size:11px}.rci-metric strong,.rci-wind strong{font-size:18px}.rci-metric span{color:#bda16c;letter-spacing:5px}
  .rci-geo .rci-geo-outline{left:41%;top:20%;width:30%;height:56%;transform:rotate(35deg) skew(-8deg);background:#b89b5b60;border:2px solid #e4d6b9}
  .rci-geo .rci-geo-pin{left:52%;top:42%;color:#e0bd79}
  .rci-footer{max-width:1700px;margin:20px auto 0;padding-top:15px;border-top:1px solid #434946;display:flex;justify-content:space-between;gap:18px;color:#eee3cb;font-size:12px;font-weight:800;letter-spacing:.10em;line-height:1.5}
  @media(max-width:650px){.rci-footer{flex-direction:column;letter-spacing:.08em}.rci-metric,.rci-wind{padding:6px;font-size:12px}.rci-metric strong,.rci-wind strong{font-size:14px}}
  .rci-card-body{padding:20px 22px 22px}
  .rci-heading{display:flex;gap:14px;align-items:flex-start}.rci-symbol{font-size:40px;color:#bca77e;line-height:1}
  .rci-heading h3{font-weight:800;font-size:clamp(23px,2vw,33px);margin:0 0 8px}.rci-heading p{color:#c6c6c6;line-height:1.5;font-size:15px;margin:0}
  .rci-card ul{list-style:none;padding:0;margin:24px 0;display:grid;gap:10px}
  .rci-card li{font-size:15px;color:#d2d2d2;line-height:1.35;display:flex;gap:12px}.rci-card li:before{content:"✓";color:#c4b08b;font-weight:700}
  .rci-coming{display:inline-block;margin-top:17px;border:1px solid #8e8168;border-radius:30px;color:#d0c0a1;font-size:11px;letter-spacing:.16em;padding:11px 17px}
  @media(max-width:1050px){.rci-grid{grid-template-columns:1fr 1fr}.rci-intro{grid-column:1/-1;padding:12px}.rci-benefits{grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}}
  @media(max-width:650px){.rci{padding:20px 14px}.rci-grid{display:grid;grid-template-columns:1fr;gap:16px}.rci-intro{grid-column:auto}.rci-intro h2{font-size:clamp(29px,8vw,42px);margin:10px 0}.rci-kicker{font-size:clamp(25px,7vw,40px);letter-spacing:.02em}.rci-lead{font-size:19px}.rci-benefits{grid-template-columns:1fr;gap:12px}.rci-benefits p>span{font-size:22px}.rci-visual{height:auto;aspect-ratio:2.05 / 1}.rci-card-body{padding:18px}.rci-heading h3{font-size:25px}.rci-heading p{font-size:14px;line-height:1.5}}
  `}</style>
 </section>;
}
