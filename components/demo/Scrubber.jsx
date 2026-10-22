"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// The state scrubber (spec 5.7): a slider with three detents. Drag, release to commit to the nearest
// detent; tap a label or the track to jump; keys commit at once. A drag changes nothing in the
// dashboard until release (decision D-T15-10).
export default function Scrubber({ rest, names, label, valueText, onCommit }) {
  const trackRef = useRef(null);
  const [w, setW] = useState(0);
  const [drag, setDrag] = useState(null); // 0..1 while dragging
  const dragging = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const pctOf = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  const nearest = (p) => (p < 0.25 ? 1 : p < 0.75 ? 2 : 3);

  const onPointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(pctOf(e.clientX));
  };
  const onPointerMove = (e) => { if (dragging.current) setDrag(pctOf(e.clientX)); };
  const end = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    const n = nearest(pctOf(e.clientX));
    setDrag(null);
    onCommit(n);
  };
  const onKey = useCallback((e) => {
    const map = { ArrowLeft: rest - 1, ArrowDown: rest - 1, ArrowRight: rest + 1, ArrowUp: rest + 1, Home: 1, End: 3 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = Math.min(3, Math.max(1, map[e.key]));
    if (n !== rest) onCommit(n);
  }, [rest, onCommit]);

  const p = drag ?? (rest - 1) / 2;
  const x = p * w;
  const fillW = x;
  return (
    <div className="scrub" data-testid="scrubber">
      <div className="scrub-track-wrap" ref={trackRef}
        onPointerDown={(e) => { if (e.target === e.currentTarget || e.target.classList.contains("scrub-track")) onCommit(nearest(pctOf(e.clientX))); }}>
        <div className="scrub-track" aria-hidden="true" />
        <div className="scrub-fill" aria-hidden="true" style={{ transform: `scaleX(${w ? fillW / w : 0})` }} />
        {[0, 1, 2].map((i) => <span key={i} className="scrub-detent" aria-hidden="true" style={{ left: `${i * 50}%` }} />)}
        <div
          role="slider" tabIndex={0} className="scrub-thumb" data-dragging={drag !== null}
          aria-label={label} aria-valuemin={1} aria-valuemax={3} aria-valuenow={rest}
          aria-valuetext={valueText} aria-orientation="horizontal"
          style={{ transform: `translateX(${x - 14}px)` }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={end} onKeyDown={onKey}
        >
          <span className="scrub-dot" />
        </div>
      </div>
      <div className="scrub-labels">
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" tabIndex={-1} data-current={rest === n} data-pos={n} className="scrub-label" onClick={() => onCommit(n)}>
            {names[n]}
          </button>
        ))}
      </div>
    </div>
  );
}
