export default function LandingIntelligence() {
  return (
    <section className="rc-intelligence" aria-labelledby="rc-intelligence-title">
      <div className="rc-intelligence-main">
        <div className="rc-intelligence-intro">
          <span className="rc-intelligence-eyebrow">PRÓXIMAMENTE</span>
          <h2 id="rc-intelligence-title">RentoCampo <span>evoluciona</span></h2>
          <p>Nuevos servicios para más información, más oportunidades y mejores decisiones.</p>
        </div>
        <div className="rc-intelligence-products">
          <article className="rc-intelligence-product"><span className="rc-intelligence-icon" aria-hidden="true">☁</span><div><h3>AgroClimate</h3><p>Clima, pronósticos y análisis productivo para cada campo.</p></div></article>
          <article className="rc-intelligence-product"><span className="rc-intelligence-icon" aria-hidden="true">▱</span><div><h3>GeoMarket</h3><p>Mapas, planos, información territorial y zonas de demanda.</p></div></article>
        </div>
        <div className="rc-intelligence-land" aria-hidden="true"><div className="rc-intelligence-parcel"/><span className="rc-intelligence-pin">⌖</span></div>
      </div>
      <div className="rc-intelligence-bottom"><span>LA MISMA RED, MÁS HERRAMIENTAS PARA EL CAMPO.</span><span>TECNOLOGÍA AVANZADA. DECISIONES SIMPLES.</span></div>
      <style>{`
        .rc-intelligence{margin:0 auto 0;background:#353738;color:#f2f2f0;overflow:hidden;font-family:inherit}
        .rc-intelligence-main{position:relative;min-height:340px;display:grid;grid-template-columns:34% 35% 31%;align-items:center;isolation:isolate}
        .rc-intelligence-intro{padding:42px 22px 42px max(32px,calc((100vw - 1440px)/2 + 36px));z-index:2}
        .rc-intelligence-eyebrow{font-size:12px;letter-spacing:.28em;color:#d2c8aa}
        .rc-intelligence-intro h2{font-size:clamp(34px,3.4vw,60px);line-height:1.02;letter-spacing:-.04em;margin:24px 0 18px;font-weight:750}
        .rc-intelligence-intro h2 span{display:block;color:#c4c5c4}
        .rc-intelligence-intro p{font-size:clamp(15px,1.25vw,20px);line-height:1.5;color:#dadbd9;max-width:440px}
        .rc-intelligence-products{display:grid;gap:14px;z-index:2;padding:25px 8px}
        .rc-intelligence-product{display:flex;gap:20px;align-items:center;border:1px solid #747574;background:#ffffff0b;border-radius:12px;padding:23px 20px;backdrop-filter:blur(3px)}
        .rc-intelligence-icon{font-size:38px;line-height:1;color:#c6ad78;width:54px;text-align:center}
        .rc-intelligence-product h3{font-size:24px;letter-spacing:-.025em;margin:0 0 6px}
        .rc-intelligence-product p{color:#d6d7d6;line-height:1.4;font-size:15px;margin:0}
        .rc-intelligence-land{height:100%;min-height:340px;position:relative;overflow:hidden;background:linear-gradient(125deg,#0008,#0002),repeating-linear-gradient(153deg,transparent 0 38px,#a1a1a124 39px 41px,transparent 42px 90px),repeating-linear-gradient(55deg,#656a65 0 65px,#474e4a 66px 140px,#737873 141px 192px,#3f4842 193px 255px);filter:grayscale(1);clip-path:polygon(16% 0,100% 0,100% 100%,0 100%)}
        .rc-intelligence-parcel{position:absolute;top:27%;left:27%;width:52%;height:42%;border:2px solid #ddd;transform:skew(-19deg) rotate(-8deg);box-shadow:0 0 0 200px #0000000a}
        .rc-intelligence-pin{position:absolute;left:54%;top:36%;font-size:54px;color:white}
        .rc-intelligence-bottom{background:#222424;display:flex;justify-content:space-between;gap:24px;padding:23px max(32px,calc((100vw - 1440px)/2 + 36px));font-size:11px;letter-spacing:.2em;color:#e1e1df}
        @media(max-width:900px){.rc-intelligence-main{grid-template-columns:1fr 1fr}.rc-intelligence-intro{padding:36px 22px}.rc-intelligence-products{padding:24px}.rc-intelligence-land{display:none}}
        @media(max-width:600px){.rc-intelligence-main{display:block;min-height:0}.rc-intelligence-intro{padding:35px 24px 10px}.rc-intelligence-intro h2{font-size:42px;margin:15px 0}.rc-intelligence-products{padding:16px 24px 32px}.rc-intelligence-product{padding:17px 14px}.rc-intelligence-product h3{font-size:21px}.rc-intelligence-product p{font-size:14px}.rc-intelligence-bottom{padding:20px 24px;display:grid;gap:10px;font-size:10px;line-height:1.6}}
      `}</style>
    </section>
  );
}
