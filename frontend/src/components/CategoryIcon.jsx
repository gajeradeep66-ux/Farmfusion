const icons = {

  /* ── SEEDS ─────────────────────────────────────────────────
     A sprouting seedling bursting from cracked soil with two
     unfurling cotyledon leaves and a root system below.        */
  Seeds: (
    <>
      {/* soil mound */}
      <ellipse cx="32" cy="46" rx="18" ry="5" fill="#b5895a" opacity=".35" />
      {/* root left */}
      <path d="M30 44 Q24 48 20 52" stroke="#8c6340" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* root right */}
      <path d="M34 44 Q40 48 44 52" stroke="#8c6340" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* stem */}
      <path d="M32 44 V22" stroke="#4a7c3f" strokeWidth="2.2" strokeLinecap="round" />
      {/* left leaf */}
      <path d="M32 30 Q20 24 18 14 Q28 14 32 26" fill="#6aab52" stroke="#4a7c3f" strokeWidth="1.2" />
      {/* right leaf */}
      <path d="M32 30 Q44 24 46 14 Q36 14 32 26" fill="#82c46a" stroke="#4a7c3f" strokeWidth="1.2" />
      {/* leaf vein left */}
      <path d="M32 28 Q25 22 20 16" stroke="#4a7c3f" strokeWidth=".9" fill="none" opacity=".6" />
      {/* leaf vein right */}
      <path d="M32 28 Q39 22 44 16" stroke="#4a7c3f" strokeWidth=".9" fill="none" opacity=".6" />
      {/* seed coat at base of stem */}
      <ellipse cx="32" cy="44" rx="4" ry="2.5" fill="#c8a06a" stroke="#8c6340" strokeWidth="1" />
      {/* soil crack lines */}
      <path d="M26 46 L28 44 M38 46 L36 44" stroke="#8c6340" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      {/* dew drop on right leaf */}
      <circle cx="41" cy="20" r="1.5" fill="#a8d8f0" opacity=".8" />
    </>
  ),

  /* ── FARMING TOOLS ─────────────────────────────────────────
     A classic garden spade with a wooden handle, metal blade,
     and a small clod of earth on the tip.                      */
  'Farming Tools': (
    <>
      {/* handle grip wrap */}
      <rect x="29" y="8" width="6" height="10" rx="3" fill="#c8935a" stroke="#9c6e3a" strokeWidth="1.2" />
      {/* wooden handle */}
      <rect x="30.5" y="17" width="3" height="22" rx="1.5" fill="#b87d48" stroke="#9c6e3a" strokeWidth="1" />
      {/* blade shoulder */}
      <path d="M26 38 h12 l2 3 H24 z" fill="#8a9ba8" stroke="#6a7d8a" strokeWidth="1" />
      {/* blade body */}
      <path d="M24 41 h16 L36 56 Q32 60 28 56 z" fill="#a0b4bf" stroke="#6a7d8a" strokeWidth="1.2" />
      {/* blade centre ridge */}
      <path d="M32 41 L32 55" stroke="#6a7d8a" strokeWidth=".8" opacity=".5" />
      {/* dirt clod on tip */}
      <ellipse cx="32" cy="56" rx="4" ry="2" fill="#9c7a52" opacity=".7" />
      <circle cx="30" cy="55.5" r="1" fill="#7a5c38" opacity=".5" />
      <circle cx="34" cy="56.5" r=".8" fill="#7a5c38" opacity=".5" />
      {/* handle wood grain */}
      <path d="M30.5 22 Q32 23 33.5 22 M30.5 27 Q32 28 33.5 27 M30.5 32 Q32 33 33.5 32" stroke="#9c6e3a" strokeWidth=".7" fill="none" opacity=".4" />
    </>
  ),

  /* ── SOIL & NUTRITION ──────────────────────────────────────
     A terracotta pot overflowing with rich dark soil, a small
     plant emerging, and nutrient sparkle dots around it.       */
  'Soil & Nutrition': (
    <>
      {/* pot body */}
      <path d="M20 36 L22 56 Q32 60 42 56 L44 36 Z" fill="#c8714a" stroke="#a05a38" strokeWidth="1.3" />
      {/* pot rim */}
      <ellipse cx="32" cy="36" rx="12" ry="4" fill="#d4845a" stroke="#a05a38" strokeWidth="1.3" />
      {/* soil surface */}
      <ellipse cx="32" cy="36" rx="10" ry="3" fill="#5c3d1e" />
      {/* soil texture dots */}
      <circle cx="28" cy="35.5" r=".8" fill="#7a5230" />
      <circle cx="32" cy="34.8" r=".8" fill="#7a5230" />
      <circle cx="36" cy="35.5" r=".8" fill="#7a5230" />
      {/* stem */}
      <path d="M32 36 V20" stroke="#4a7c3f" strokeWidth="2" strokeLinecap="round" />
      {/* left leaf */}
      <path d="M32 26 Q22 20 20 12 Q30 13 32 24" fill="#6aab52" stroke="#4a7c3f" strokeWidth="1" />
      {/* right leaf */}
      <path d="M32 26 Q42 20 44 12 Q34 13 32 24" fill="#82c46a" stroke="#4a7c3f" strokeWidth="1" />
      {/* nutrient sparkles */}
      <circle cx="16" cy="28" r="1.5" fill="#f0c040" opacity=".9" />
      <circle cx="48" cy="24" r="1.2" fill="#f0c040" opacity=".8" />
      <circle cx="14" cy="40" r="1" fill="#f0c040" opacity=".6" />
      <circle cx="50" cy="38" r="1.3" fill="#f0c040" opacity=".7" />
      {/* sparkle lines */}
      <path d="M16 25 v-2 M14 28 h-2 M18 26 l1-1" stroke="#f0c040" strokeWidth="1" strokeLinecap="round" opacity=".7" />
      {/* pot drainage hole */}
      <ellipse cx="32" cy="57" rx="2" ry=".8" fill="#a05a38" opacity=".5" />
    </>
  ),

  /* ── PLANT PROTECTION ──────────────────────────────────────
     A bold shield with a leaf emblem inside, surrounded by a
     subtle glow — protection and care combined.                */
  'Plant Protection': (
    <>
      {/* shield shadow */}
      <path d="M32 58 Q14 48 14 30 V16 L32 10 L50 16 V30 Q50 48 32 58Z" fill="#2d6a4f" opacity=".15" transform="translate(1,2)" />
      {/* shield body */}
      <path d="M32 56 Q15 46 15 29 V16 L32 10 L49 16 V29 Q49 46 32 56Z" fill="#3a7d5e" stroke="#2d6a4f" strokeWidth="1.4" />
      {/* shield inner bevel */}
      <path d="M32 51 Q19 42 19 28 V19 L32 14 L45 19 V28 Q45 42 32 51Z" fill="#4a9070" opacity=".4" />
      {/* leaf inside shield */}
      <path d="M32 42 V26 M32 36 Q24 30 22 22 Q30 22 32 34 M32 36 Q40 30 42 22 Q34 22 32 34" stroke="#d4f0e0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* checkmark tick top-right */}
      <path d="M38 20 l3 3 5-6" stroke="#a8e6c4" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* glow dots */}
      <circle cx="15" cy="22" r="1.2" fill="#74c69d" opacity=".5" />
      <circle cx="49" cy="22" r="1.2" fill="#74c69d" opacity=".5" />
      <circle cx="32" cy="8" r="1.5" fill="#74c69d" opacity=".4" />
    </>
  ),

  /* ── GROWING ESSENTIALS ────────────────────────────────────
     A watering can mid-pour with a graceful arc of water drops
     landing on a small seedling.                               */
  'Growing Essentials': (
    <>
      {/* can body */}
      <path d="M14 28 Q14 20 22 20 H38 Q44 20 44 28 V42 Q44 46 40 46 H18 Q14 46 14 42 Z" fill="#6a9fb5" stroke="#4a7f96" strokeWidth="1.3" />
      {/* can top opening */}
      <ellipse cx="32" cy="20" rx="8" ry="2.5" fill="#7ab0c6" stroke="#4a7f96" strokeWidth="1" />
      {/* handle arc */}
      <path d="M38 24 Q52 24 52 34 Q52 44 44 44" stroke="#4a7f96" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* spout */}
      <path d="M14 32 Q8 30 6 26 Q10 24 14 28" fill="#6a9fb5" stroke="#4a7f96" strokeWidth="1.2" />
      {/* spout rose (holes) */}
      <circle cx="7" cy="25" r=".8" fill="#4a7f96" />
      <circle cx="9" cy="23.5" r=".8" fill="#4a7f96" />
      <circle cx="6.5" cy="27.5" r=".8" fill="#4a7f96" />
      {/* water arc */}
      <path d="M7 24 Q4 16 12 10" stroke="#74c6e8" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeDasharray="2 2" />
      {/* water drops */}
      <ellipse cx="12" cy="9" rx="1.5" ry="2" fill="#74c6e8" />
      <ellipse cx="16" cy="6" rx="1.2" ry="1.8" fill="#74c6e8" opacity=".8" />
      <ellipse cx="20" cy="5" rx="1" ry="1.5" fill="#74c6e8" opacity=".6" />
      {/* seedling receiving water */}
      <path d="M20 56 V46" stroke="#4a7c3f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 50 Q14 46 13 40 Q19 40 20 48" fill="#6aab52" stroke="#4a7c3f" strokeWidth="1" />
      <path d="M20 50 Q26 46 27 40 Q21 40 20 48" fill="#82c46a" stroke="#4a7c3f" strokeWidth="1" />
      {/* soil line */}
      <path d="M14 56 Q20 58 26 56" stroke="#8c6340" strokeWidth="1.4" strokeLinecap="round" />
      {/* can shine */}
      <path d="M20 26 Q22 22 26 22" stroke="#fff" strokeWidth="1" opacity=".3" strokeLinecap="round" />
    </>
  ),

  /* ── SMART FARMING ─────────────────────────────────────────
     A circuit-board leaf — half organic leaf, half PCB traces —
     symbolising technology meeting nature.                     */
  'Smart Farming': (
    <>
      {/* leaf shape */}
      <path d="M32 56 Q12 44 12 26 Q12 10 32 8 Q52 10 52 26 Q52 44 32 56Z" fill="#2d7d6e" stroke="#1f5f54" strokeWidth="1.3" />
      {/* inner leaf lighter */}
      <path d="M32 50 Q16 40 16 26 Q16 14 32 12 Q48 14 48 26 Q48 40 32 50Z" fill="#3a9080" opacity=".4" />
      {/* centre vein */}
      <path d="M32 52 V14" stroke="#a8e6d8" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      {/* PCB horizontal traces */}
      <path d="M20 22 H28 M36 22 H44" stroke="#a8e6d8" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      <path d="M18 30 H26 M38 30 H46" stroke="#a8e6d8" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      <path d="M20 38 H28 M36 38 H44" stroke="#a8e6d8" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      {/* PCB vertical connectors */}
      <path d="M28 22 V30 M36 22 V30 M26 30 V38 M38 30 V38" stroke="#a8e6d8" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      {/* component pads / nodes */}
      <circle cx="28" cy="22" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      <circle cx="36" cy="22" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      <circle cx="26" cy="30" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      <circle cx="38" cy="30" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      <circle cx="28" cy="38" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      <circle cx="36" cy="38" r="2" fill="#74c6b8" stroke="#1f5f54" strokeWidth=".8" />
      {/* wifi / signal arcs top */}
      <path d="M26 16 Q32 12 38 16" stroke="#d4f4ee" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M29 13 Q32 11 35 13" stroke="#d4f4ee" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity=".5" />
      {/* centre dot */}
      <circle cx="32" cy="30" r="2.5" fill="#fff" opacity=".9" />
      <circle cx="32" cy="30" r="1.2" fill="#2d7d6e" />
    </>
  ),
};

export default function CategoryIcon({ name }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {icons[name] || icons.Seeds}
    </svg>
  );
}
