"use client";
import { homeFAQContent } from "@/data/home-faq";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
export default function LandingFAQ() {
    const country = useRegionalCountry();
    const copy = homeFAQContent(country);
    return (<section className="rcf-faq" id="preguntas" aria-labelledby="rcf-faq-title">
      <div className="rcf-faq__container">
        <div className="rcf-faq__intro">
          <p className="rcf-faq__eyebrow">{copy.label}</p>
          <h2 id="rcf-faq-title" className="rcf-faq__title">
            <span>{copy.headline}</span>
            <span>{copy.emphasis}</span>
          </h2>
          <span className="rcf-faq__rule" aria-hidden="true"/>
          <p className="rcf-faq__subtitle">{copy.intro}</p>
        </div>
        <div className="rcf-faq__list">
          {copy.items.map((item) => (<details key={item.question} className="rcf-faq__item" name="rentocampo-faq">
              <summary className="rcf-faq__question">
                <span>{item.question}</span>
                <span className="rcf-faq__symbol" aria-hidden="true"/>
              </summary>
              <div className="rcf-faq__answer">
                <p>{item.answer}</p>
              </div>
            </details>))}
        </div>
      </div>
    </section>);
}
