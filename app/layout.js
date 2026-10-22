import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import MailLink from "@/components/MailLink";
import { c, typo } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Fonts are self-hosted files (N2): no request to any other host at build or run time.
const display = localFont({
  src: "./fonts/newsreader-latin-opsz-normal.woff2",
  weight: "200 800", style: "normal", variable: "--font-display", display: "swap",
  adjustFontFallback: "Times New Roman", preload: true,
});
const ui = localFont({
  src: "./fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700", style: "normal", variable: "--font-ui", display: "swap",
  adjustFontFallback: "Arial", preload: true,
});
const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono", display: "swap", fallback: ["Courier New", "monospace"], preload: true,
});
const gen = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-gen", display: "swap", fallback: ["Arial", "sans-serif"], preload: false,
});

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: c.meta.title, template: c.meta.titleTemplate },
  description: c.meta.description,
  robots: c.meta.robots,
  alternates: { canonical: "/" },
  openGraph: {
    type: c.meta.openGraph.type, title: typo(c.meta.openGraph.title), description: typo(c.meta.openGraph.description),
    siteName: c.meta.openGraph.siteName, locale: c.meta.openGraph.locale, url: "/",
  },
  twitter: { card: c.meta.twitter.card, title: typo(c.meta.twitter.title), description: typo(c.meta.twitter.description) },
};
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF6" },
    { media: "(prefers-color-scheme: dark)", color: "#12110E" },
  ],
};

// Runs before paint: theme from storage (try/catch: it can throw) or the system, and the js flag.
const bootstrap = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.theme;var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.add(dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';}catch(e){}setTimeout(function(){d.classList.add('demo-guard')},3000);})();`;

export default function RootLayout({ children, params }) {
  const items = c.nav.items.filter((i) => i.id !== "contact");
  const labels = {
    ariaLabel: typo(c.nav.ariaLabel), markLabel: typo(c.nav.markLabel),
    toDark: typo(c.nav.theme.toDark), toLight: typo(c.nav.theme.toLight), themeVisible: typo(c.nav.theme.visibleLabel),
    // nav.menuLabel does not exist in the content file (spec 14 item 9): neutral name, listed as missing
    menu: "Menu",
  };
  return (
    <html lang={c.meta.lang} suppressHydrationWarning className={`${display.variable} ${ui.variable} ${mono.variable} ${gen.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>
        <a href="/#finishing-demo" className="skip btn btn-primary">{typo(c.nav.skipLink)}</a>
        <SiteHeaderSlot items={items} labels={labels} />
        {children}
        <Footer base="/" />
      </body>
    </html>
  );
}

// Header shows "Work" as current on case pages through a path check in the client; the home page has none.
function SiteHeaderSlot({ items, labels }) {
  return (
    <SiteHeader
      labels={labels} items={items} base="/"
      writeLink={<MailLink className="btn btn-secondary" label={c.contact.button} ariaLabel={c.contact.buttonAccessibleName} />}
    />
  );
}
