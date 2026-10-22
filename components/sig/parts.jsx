"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useReduced from "./useReduced";

// SSR renders the END state (the no-JS fallback is the fixed state in text); on mount the client starts at the
// broken state, instantly, and reveals its controls.
export function useStart(endValue, startValue) {
  const [v, setV] = useState(endValue);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => { setV(startValue); setReady(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [v, setV, ready];
}

// A radio group in the page's language: roving tabindex, arrow keys move and select (APG radio group).
export function Segmented({ label, options, value, onChange, hidden }) {
  const refs = useRef([]);
  const move = (e, i) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].value); refs.current[n]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className="seg" hidden={hidden}>
      {options.map((o, i) => (
        <button key={o.value} ref={(el) => (refs.current[i] = el)} type="button" role="radio" aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1} className={`seg-opt ${o.mono ? "seg-mono" : ""}`} onClick={() => onChange(o.value)} onKeyDown={(e) => move(e, i)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ label, name, checked, onChange, onWord, offWord, hidden }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="sw" hidden={hidden} onClick={() => onChange(!checked)}>
      <span className="sw-track" aria-hidden="true"><span className="sw-knob" /></span>
      <span className="sw-name t-mono-label">{name}</span>
      <span className="sw-word t-ui-sm">{checked ? onWord : offWord}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function useCounter(target, up, instant) {
  const reduced = useReduced();
  const [v, setV] = useState(up ? target : 0);
  const raf = useRef(0);
  const prev = useRef(up);
  useEffect(() => {
    if (prev.current === up) return;
    prev.current = up;
    cancelAnimationFrame(raf.current);
    if (!up) { setV(0); return; }
    if (reduced || instant) { setV(target); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 640);
      let n = Math.round(target * (1 - Math.pow(1 - k, 3)));
      while (k < 1 && [11, 12, 16, 34].includes(n)) n += 1; // the owner's notes forbid these four figures anywhere
      setV(k >= 1 ? target : n);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [up]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return v;
}
