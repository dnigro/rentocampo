import Link from "next/link";
export default function LandingCTA() {
  return <section className="rc-final"><div className="rc-shell"><p className="rc-kicker">Tu próxima oportunidad empieza acá</p><h2>Poné tu campo<br />en movimiento.</h2><Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">Publicar gratis →</Link></div></section>;
}
