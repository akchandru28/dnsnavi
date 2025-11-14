import "./styles.css";
import Header from "./components/Header";
import RunForm from "./components/RunForm";
import { Section } from "./components/Accordion";
import RecordsTable from "./components/RecordsTable";
import DnssecPanel from "./components/DnssecPanel";
import DiffGrid from "./components/DiffGrid";
import ResolverCoverage from "./components/ResolverCoverage";
import NameserverHealth from "./components/NameserverHealth";
import { useRunStore } from "./state/useRunStore";
import SummaryPills from "./components/SummaryPills";

export default function App() {
  const { current } = useRunStore();

  return (
    <div className="ciq-shell">
      <Header>
        <RunForm />
      </Header>

      <div className="ciq-app">
        {current && (
          <section className="ciq-results">
            <div className="ciq-stack">
              <article className="ciq-card ciq-card--summary">
                <div className="ciq-card__header">
                  <p className="ciq-card__eyebrow">Latest scan summary</p>
                  <h2 className="ciq-card__title">Run details</h2>
                </div>

                <div className="ciq-summary-grid">
                  <div className="ciq-summary-grid__main">
                    {current.summary ? (
                      <>
                        <SummaryPills
                          passC={current.summary.pass_count ?? 0}
                          warnC={current.summary.warn_count ?? 0}
                          failC={current.summary.fail_count ?? 0}
                        />

                        <div className="ciq-info-row">
                          <span>Run ID</span>
                          <strong>{current.run_id}</strong>
                        </div>

                        <div className="ciq-info-row">
                          <span>Phase</span>
                          <span>{current.phase}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted text-sm">Run summary pending...</div>
                    )}
                  </div>

                  <div className="ciq-summary-grid__meta">
                    <div className="ciq-info-row ciq-info-row--stacked">
                      <span className="ciq-info-label">Records scanned</span>
                      <strong>{current.summary?.records_scanned ?? 0}</strong>
                    </div>
                    <div className="ciq-info-row ciq-info-row--stacked">
                      <span className="ciq-info-label">Resolvers</span>
                      <strong>{current.summary?.resolver_count ?? 0}</strong>
                    </div>

                    {current.errors?.length > 0 && (
                      <div className="ciq-error-block text-error">
                        Errors: {current.errors.join("; ")}
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {current.overview && !current.overview.auth_union_present && (
                <article className="ciq-card ciq-card--alert">
                  Authoritative nameserver sampling unavailable; results are advisory.
                </article>
              )}

              <article className="ciq-card">
                <Section title="Drift details" defaultOpen>
                  {current.overview && (
                    <DiffGrid
                      ov={current.overview}
                      diffRows={current.drift?.diff_rows ?? []}
                      driftScore={current.drift?.score ?? 0}
                    />
                  )}
                </Section>
              </article>

              <article className="ciq-card">
                <Section title="Zone analytics">
                  {current.overview && (
                    <RecordsTable ov={current.overview} axfrSummary={current.meta?.axfr_summary} />
                  )}
                </Section>
              </article>

              <article className="ciq-card">
                <Section title="DNSSEC linting">
                  {current.dnssec ? (
                    <DnssecPanel res={current.dnssec} />
                  ) : (
                    <div className="text-muted">DNSSEC results not available for this run.</div>
                  )}
                </Section>
              </article>

              <article className="ciq-card">
                <Section title="Resolver coverage">
                  <ResolverCoverage
                    authority={(current.meta?.auth_ns || []).map((x: any) => `${x[0]}@${x[1]}`)}
                    publicResolvers={current.options?.resolvers}
                  />
                </Section>
              </article>

              <article className="ciq-card">
                <Section title="Nameserver health">
                  {current.ns_health?.ns?.length ? (
                    <NameserverHealth items={current.ns_health!.ns} />
                  ) : (
                    <div className="text-muted">No nameserver telemetry collected for this run.</div>
                  )}
                </Section>
              </article>

              <article className="ciq-card">
                <Section title="Artifacts & history">
                  <div className="ciq-artifacts">
                    <div>
                      Run ID: <code>{current.run_id}</code>
                    </div>
                    <div>
                      Records scanned: <strong>{current.summary?.records_scanned ?? 0}</strong>
                    </div>
                    <div>
                      Resolvers: <strong>{current.summary?.resolver_count ?? 0}</strong>
                    </div>
                    {current.errors?.length > 0 && (
                      <div className="text-error">Errors: {current.errors.join("; ")}</div>
                    )}
                  </div>
                </Section>
              </article>
            </div>
          </section>
        )}
      </div>

      <footer className="ciq-footer">
        <span>© {new Date().getFullYear()} CompasIQ. All rights reserved</span>
      </footer>
    </div>
  );
}
