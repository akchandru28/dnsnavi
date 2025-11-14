import type { ReactNode } from "react";

interface HeaderProps {
  children: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <>
      <div className="ciq-header__bar">
        <div className="ciq-header__brand">
          <img src="/src/assets/ciq-fav.ico" alt="CompasIQ logo" className="ciq-header__mark" />
          <div className="ciq-header__brand-copy">
            <span className="ciq-header__brand-name">CompasIQ</span>
            <span className="ciq-header__brand-subline">DNS Navigator</span>
          </div>
        </div>
        <a
          className="ciq-header__link"
          href="https://compasiq.com"
          target="_blank"
          rel="noreferrer"
        >
          compasiq.com
        </a>
      </div>

      <header className="ciq-header">
        <div className="ciq-app">
          <section className="ciq-hero">
            <div className="ciq-hero__copy">
              <p className="ciq-hero__eyebrow">ADVANCED DNS ANALYTICS</p>
              <h1 className="ciq-hero__title">DNS Navigator</h1>
              <p className="ciq-hero__lead">
                Scan domains to reveal DNS drift, resolver certainty, and DNSSEC posture.
              </p>
              <ul className="ciq-hero__bullets">
                <li>Surface authoritative drift and resolver disagreements in real time.</li>
                <li>Track DNSSEC fidelity, expiry risk, and algorithm coverage.</li>
                <li>Map resolver, AXFR, and nameserver health across your infrastructure.</li>
              </ul>
            </div>

            <div className="ciq-hero__panel">{children}</div>
          </section>
        </div>
      </header>
    </>
  );
}
