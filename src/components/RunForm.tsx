import { useCallback, useEffect, useState } from "react";
import { getDefaultResolvers } from "../api";
import type { RunOptions } from "../types";
import { useRunStore } from "../state/useRunStore";
import ExportButtons from "./ExportButtons";

const RECORD_TYPES = ["A","AAAA","CNAME","MX","TXT","NS","SOA"];

export default function RunForm() {
  const [resolvers, setResolvers] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [selectedResolvers, setSelectedResolvers] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(RECORD_TYPES);
  const [openOpts, setOpenOpts] = useState(false);
  const [dnssec, setDnssec] = useState({do:true, strict_alg_match:false, expiry_threshold_hours:48});
  const [rate, setRate] = useState({max_qps:20, timeout_sec:4, retries:1});
  const [enableAxfr, setEnableAxfr] = useState(false);
  const [axfrTimeout, setAxfrTimeout] = useState(8);
  const { startRun, loading, current } = useRunStore();

  useEffect(() => {
    getDefaultResolvers().then(d => {
      setResolvers(d);
      setSelectedResolvers(d);
    });
  }, []);

  function toggleResolver(r: string) {
    setSelectedResolvers(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev, r]);
  }
  function toggleType(t: string) {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  }
  const runCurrent = useCallback(async () => {
    const effectiveResolvers = selectedResolvers.length ? selectedResolvers : resolvers;
    if (effectiveResolvers.length === 0 || !domain.trim()) return;
    const opts: RunOptions = {
      domain,
      resolvers: effectiveResolvers,
      record_types: selectedTypes,
      dnssec,
      rate_limits: rate,
      enable_axfr: enableAxfr,
      axfr_timeout_sec: axfrTimeout
    };
    await startRun(opts);
  }, [domain, selectedResolvers, selectedTypes, dnssec, rate, startRun, resolvers, enableAxfr, axfrTimeout]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runCurrent();
  }

  const progress = current?.progress ?? 0;
  const exportLabel = current?.run?.domain || current?.options?.domain || domain || "DNS run";
  const toggleLabel = openOpts ? "Hide advanced options" : "Advanced options";
  const chevron = (
    <svg
      className={`ciq-chevron ${openOpts ? "ciq-chevron--open" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
    </svg>
  );

  return (
    <div className="ciq-scan-card">
      <form onSubmit={onSubmit} aria-label="Run DNS test" className="ciq-run-form">
        <label htmlFor="domain-input" className="ciq-field-label">
          Domain name
        </label>
        <div className="ciq-field-controls">
          <input
            id="domain-input"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="example.com"
            required
            className="ciq-input"
          />
          <button type="submit" className="ciq-btn ciq-btn--primary" disabled={loading || !domain.trim()}>
            scan
          </button>
        </div>
        <div className="ciq-progress">
          <div className="ciq-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      </form>

      <div className="ciq-card-divider" aria-hidden="true" />

      <div className="ciq-advanced">
        <button
          type="button"
          className="ciq-advanced__toggle"
          onClick={() => setOpenOpts(o => !o)}
          aria-expanded={openOpts}
          aria-controls="advanced-panel"
        >
          <span>{toggleLabel}</span>
          {chevron}
        </button>

        <div
          id="advanced-panel"
          className={`ciq-advanced__body ${openOpts ? "ciq-advanced__body--open" : ""}`}
          hidden={!openOpts}
        >
          <div className="ciq-advanced__grid">
            <div className="ciq-advanced__column">
              <div className="ciq-panel">
                <div className="ciq-panel__label">Resolvers</div>
                <div className="ciq-chips">
                  {resolvers.map(r => {
                    const active = selectedResolvers.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        className={`ciq-chip ${active ? "is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => toggleResolver(r)}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                <p className="ciq-form-hint">Select public resolvers or include authoritative targets.</p>
              </div>

              <div className="ciq-panel">
                <div className="ciq-panel__label">Record types</div>
                <div className="ciq-checks">
                  {RECORD_TYPES.map(t => (
                    <label key={t}>
                      <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} /> {t}
                    </label>
                  ))}
                </div>
              </div>

              <div className="ciq-panel">
                <div className="ciq-panel__label">Rate limits</div>
                <div className="ciq-rate-grid">
                  <label>
                    <span>Max QPS</span>
                    <input
                      type="number"
                      value={rate.max_qps}
                      onChange={e => setRate(s => ({ ...s, max_qps: +e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Timeout (s)</span>
                    <input
                      type="number"
                      value={rate.timeout_sec}
                      onChange={e => setRate(s => ({ ...s, timeout_sec: +e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Retries</span>
                    <input
                      type="number"
                      value={rate.retries}
                      onChange={e => setRate(s => ({ ...s, retries: +e.target.value }))}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="ciq-advanced__column ciq-advanced__column--panels">
              <fieldset className="ciq-panel">
                <legend>DNSSEC</legend>
                <label className="ciq-checkbox-inline" title="Request DNSSEC data (DNSSEC OK).">
                  <input type="checkbox" checked={dnssec.do} onChange={e => setDnssec(s => ({ ...s, do: e.target.checked }))} />
                  <span>DO bit</span>
                </label>
                <label className="ciq-checkbox-inline" title="Fail if algorithm not in allowlist.">
                  <input
                    type="checkbox"
                    checked={dnssec.strict_alg_match}
                    onChange={e => setDnssec(s => ({ ...s, strict_alg_match: e.target.checked }))}
                  />
                  <span>Strict alg match</span>
                </label>
                <label>
                  <span>Expiry thresh (h)</span>
                  <input
                    type="number"
                    value={dnssec.expiry_threshold_hours}
                    onChange={e => setDnssec(s => ({ ...s, expiry_threshold_hours: +e.target.value }))}
                  />
                </label>
              </fieldset>

              <fieldset className="ciq-panel">
                <legend>AXFR</legend>
                <label className="ciq-checkbox-inline">
                  <input type="checkbox" checked={enableAxfr} onChange={e => setEnableAxfr(e.target.checked)} />
                  <span>Try AXFR where allowed</span>
                </label>
                <label>
                  <span>AXFR timeout (s)</span>
                  <input
                    type="number"
                    value={axfrTimeout}
                    disabled={!enableAxfr}
                    onChange={e => setAxfrTimeout(+e.target.value)}
                  />
                </label>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <div className="ciq-export-row">
        {current ? (
          <div className="ciq-export-row__actions">
            <ExportButtons
              domain={exportLabel}
              jsonPayload={current}
              csvRows={current.records ?? []}
            />
          </div>
        ) : (
          <div className="ciq-export-row__placeholder">
            <button className="ciq-btn ciq-btn--primary ciq-export-btn" type="button" disabled>
              Export CSV
            </button>
            <button className="ciq-btn ciq-btn--primary ciq-export-btn" type="button" disabled>
              Export JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
