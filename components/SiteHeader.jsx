"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Mark from "./Mark";
import { MenuIcon, CloseIcon, ThemeIcon } from "./Icons";

// Strings arrive as props from the server (read from the content JSON by key).
export default function SiteHeader({ labels, items, base, writeLink }) {
  const path = usePathname();
  const currentId = path && path.startsWith("/work") ? "work" : undefined;
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY >= 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    root.classList.toggle("light", !next);
    root.style.colorScheme = next ? "dark" : "light";
    setDark(next);
    try { localStorage.theme = next ? "dark" : "light"; } catch {}
    const m = document.querySelectorAll('meta[name="theme-color"]');
    void m;
  };

  const themeBtn = (
    <button type="button" onClick={toggleTheme} className="hit gap-2 px-2 font-ui text-ui" aria-label={dark ? labels.toLight : labels.toDark}>
      <ThemeIcon className="h-4 w-4" />
      <span aria-hidden="true">{labels.themeVisible}</span>
    </button>
  );

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="page">
        <nav aria-label={labels.ariaLabel} className="flex h-14 items-center gap-4 md:h-16 md:gap-6">
          <Link href={base || "/"} aria-label={labels.markLabel} className="hit -ml-1 rounded-full">
            <Mark size={40} />
          </Link>
          <ul className="hidden items-center gap-6 md:flex">
            {items.map((i) => (
              <li key={i.id}>
                <Link href={base + i.href} className="nav-link" aria-current={currentId === i.id ? "true" : undefined}>{i.label}</Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <span className="js-only hidden md:inline-flex">{themeBtn}</span>
            <span className="inline-flex">{writeLink}</span>
            <button ref={btnRef} type="button" className="js-only hit px-2 md:!hidden" aria-expanded={open} aria-controls="menu-panel" aria-label={labels.menu} onClick={() => setOpen((o) => !o)}>
              {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </nav>
        <ul className="no-js-nav flex-wrap gap-x-6 pb-2 md:hidden" aria-label={labels.ariaLabel}>
          {items.map((i) => (
            <li key={i.id}><Link href={base + i.href} className="nav-link">{i.label}</Link></li>
          ))}
        </ul>
      </div>
      {open && (
        <div id="menu-panel" ref={panelRef} className="menu-panel md:hidden">
          {items.map((i) => (
            <Link key={i.id} href={base + i.href} className="menu-row nav-link" onClick={() => { setOpen(false); btnRef.current?.focus(); }} aria-current={currentId === i.id ? "true" : undefined}>{i.label}</Link>
          ))}
          <div className="menu-row">{themeBtn}</div>
        </div>
      )}
    </header>
  );
}
