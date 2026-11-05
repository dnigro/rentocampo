import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LandPlot, MapPinned, MessageCircle, Tractor } from "lucide-react";

type Market = "US" | "BR";
type Action = "land" | "listLand" | "services" | "offerServices";

const copy = {
  US: {
    lang: "en-US",
    region: "United States",
    language: "EN",
    switchLanguage: "PT · Brasil",
    switchRegion: "BR" as const,
    eyebrow: "FARMLAND · FARMERS · RURAL SERVICES",
    title: "Farmland and rural services. Direct connections.",
    intro: "Find land to rent or buy, list your property, or offer agricultural services. Choose a location on the map and talk directly with people in the rural sector.",
    zeroLabel: "COMMISSION",
    directLabel: "DIRECT CONTACT",
    listLand: "List your land for free",
    offerServices: "Offer rural services",
    exploreLand: "Explore farmland",
    exploreServices: "Find rural services",
    actionIntro: "What brings you here?",
    actionTitle: "One place. More rural opportunities.",
    cards: [
      {
        target: "land" as const,
        title: "I'm looking for farmland",
        description: "Explore rural properties and search by state or location.",
        cta: "Browse farmland",
      },
      {
        target: "listLand" as const,
        title: "I own land",
        description: "Put your rural property on the map and receive inquiries directly.",
        cta: "Create a free listing",
      },
      {
        target: "services" as const,
        title: "I need rural services",
        description: "Find agricultural contractors and service providers by region.",
        cta: "Browse services",
      },
    ],
    howTitle: "Simple from start to finish",
    steps: [
      { title: "Choose your area", description: "Browse farmland and rural services on the map." },
      { title: "Find a connection", description: "Review available listings or create your own." },
      { title: "Chat directly", description: "Contact the person behind the listing. No middlemen." },
    ],
    faqTitle: "How does RentoCampo work?",
    faq: "RentoCampo connects landowners, farmers and rural service providers. Registration, listings and contact are free at this stage. Any rental, sale or service agreement is arranged directly between users. Availability depends on the listings published in each region.",
    back: "Argentina · Español",
    photoLabel: "RURAL CONNECTIONS",
  },
  BR: {
    lang: "pt-BR",
    region: "Brasil",
    language: "PT",
    switchLanguage: "EN · United States",
    switchRegion: "US" as const,
    eyebrow: "TERRAS · PRODUTORES · SERVIÇOS RURAIS",
    title: "Terras e serviços rurais. Contato direto.",
    intro: "Encontre terras para arrendamento ou venda, anuncie sua propriedade ou ofereça serviços agrícolas. Escolha a região no mapa e converse diretamente com pessoas do campo.",
    zeroLabel: "COMISSÃO",
    directLabel: "CONTATO DIRETO",
    listLand: "Anunciar minha terra grátis",
    offerServices: "Oferecer serviços rurais",
    exploreLand: "Explorar terras",
    exploreServices: "Buscar serviços rurais",
    actionIntro: "O que você procura?",
    actionTitle: "Um lugar. Mais oportunidades no campo.",
    cards: [
      {
        target: "land" as const,
        title: "Procuro terras",
        description: "Explore propriedades rurais por estado ou localização.",
        cta: "Buscar terras",
      },
      {
        target: "listLand" as const,
        title: "Tenho uma propriedade",
        description: "Coloque sua terra no mapa e receba consultas diretamente.",
        cta: "Anunciar grátis",
      },
      {
        target: "services" as const,
        title: "Preciso de serviços",
        description: "Encontre prestadores de serviços agrícolas por região.",
        cta: "Buscar serviços",
      },
    ],
    howTitle: "Simples do começo ao fim",
    steps: [
      { title: "Escolha a região", description: "Explore terras e serviços rurais no mapa." },
      { title: "Encontre oportunidades", description: "Consulte anúncios ou publique sua oferta." },
      { title: "Converse diretamente", description: "Fale com quem anunciou, sem intermediários." },
    ],
    faqTitle: "Como funciona a RentoCampo?",
    faq: "A RentoCampo conecta proprietários de terras, produtores e prestadores de serviços rurais. Cadastro, anúncios e contatos são gratuitos nesta etapa. Acordos de arrendamento, venda ou serviços são feitos diretamente entre usuários. A disponibilidade depende dos anúncios publicados em cada região.",
    back: "Argentina · Español",
    photoLabel: "CONEXÕES NO CAMPO",
  },
} as const;

const cardIcons = {
  land: LandPlot,
  listLand: MapPinned,
  services: Tractor,
} as const;

