// Eight inline icons, drawn on a 24 grid, 1.5 stroke, square caps, miter joins, currentColor.
// Invented geometry (handoff INV-02); none is a status indicator.
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "square", strokeLinejoin: "miter", "aria-hidden": true, focusable: "false" };
export const ArrowUpRight = ({ className }) => (<svg {...base} className={className}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const MenuIcon = ({ className }) => (<svg {...base} className={className}><path d="M4 8h16M4 16h16" /></svg>);
export const CloseIcon = ({ className }) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ThemeIcon = ({ className }) => (<svg {...base} className={className}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" /></svg>);
export const TickIcon = ({ className }) => (<svg {...base} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const RingDot = ({ className }) => (<svg {...base} className={className}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></svg>);
export const QuoteIcon = ({ className }) => (<svg {...base} className={className} stroke="none"><path fill="currentColor" d="M5 8h5v5l-2 5H6l1.6-4H5ZM13 8h5v5l-2 5h-2l1.6-4H13Z" /></svg>);
// decorative glyph for the Generated look's icon tiles (invented, neutral)
export const GenGlyph = ({ className }) => (<svg {...base} className={className} strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V11M12 19V5M19 19v-5" strokeWidth="2.4" /></svg>);
