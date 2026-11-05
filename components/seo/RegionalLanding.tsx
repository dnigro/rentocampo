import Link from "next/link";

type Market = "US" | "BR";

const copy = {
  US: {
    lang: "en-US",
    market: "United States",
    eyebrow: "FARMLAND · FARMERS · RURAL SERVICES",
    title: "Your land has value. Put it on the map.",
    intro: "RentoCampo connects landowners, farmers and rural service providers. Explore land opportunities, list your property or offer agricultural services. Find each other on the map and chat directly.",
    benefit: "0% commission · Direct contact",
    primary: "List your farmland for free",
    secondary: "Explore farmland",
    services: "Browse rural services",
    section: "A simpler way to connect in rural areas.",
    cards: [
      { title: "Explore the map", text: "Choose the region that matters to you and discover available listings." },
      { title: "Connect directly", text: "Use RentoCampo's online chat to speak with the person behind a listing." },
      { title: "Offer rural services", text: "Show farmers where you work and which agricultural services you provide." },
    ],
    detailsTitle: "Made for landowners, farmers and rural contractors",
    details: "Whether you have land to offer, are looking for a property or work in the rural sector, you can create an account and connect with others. Listings and contacts are free during this growth stage. RentoCampo does not take a commission on agreements between users.",
    provider: "Offer your services",
    back: "Argentina · Español",
    other: "Brasil · Português",
    faqTitle: "How does RentoCampo work?",
    faq: "Search farmland or rural services, choose an area and contact the publisher via chat. Landowners and service providers can register and publish. Any lease, sale or service agreement is arranged directly between the parties.",
  },
  BR: {
    lang: "pt-BR",
    market: "Brasil",
    eyebrow: "TERRAS · PRODUTORES · SERVIÇOS RURAIS",
    title: "Sua terra tem valor. Coloque-a no mapa.",
    intro: "A RentoCampo conecta proprietários de terras, produtores e prestadores de serviços rurais. Procure oportunidades, anuncie sua propriedade ou ofereça serviços agrícolas. Encontre pessoas no mapa e converse diretamente.",
    benefit: "0% de comissão · Contato direto",
    primary: "Anunciar minha terra grátis",
    secondary: "Explorar terras",
    services: "Buscar serviços rurais",
    section: "Uma forma mais simples de conectar o campo.",
    cards: [
      { title: "Explore o mapa", text: "Selecione a região de seu interesse e descubra os anúncios disponíveis." },
      { title: "Converse diretamente", text: "Use o chat da RentoCampo para falar com quem publicou o anúncio." },
      { title: "Ofereça serviços rurais", text: "Mostre onde você atua e quais serviços agrícolas oferece aos produtores." },
    ],
    detailsTitle: "Para proprietários, produtores e prestadores de serviços",
    details: "Se você tem terra para oferecer, procura uma propriedade ou trabalha no setor rural, pode criar sua conta e se conectar. Anúncios e contatos são gratuitos nesta etapa de crescimento. A RentoCampo não cobra comissão pelos acordos entre usuários.",
    provider: "Oferecer meus serviços",
    back: "Argentina · Español",
    other: "United States · English",
    faqTitle: "Como funciona a RentoCampo?",
    faq: "Busque terras ou serviços rurais, escolha uma região e entre em contato pelo chat. Proprietários e prestadores podem criar uma conta e anunciar. Os acordos de arrendamento, venda ou contratação são feitos diretamente entre as partes.",
  },
} as const;

export default function RegionalLanding({ market }: { market: Market }) {
  const t = copy[market];
  const target = "pais=" + market;
  const fields = "/campos?" + target;
  const services = "/servicios-rurales?" + target;
  const owner = "/register?" + target + "&tipo=propietario";
  const provider = "/register?" + target + "&tipo=prestador";

  return (
    <main lang={t.lang} className="min-h-screen bg-[#edf1f5] text-[#172638]">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#1a2c42]" aria-label="RentoCampo home">RentoCampo</Link>
        <nav aria-label={market === "US" ? "Navigation" : "Navegação"} className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href={fields} className="hover:underline">{t.secondary}</Link>
          <Link href={services} className="hover:underline">{t.services}</Link>
          <Link href={market === "US" ? "/br" : "/us"} className="rounded-full border border-[#acbacb] px-3 py-2 hover:bg-white">{t.other}</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-5 md:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#172738] px-6 py-14 text-white shadow-xl md:px-14 md:py-20"
          style={{ backgroundImage: "linear-gradient(92deg,rgba(16,31,47,.99) 0%,rgba(16,31,47,.93) 55%,rgba(16,31,47,.60) 100%),url('/rentocampo-hero-campo-bn-1920x1080.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#b8c9dc]">{t.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#e6edf5] md:text-lg">{t.intro}</p>
          <p className="mt-5 text-sm font-extrabold uppercase tracking-wider text-[#dce6f1]">{t.benefit}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={owner} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-center font-bold text-[#182a3d] hover:bg-[#dae7f4]">{t.primary}</Link>
            <Link href={fields} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-6 py-3 text-center font-bold text-white hover:bg-white/10">{t.secondary}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8" aria-labelledby="regional-steps">
        <h2 id="regional-steps" className="max-w-3xl text-2xl font-black tracking-tight md:text-3xl">{t.section}</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {t.cards.map((item, index) => (
            <article key={item.title} className="rounded-2xl border border-[#d5dee8] bg-white p-6 shadow-sm">
              <span className="text-sm font-black text-[#637a96]">0{index + 1}</span>
              <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#43566b]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 md:px-8">
        <div className="rounded-2xl bg-white p-7 md:p-10">
          <h2 className="max-w-3xl text-2xl font-black tracking-tight">{t.detailsTitle}</h2>
          <p className="mt-4 max-w-4xl leading-7 text-[#45576b]">{t.details}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={provider} className="rounded-full bg-[#263f59] px-6 py-3 font-bold text-white hover:bg-[#385778]">{t.provider}</Link>
            <Link href={services} className="rounded-full border border-[#a9b9c9] px-6 py-3 font-bold text-[#263f59] hover:bg-[#eef2f7]">{t.services}</Link>
          </div>
        </div>
        <div className="mt-9 max-w-4xl">
          <h2 className="text-xl font-extrabold">{t.faqTitle}</h2>
          <p className="mt-3 leading-7 text-[#43566b]">{t.faq}</p>
        </div>
      </section>
      <footer className="border-t border-[#cfd8e2] px-5 py-7 text-center text-sm text-[#475d72]">
        <Link href="/" className="font-bold hover:underline">{t.back}</Link>
        <span className="mx-3" aria-hidden="true">·</span>
        RentoCampo © 2026
      </footer>
    </main>
  );
}