export default function RegionalLanding({ market }: { market: Market }) {
  const t = copy[market];
  const params = "pais=" + market;
  const links: Record<Action, string> = {
    land: "/campos?" + params,
    listLand: "/register?" + params + "&tipo=propietario",
    services: "/servicios-rurales?" + params,
    offerServices: "/register?" + params + "&tipo=prestador",
  };

  return (
    <main lang={t.lang} className="min-h-screen bg-[#e9edf1] text-[#1b2b3c]">
      <header className="mx-auto max-w-6xl px-4 pt-3 pb-3 sm:px-6 md:px-8 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="RentoCampo">
            <Image src="/icon-512.png" alt="" width={37} height={37} className="h-9 w-9 shrink-0 rounded-lg object-contain" />
            <span className="text-[22px] font-extrabold tracking-[-.06em] text-[#182a3b] sm:text-2xl">RentoCampo</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-bold text-[#263c52] md:flex" aria-label={market === "US" ? "Main navigation" : "Navegação principal"}>
            <Link href={links.land} className="hover:underline">{t.exploreLand}</Link>
            <Link href={links.services} className="hover:underline">{t.exploreServices}</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full bg-[#d7dfe7] px-3 py-2 text-xs font-extrabold text-[#233950] sm:inline">{t.region}</span>
            <Link href={t.switchRegion === "US" ? "/us" : "/br"}
              className="rounded-full border border-[#b2c0ce] bg-white px-3 py-2 text-[12px] font-extrabold whitespace-nowrap text-[#263d54] hover:bg-[#f6f8fa]"
              lang={t.switchRegion === "US" ? "en-US" : "pt-BR"}>{t.switchLanguage}</Link>
          </div>
        </div>
        <nav className="mt-3 flex items-center gap-6 border-t border-[#d3dbe4] pt-3 text-[13px] font-bold text-[#263c52] md:hidden" aria-label={market === "US" ? "Explore RentoCampo" : "Explorar RentoCampo"}>
          <Link href={links.land}>{t.exploreLand}</Link>
          <Link href={links.services}>{t.exploreServices}</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-3 sm:px-6 md:px-8" aria-label={t.region}>
        <div className="grid overflow-hidden rounded-[24px] bg-[#182a3b] text-white shadow-[0_12px_30px_rgba(20,36,52,.11)] md:min-h-[440px] md:grid-cols-[minmax(0,1.13fr)_minmax(0,.87fr)]">
          <div className="order-2 px-6 py-7 sm:px-9 sm:py-9 md:order-1 md:px-10 md:py-12 lg:px-13">
            <p className="text-[10px] font-extrabold tracking-[.15em] text-[#b7c9da] sm:text-xs">{t.eyebrow}</p>
            <h1 className="mt-3 max-w-xl text-[31px] leading-[1.12] font-extrabold tracking-[-.045em] text-white sm:text-4xl lg:text-[46px]">{t.title}</h1>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.65] text-[#e5ebf1] sm:text-[16px]">{t.intro}</p>
            <div className="mt-5 flex items-center gap-4 border-t border-white/20 pt-4">
              <div className="flex items-baseline gap-2">
                <strong className="text-3xl leading-none font-black text-white">0%</strong>
                <span className="text-[10px] font-extrabold tracking-wider text-[#ccd7e3]">{t.zeroLabel}</span>
              </div>
              <span className="h-8 w-px bg-white/30" aria-hidden="true" />
              <div className="flex items-center gap-2 text-xs font-bold text-[#dce5ed]">
                <MessageCircle aria-hidden="true" size={19} strokeWidth={1.8} />
                {t.directLabel}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link href={links.listLand} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-[13px] font-extrabold text-[#1d3044] transition-colors hover:bg-[#e5edf6]">{t.listLand} <ArrowUpRight aria-hidden="true" size={17}/></Link>
              <Link href={links.offerServices} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#aab9c8] px-5 py-3 text-center text-[13px] font-extrabold text-white transition-colors hover:bg-white/10">{t.offerServices}</Link>
            </div>
          </div>
          <div className="relative order-1 h-[180px] overflow-hidden md:order-2 md:h-auto md:min-h-[440px] md:[clip-path:polygon(13%_0,100%_0,100%_100%,0_100%)]">
            <Image src="/image_vaca_pix.png" alt={market === "US" ? "Cattle grazing on rural farmland" : "Gado em uma propriedade rural"} fill priority sizes="(max-width: 767px) 100vw, 40vw" className="object-cover object-center grayscale contrast-[1.08]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#132437]/50 via-transparent to-[#132437]/5" aria-hidden="true" />
            <span className="absolute bottom-4 left-5 text-[10px] font-extrabold tracking-[.18em] text-white drop-shadow md:bottom-7 md:left-10">{t.photoLabel}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-14" aria-labelledby="regional-options">
        <p className="text-[11px] font-extrabold tracking-[.13em] text-[#6d7f90]">{t.actionIntro.toUpperCase()}</p>
        <h2 id="regional-options" className="mt-2 text-[26px] font-extrabold tracking-[-.035em] sm:text-3xl">{t.actionTitle}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {t.cards.map((card) => {
            const Icon = cardIcons[card.target];
            return (
              <Link key={card.target} href={links[card.target]} className="group flex flex-col rounded-2xl border border-[#d1dbe5] bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#274c73]">
                <Icon aria-hidden="true" size={25} strokeWidth={1.7} className="text-[#456582]"/>
                <h3 className="mt-3 text-[17px] font-extrabold tracking-tight">{card.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-6 text-[#506276]">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-extrabold text-[#274765]">{card.cta}<ArrowUpRight size={16} aria-hidden="true"/></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#d5dfe8] bg-[#f5f7f9]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12">
          <h2 className="text-2xl font-extrabold tracking-[-.035em]">{t.howTitle}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {t.steps.map((step, index) => (
              <div key={step.title} className="border-l-[3px] border-[#647e9a] pl-4">
                <span className="text-[12px] font-extrabold text-[#65809a]">0{index + 1}</span>
                <h3 className="mt-1 text-[16px] font-extrabold">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#506276]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <h2 className="text-xl font-extrabold">{t.faqTitle}</h2>
        <p className="mt-3 max-w-4xl text-[14px] leading-7 text-[#485d70]">{t.faq}</p>
      </section>

      <footer className="border-t border-[#d1dce6] px-4 py-6 text-center text-[13px] text-[#536779]">
        <Link href="/" className="font-extrabold text-[#1e3951] hover:underline">{t.back}</Link>
        <span aria-hidden="true" className="mx-3">·</span>
        RentoCampo © 2026
      </footer>
    </main>
  );
}
