/**
 * CoverageMap — futuristic regional coverage map for the Management Team banner.
 *
 * Main canvas = zoomed map of the western-Bangkok / Nakhon Pathom region with
 * one glowing marker per ช.เอราวัณ branch (spread out so each glow is visible),
 * a mesh of connecting lines, and a radar pulse over the Nakhon Pathom hub.
 *
 * Top-right = a small Thailand silhouette locator showing where this region sits.
 *
 * Pure SVG + CSS. Sits behind a left-to-right dark gradient so Thai text reads.
 */

// 7 branches spread across the region (west → east mirrors real geography:
// Nakhon Pathom in the west, Salaya / Sampran / Om Yai toward Bangkok).
const MARKERS = [
  { x: 78, y: 96, label: "นครปฐม", hub: true },   // Mazda — main hub
  { x: 104, y: 74, label: "GWM" },
  { x: 96, y: 124, label: "มิตซู" },
  { x: 188, y: 92, label: "ศาลายา" },
  { x: 206, y: 116, label: "Deepal" },
  { x: 214, y: 158, label: "สามพราน" },
  { x: 258, y: 172, label: "อ้อมใหญ่" },
];

const HUB = MARKERS[0];
const BKK = { x: 340, y: 120 };

// Mesh: connect each marker to the hub + to Bangkok (subtle network look)
const LINKS: { x1: number; y1: number; x2: number; y2: number }[] = [
  ...MARKERS.slice(1).map((m) => ({ x1: HUB.x, y1: HUB.y, x2: m.x, y2: m.y })),
  ...MARKERS.map((m) => ({ x1: m.x, y1: m.y, x2: BKK.x, y2: BKK.y })),
];

export default function CoverageMap() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0E1A2E] to-[#13243f]">
      <svg
        viewBox="0 0 400 230"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="cm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#3b82f6" strokeOpacity="0.06" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="cm-marker-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DD5259" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#DD5259" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#DD5259" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cm-zone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DD5259" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#DD5259" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cm-th" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0f2540" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <rect width="400" height="230" fill="url(#cm-grid)" />

        {/* soft coverage wash over the whole dealer region */}
        <ellipse cx="165" cy="120" rx="160" ry="95" fill="url(#cm-zone)" />

        {/* ── mesh network lines ── */}
        <g stroke="#5b8fd6" strokeOpacity="0.22" strokeWidth="0.6">
          {LINKS.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeDasharray="2 3" />
          ))}
        </g>

        {/* ── radar pulse over the Nakhon Pathom hub ── */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={HUB.x} cy={HUB.y} r="12"
            fill="none" stroke="#DD5259" strokeWidth="1" opacity="0"
            className="cm-pulse"
            style={{ animationDelay: `${i * 1.4}s`, transformOrigin: `${HUB.x}px ${HUB.y}px` }}
          />
        ))}

        {/* ── Bangkok reference node ── */}
        <g>
          <circle cx={BKK.x} cy={BKK.y} r="3.2" fill="#fbbf24" />
          <circle cx={BKK.x} cy={BKK.y} r="3.2" fill="none" stroke="#fbbf24" strokeOpacity="0.5" strokeWidth="1" />
          <text x={BKK.x} y={BKK.y - 7} fill="#fcd34d" fontSize="8" fontWeight="700" textAnchor="middle" opacity="0.9">กรุงเทพฯ</text>
        </g>

        {/* ── dealer markers — each with its own glow halo ── */}
        {MARKERS.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={m.hub ? 22 : 16} fill="url(#cm-marker-glow)" className="cm-glow" style={{ animationDelay: `${i * 0.35}s` }} />
            <circle cx={m.x} cy={m.y} r={m.hub ? 5 : 3.6} fill="#DD5259" />
            <circle cx={m.x} cy={m.y} r={m.hub ? 5 : 3.6} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
            <text x={m.x} y={m.y + (m.hub ? 16 : 13)} fill="#fff" fillOpacity="0.7" fontSize="7" fontWeight="600" textAnchor="middle">{m.label}</text>
          </g>
        ))}

        {/* ── Thailand locator inset (top-right) ── */}
        <g transform="translate(330,8) scale(0.46)" opacity="0.9">
          <path
            d="M70 12 C62 9 52 12 51 22 C49 31 56 36 53 44 C49 54 38 52 33 62
               C28 72 36 80 30 88 C24 96 13 93 12 103 C11 114 25 118 28 128
               C31 137 25 145 32 152 C39 159 52 155 59 162 C66 169 59 181 66 188
               C72 194 75 187 76 177 C78 165 74 157 81 153 C90 148 99 156 102 148
               C106 137 96 129 100 118 C104 106 118 109 119 97 C121 84 107 81 105 70
               C103 59 114 55 110 44 C106 33 94 37 90 26 C86 16 95 10 91 16 Z"
            fill="url(#cm-th)" stroke="#5b8fd6" strokeOpacity="0.6" strokeWidth="2"
          />
          {/* peninsula tail */}
          <path d="M66 188 C62 202 70 214 66 226 C63 236 70 246 66 256"
            fill="none" stroke="#5b8fd6" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
          {/* "you are here" highlight on central-west */}
          <circle cx="70" cy="150" r="14" fill="#DD5259" fillOpacity="0.25" />
          <circle cx="70" cy="150" r="5" fill="#DD5259" />
          <circle cx="70" cy="150" r="5" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.5" />
        </g>
        <text x="352" y="6" fill="#94a3b8" fontSize="7" fontWeight="600" textAnchor="middle" opacity="0.7">ประเทศไทย</text>
      </svg>

      <style>{`
        @keyframes cm-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(4); opacity: 0; } }
        .cm-pulse { animation: cm-ring 4.2s ease-out infinite; }
        @keyframes cm-breathe { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        .cm-glow { animation: cm-breathe 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cm-pulse { animation: none; opacity: 0.2; }
          .cm-glow { animation: none; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
