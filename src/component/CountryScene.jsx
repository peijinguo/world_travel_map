import SnowScene from "./SnowScene";
import { isSnowyCountry } from "../data/countries";
import "../assets/pages/_country-scene.scss";

// The faint picture behind 行前準備 and 機票住宿 for every country but Japan
// (which keeps its hand-drawn snow scenes, PrepScene and HotelScene). Each is
// one wide drawing across the bottom of the screen: ground, water and hills
// run edge to edge, a landmark at each end and quieter scenery between them,
// in the colored-pencil look of Japan's (wobbly ink, grainy pastel fills and
// hatched shading, from the SVG filter and pattern below).
const W = 1672;
const H = 560;
const INK = "#4f5a5e";
const FINE = 1.6; // inner detail lines; outlines are 3.2
const C = {
  snow: "#ffffff",
  shade: "#e4edf5",
  ice: "#cfe0ee",
  far: "#dfe8ef",
  sea: "#9fc2dc",
  deep: "#82abcb",
  grass: "#b5d2a5",
  farGrass: "#d3e5c8",
  leaf: "#86ae7f",
  pine: "#8e9c95",
  rock: "#bdb5a8",
  stone: "#d6d0c5",
  wood: "#b8977a",
  plank: "#9c7c62",
  dark: "#7c6a5c",
  roof: "#8a7466",
  red: "#d88a7e",
  rose: "#ecb3a8",
  yellow: "#f1d58a",
  orange: "#eda56f",
  lilac: "#b9a4d6",
  cream: "#f6ecd6",
  glow: "#fbe6a2",
};

// ---- Detail helpers (x, y is the foot of each thing) ----

const Shade = ({ d }) => <path d={d} fill="url(#country-scene-hatch)" stroke="none" />;
const Shadow = ({ x, y, w }) => <ellipse cx={x} cy={y + 3} rx={w / 2} ry={w / 14} fill={INK} fillOpacity=".08" stroke="none" />;

function Window({ x, y, w = 22, h = 26, lit = true }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={lit ? C.glow : C.snow} />
      <path d={`M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}`} fill="none" strokeWidth={FINE} />
      <path d={`M${x - 3} ${y + h}h${w + 6}`} fill="none" strokeWidth={FINE + 1} />
    </g>
  );
}

function Birds({ x, y }) {
  return (
    <g fill="none" strokeWidth={FINE + 0.4}>
      <path d={`M${x} ${y}q8-8 14 0q6-8 14 0`} />
      <path d={`M${x + 40} ${y - 18}q6-6 11 0q5-6 11 0`} />
      <path d={`M${x + 70} ${y + 6}q5-5 9 0q4-5 9 0`} />
    </g>
  );
}

function Cloud({ x, y, s = 1 }) {
  const r = (n) => n * s;
  return (
    <g>
      <path
        d={`M${x} ${y}h${r(130)}a${r(22)} ${r(22)} 0 0 0 ${r(2)}-${r(42)}a${r(32)} ${r(32)} 0 0 0-${r(52)}-${r(26)}
          a${r(28)} ${r(28)} 0 0 0-${r(52)} ${r(10)}a${r(24)} ${r(24)} 0 0 0-${r(30)} ${r(58)}Z`}
        fill={C.snow}
      />
      <path d={`M${x + r(6)} ${y - r(4)}q${r(60)} ${r(8)} ${r(120)}-${r(2)}V${y}H${x}Z`} fill={C.shade} stroke="none" />
      <path d={`M${x + r(20)} ${y - r(10)}q${r(40)} ${r(6)} ${r(90)}-${r(2)}M${x + r(60)} ${y - r(30)}q${r(10)}-${r(8)} ${r(22)}-${r(4)}`} fill="none" strokeWidth={FINE} strokeOpacity=".5" />
    </g>
  );
}

function Pine({ x, y, s = 1, snowy = true, fill = C.pine }) {
  const tier = (top, half, bottom) =>
    `M${x} ${y - top * s}L${x + half * s} ${y - bottom * s}q-${half * s} ${8 * s}-${half * s * 2} 0Z`;
  return (
    <g>
      <Shadow x={x} y={y} w={90 * s} />
      <rect x={x - 5 * s} y={y - 18 * s} width={10 * s} height={18 * s} fill={C.plank} />
      <path d={tier(90, 58, 16)} fill={fill} />
      <path d={tier(124, 46, 48)} fill={fill} />
      <path d={tier(156, 33, 82)} fill={fill} />
      <Shade d={`M${x} ${y - 150 * s}L${x + 56 * s} ${y - 18 * s}H${x}Z`} />
      <path
        d={[[30, 60], [24, 92], [18, 126]]
          .map(([half, top]) => `M${x - half * s} ${y - (top - 4) * s}l${10 * s}-${10 * s}M${x + half * s * 0.6} ${y - (top - 6) * s}l-${8 * s}-${10 * s}M${x - half * s * 0.2} ${y - (top - 18) * s}l${6 * s}-${8 * s}`)
          .join("")}
        fill="none"
        strokeWidth={FINE}
        strokeOpacity=".7"
      />
      {snowy && (
        <g fill={C.snow}>
          <path d={`M${x - 14 * s} ${y - 128 * s}L${x} ${y - 156 * s}L${x + 14 * s} ${y - 128 * s}q-7 6-14 1q-7 5-14-1Z`} />
          <path d={`M${x - 30 * s} ${y - 90 * s}q15-8 30-4q15-4 30 4q-15 6-30 2q-15 4-30-2Z`} />
          <path d={`M${x - 44 * s} ${y - 56 * s}q22-8 44-4q22-4 44 4q-22 6-44 2q-22 4-44-2Z`} />
        </g>
      )}
    </g>
  );
}

function Tree({ x, y, s = 1, fill = C.leaf, tint = C.grass }) {
  return (
    <g>
      <Shadow x={x} y={y} w={110 * s} />
      <path d={`M${x} ${y}V${y - 84 * s}M${x} ${y - 60 * s}l-${22 * s}-${26 * s}M${x} ${y - 70 * s}l${20 * s}-${22 * s}`} fill="none" strokeWidth={6 * s} stroke={C.plank} />
      <circle cx={x - 34 * s} cy={y - 104 * s} r={34 * s} fill={fill} />
      <circle cx={x + 32 * s} cy={y - 108 * s} r={36 * s} fill={fill} />
      <circle cx={x} cy={y - 140 * s} r={42 * s} fill={tint} />
      <circle cx={x - 6 * s} cy={y - 100 * s} r={26 * s} fill={tint} />
      <Shade d={`M${x + 10 * s} ${y - 180 * s}a${42 * s} ${42 * s} 0 0 1 ${58 * s} ${74 * s}a${36 * s} ${36 * s} 0 0 1-${40 * s} ${36 * s}Z`} />
      <path
        d={`M${x - 20 * s} ${y - 150 * s}q${8 * s}-${6 * s} ${16 * s} 0M${x + 22 * s} ${y - 118 * s}q${8 * s}-${6 * s} ${16 * s} 0M${x - 46 * s} ${y - 108 * s}q${8 * s}-${6 * s} ${16 * s} 0M${x + 4 * s} ${y - 166 * s}q${8 * s}-${6 * s} ${16 * s} 0M${x - 12 * s} ${y - 112 * s}q${8 * s}-${6 * s} ${16 * s} 0`}
        fill="none"
        strokeWidth={FINE}
      />
    </g>
  );
}

function Mountain({ x, y, w, h, fill = C.ice, cap = true }) {
  const tx = x + w / 2;
  const ty = y - h;
  return (
    <g>
      <path d={`M${x} ${y}L${tx - w * 0.08} ${ty + h * 0.08}L${tx} ${ty}L${tx + w * 0.1} ${ty + h * 0.12}L${x + w} ${y}Z`} fill={fill} />
      <Shade d={`M${tx} ${ty}L${tx + w * 0.1} ${ty + h * 0.12}L${x + w} ${y}H${tx + w * 0.05}Z`} />
      {cap && (
        <path
          d={`M${tx - w * 0.17} ${ty + h * 0.36}L${tx - w * 0.08} ${ty + h * 0.08}L${tx} ${ty}L${tx + w * 0.1} ${ty + h * 0.12}L${tx + w * 0.18} ${ty + h * 0.36}
            q-${w * 0.03} ${h * 0.06}-${w * 0.06} 0q-${w * 0.03} ${h * 0.1}-${w * 0.07} ${h * 0.02}q-${w * 0.04} ${h * 0.08}-${w * 0.08} 0q-${w * 0.04} ${h * 0.06}-${w * 0.07}-${h * 0.02}Z`}
          fill={C.snow}
        />
      )}
      <path d={`M${tx - w * 0.04} ${ty + h * 0.45}l-${w * 0.06} ${h * 0.2}M${tx + w * 0.08} ${ty + h * 0.5}l${w * 0.05} ${h * 0.18}`} fill="none" strokeWidth={FINE} />
    </g>
  );
}

// A pale far ridge: [[x, height], …] across the whole width.
function Range({ y, peaks, fill = C.far }) {
  const d = `M-20 ${y}` + peaks.map(([x, h]) => `L${x} ${y - h}`).join("") + `L${W + 20} ${y}Z`;
  return <path d={d} fill={fill} strokeOpacity=".45" strokeWidth={FINE + 0.6} />;
}

// Snow-covered ground from the left edge to `to` (default all the way).
function Ground({ y, to = W + 20 }) {
  const span = to + 20;
  return (
    <g>
      <path d={`M-20 ${y}q${span * 0.3}-24 ${span * 0.6}-6t${span * 0.4}-4V${H + 20}H-20Z`} fill={C.snow} />
      <path d={`M60 ${y + 40}q60-8 120 0M${to * 0.45} ${y + 60}q60-8 120 0M${to * 0.75} ${y + 30}q60-8 120 0M${to * 0.25} ${y + 80}q40-6 80 0M${to * 0.6} ${y + 100}q50-6 100 0M${to * 0.9} ${y + 76}q40-6 80 0`} fill="none" strokeWidth={FINE} strokeOpacity=".5" />
      <path d={`M-20 ${y + 6}q${span * 0.3}-24 ${span * 0.6}-6t${span * 0.4}-4V${y + 30}q-${span * 0.4} 0-${span * 0.6} 4t-${span * 0.4} 4Z`} fill={C.shade} fillOpacity=".6" stroke="none" />
    </g>
  );
}

function House({ x, y, w, h, roof = C.roof, wall = C.cream, windows = 2, door = true, snowy = false, chimney = false }) {
  const peak = h * 0.6;
  return (
    <g>
      <Shadow x={x + w / 2} y={y} w={w * 1.2} />
      {chimney && <rect x={x + w * 0.66} y={y - h - peak * 0.95} width={w * 0.1} height={peak * 0.7} fill={C.stone} />}
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      <Shade d={`M${x + w * 0.72} ${y - h}h${w * 0.28}v${h}h-${w * 0.28}Z`} />
      <path d={`M${x - 12} ${y - h + 6}L${x + w / 2} ${y - h - peak}L${x + w + 12} ${y - h + 6}Z`} fill={snowy ? C.snow : roof} />
      {snowy ? (
        <path d={`M${x - 12} ${y - h + 6}q${w * 0.15} 10 ${w * 0.3} 0q${w * 0.15} 12 ${w * 0.3} 0q${w * 0.15} 10 ${w * 0.3} 0q${w * 0.1} 8 ${w * 0.1 + 24} 0`} fill="none" strokeWidth={FINE} />
      ) : (
        <path
          d={`M${x + w * 0.04} ${y - h - peak * 0.04}h${w * 0.92}M${x + w * 0.18} ${y - h - peak * 0.3}h${w * 0.64}M${x + w * 0.32} ${y - h - peak * 0.58}h${w * 0.36}
            M${x + w * 0.25} ${y - h - peak * 0.04}v-${peak * 0.26}M${x + w * 0.5} ${y - h - peak * 0.04}v-${peak * 0.26}M${x + w * 0.75} ${y - h - peak * 0.04}v-${peak * 0.26}
            M${x + w * 0.38} ${y - h - peak * 0.3}v-${peak * 0.28}M${x + w * 0.62} ${y - h - peak * 0.3}v-${peak * 0.28}`}
          fill="none"
          strokeWidth={FINE}
          strokeOpacity=".7"
        />
      )}
      {Array.from({ length: windows }, (_, i) => (
        <Window key={i} x={x + ((i + 1) * w) / (windows + 1) - 12} y={y - h * 0.78} w={24} h={26} />
      ))}
      {door && (
        <g>
          <rect x={x + w / 2 - 13} y={y - 42} width="26" height="42" fill={C.plank} />
          <path d={`M${x + w / 2 - 6} ${y - 36}v28M${x + w / 2 + 2} ${y - 36}v28`} fill="none" strokeWidth={FINE} strokeOpacity=".6" />
          <circle cx={x + w / 2 + 7} cy={y - 20} r="2" fill={INK} />
          <path d={`M${x + w / 2 - 20} ${y}h40v6h-40Z`} fill={C.stone} />
        </g>
      )}
    </g>
  );
}

function LogCabin({ x, y, w = 280, h = 120 }) {
  return (
    <g>
      <Shadow x={x + w / 2} y={y} w={w * 1.2} />
      <rect x={x + w * 0.7} y={y - h - 80} width="26" height="70" fill={C.stone} />
      <Smoke x={x + w * 0.7 + 13} y={y - h - 86} />
      <rect x={x} y={y - h} width={w} height={h} fill={C.wood} />
      <path d={Array.from({ length: 5 }, (_, i) => `M${x} ${y - h + 22 * (i + 1)}h${w}`).join("")} fill="none" strokeWidth={FINE} />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <circle cx={x} cy={y - h + 22 * i + 11} r="8" fill={C.cream} />
          <circle cx={x + w} cy={y - h + 22 * i + 11} r="8" fill={C.cream} />
        </g>
      ))}
      <path d={`M${x - 30} ${y - h + 10}L${x + w / 2} ${y - h - 96}L${x + w + 30} ${y - h + 10}Z`} fill={C.snow} />
      <path d={`M${x - 30} ${y - h + 10}q30 12 60 0q30 14 60 0q30 12 60 0q30 14 60 0q30 12 60 0`} fill="none" strokeWidth={FINE} />
      <Window x={x + w * 0.16} y={y - h + 30} w={44} h={38} />
      <Window x={x + w * 0.66} y={y - h + 30} w={44} h={38} />
      <rect x={x + w * 0.42} y={y - 58} width="40" height="58" fill={C.plank} />
    </g>
  );
}

function Lantern({ x, y, s = 1, className = "" }) {
  return (
    <g className={className} style={{ transformOrigin: `${x}px ${y - 50 * s}px` }}>
      <path d={`M${x} ${y - 50 * s}V${y - 40 * s}`} fill="none" strokeWidth={FINE} />
      <path d={`M${x - 13 * s} ${y - 40 * s}h${26 * s}q${13 * s} ${17 * s} 0 ${34 * s}h-${26 * s}q-${13 * s}-${17 * s} 0-${34 * s}Z`} fill={C.red} />
      <path d={`M${x - 16 * s} ${y - 23 * s}h${32 * s}M${x} ${y - 6 * s}v${8 * s}`} fill="none" strokeWidth={FINE} />
    </g>
  );
}

function SkyLantern({ x, y, className }) {
  return (
    <g className={className}>
      <path d={`M${x - 16} ${y}l-4-40q20-12 40 0l-4 40Z`} fill={C.glow} />
      <path d={`M${x - 16} ${y}h32`} fill="none" strokeWidth={FINE} />
      <ellipse cx={x} cy={y + 4} rx="5" ry="3" fill={C.orange} stroke="none" />
    </g>
  );
}

function Aurora({ x, y, w }) {
  return (
    <g className="cs-aurora">
      <path d={`M${x} ${y}q${w * 0.2}-80 ${w * 0.42}-14t${w * 0.58}-26`} fill="none" stroke="#9fdcc0" strokeWidth="34" strokeOpacity=".55" />
      <path d={`M${x + 40} ${y + 40}q${w * 0.22}-70 ${w * 0.44}-10t${w * 0.5}-34`} fill="none" stroke={C.lilac} strokeWidth="18" strokeOpacity=".5" />
      <path d={`M${x + 80} ${y - 30}q${w * 0.2}-60 ${w * 0.4}-6t${w * 0.4}-30`} fill="none" stroke="#c6efdd" strokeWidth="10" strokeOpacity=".7" />
    </g>
  );
}

function Smoke({ x, y }) {
  return (
    <g className="cs-smoke" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x} ${y}q-16-18 0-36t0-36q-12-14 2-30`} fill="none" strokeWidth={FINE + 0.6} strokeOpacity=".6" />
    </g>
  );
}

function Boat({ x, y, s = 1, sail = C.snow }) {
  return (
    <g className="cs-bob" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x - 46 * s} ${y - 16 * s}h${92 * s}l-${16 * s} ${16 * s}h-${60 * s}Z`} fill={C.wood} />
      <path d={`M${x - 40 * s} ${y - 8 * s}h${80 * s}`} fill="none" strokeWidth={FINE} />
      <path d={`M${x} ${y - 16 * s}V${y - 84 * s}`} fill="none" />
      <path d={`M${x + 4 * s} ${y - 80 * s}q${30 * s} ${26 * s} ${34 * s} ${56 * s}h-${34 * s}Z`} fill={sail} />
      <path d={`M${x - 4 * s} ${y - 70 * s}q-${20 * s} ${22 * s}-${24 * s} ${46 * s}h${24 * s}Z`} fill={sail} />
    </g>
  );
}

function Water({ y, x0 = -20, x1 = W + 20, fill = C.sea }) {
  return (
    <g>
      <path d={`M${x0} ${y}H${x1}V${H + 20}H${x0}Z`} fill={fill} />
      <path d={`M${x0} ${y + 60}H${x1}V${H + 20}H${x0}Z`} fill={C.deep} fillOpacity=".3" stroke="none" />
      <path d={`M${x0} ${y + 4}H${x1}`} fill="none" stroke="#fff" strokeWidth="4" strokeOpacity=".7" />
      <g className="cs-ripple" fill="none" strokeWidth={FINE} strokeOpacity=".6">
        {Array.from({ length: Math.ceil((x1 - x0) / 110) }, (_, i) => (
          <path key={i} d={`M${x0 + 30 + i * 110} ${y + 20 + ((i * 37) % 110)}q${10 + (i % 3) * 6}-6 ${20 + (i % 3) * 12} 0t${20 + (i % 3) * 12} 0`} />
        ))}
      </g>
      <g fill="none" stroke="#fff" strokeWidth="3" strokeOpacity=".7">
        {Array.from({ length: Math.ceil((x1 - x0) / 260) }, (_, i) => (
          <path key={i} d={`M${x0 + 120 + i * 260} ${y + 46 + ((i * 53) % 80)}h${30 + (i % 2) * 24}`} />
        ))}
      </g>
    </g>
  );
}

function Tulips({ x, y, cols = 10, rows = 3, colors = [C.red, C.yellow, C.rose, C.orange] }) {
  return (
    <g>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, i) => {
          const tx = x + i * 32 + r * 14;
          const ty = y + r * 34;
          return (
            <g key={`${r}-${i}`} className="cs-sway" style={{ transformOrigin: `${tx}px ${ty}px`, animationDelay: `${-(i + r) * 0.4}s` }}>
              <path d={`M${tx} ${ty}V${ty - 22}M${tx} ${ty - 8}q-8-4-10-12`} fill="none" stroke={C.leaf} strokeWidth="2.4" />
              <path d={`M${tx - 8} ${ty - 36}l4 7 4-8 4 8 4-7v10q0 7-8 7t-8-7Z`} fill={colors[(i + r) % colors.length]} />
            </g>
          );
        }),
      )}
    </g>
  );
}

function Fence({ x, y, n, gap = 46 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x + i * gap} ${y}v-40l6-8 6 8v40Z`} fill={C.cream} />
      ))}
      <path d={`M${x - 6} ${y - 26}h${(n - 1) * gap + 24}M${x - 6} ${y - 12}h${(n - 1) * gap + 24}`} fill="none" strokeWidth={FINE + 0.6} />
    </g>
  );
}

// Little grass tufts at [x, y] points.
function Tufts({ at }) {
  return (
    <path
      d={at.map(([x, y]) => `M${x - 8} ${y}l3-10 3 10M${x} ${y}l2-14 3 14M${x + 6} ${y}l4-9 2 9`).join("")}
      fill="none"
      stroke={C.leaf}
      strokeWidth="2.2"
    />
  );
}

const Trail = ({ d }) => <path d={d} fill={C.cream} strokeWidth={FINE + 0.6} />;

function Puffin({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-26" rx="18" ry="26" fill="#3d4448" />
      <ellipse cx="5" cy="-22" rx="11" ry="18" fill={C.snow} />
      <circle cx="2" cy="-54" r="14" fill="#3d4448" />
      <circle cx="6" cy="-56" r="6" fill={C.snow} stroke="none" />
      <path d="M14-58l20 6-20 8Z" fill={C.orange} />
      <path d="M-6 0h10M6 0h10" fill="none" stroke={C.orange} strokeWidth="4" />
    </g>
  );
}

// ---- One wide drawing per page ----

const SCENES = {
  taiwan: {
    // Taipei 101 at the left, tea terraces at the right, sky lanterns rising
    // over the hills between.
    prep: (
      <g>
        <Range y={330} peaks={[[160, 60], [420, 120], [700, 70], [980, 140], [1240, 90], [1500, 150]]} fill={C.farGrass} />
        <Cloud x={520} y={150} s={1.1} />
        <Cloud x={1180} y={110} s={0.8} />
        <Birds x={760} y={120} />
        <SkyLantern x={820} y={250} className="cs-rise" />
        <SkyLantern x={980} y={220} className="cs-rise is-late" />
        <SkyLantern x={1110} y={260} className="cs-rise is-later" />
        <path d="M-20 380q300-70 640-30t560-20 512-40V580H-20Z" fill={C.grass} />
        <g>
          <Shadow x={250} y={470} w={220} />
          <path d="M175 470l8-56h134l8 56Z" fill={C.ice} />
          {Array.from({ length: 8 }, (_, i) => {
            const y = 414 - i * 40;
            return (
              <g key={i}>
                <path d={`M190 ${y}l-10-40h140l-10 40Z`} fill={C.ice} />
                <path d={`M196 ${y - 8}h108M210 ${y}l-6-40M290 ${y}l6-40`} fill="none" strokeWidth={FINE} />
              </g>
            );
          })}
          <Shade d="M272 94h40l-14 320h-26Z" />
          <rect x="226" y="62" width="48" height="34" fill={C.ice} />
          <path d="M240 62l10-22 10 22M250 40V0" fill="none" />
          <path d="M150 470V430h40M350 470V420h-30" fill="none" strokeWidth={FINE} />
        </g>
        <Trail d="M560 580q40-70 160-110t260-40q-130 30-190 70t-110 80Z" />
        <Tufts at={[[90, 520], [420, 470], [470, 540], [880, 520], [1120, 540], [1300, 520], [1620, 540]]} />
        <Tree x={500} y={420} s={0.6} />
        <Tree x={680} y={400} s={0.45} />
        <path d="M980 470q200-200 732-220V580H980Z" fill={C.grass} />
        <g fill="none" stroke={C.leaf} strokeWidth="5">
          <path d="M1060 450q200-150 652-160" />
          <path d="M1020 490q240-160 692-150" />
          <path d="M1000 530q280-160 712-130" />
          <path d="M1060 400q160-110 652-130" />
        </g>
        <path d="M1080 444q14-12 28 0t28 0t28 0M1200 404q14-12 28 0t28 0M1320 380q14-12 28 0t28 0t28 0M1440 360q14-12 28 0t28 0" fill="none" strokeWidth={FINE} />
        <g>
          <path d="M1480 300l50-34 50 34Z" fill={C.red} />
          <rect x="1494" y="300" width="72" height="40" fill={C.cream} />
          <path d="M1494 340v-40M1566 340v-40" fill="none" />
        </g>
      </g>
    ),
    // A Jiufen teahouse on the hillside at the left, a lighthouse, then the
    // sea and Guishan Island at the right.
    hotel: (
      <g>
        <Cloud x={980} y={130} />
        <Birds x={1300} y={110} />
        <Water y={400} />
        <path d="M-20 260q260-40 520 60t360 130l60 130H-20Z" fill={C.grass} />
        <path d="M-20 400q200 0 420 40t460 140H-20Z" fill={C.farGrass} />
        <g>
          <Shadow x={290} y={440} w={380} />
          <rect x="120" y="280" width="340" height="160" fill={C.cream} />
          <Shade d="M380 280h80v160h-80Z" />
          <path d="M120 200q170-40 340 0l-20-40H140Z" fill={C.roof} />
          <rect x="150" y="200" width="280" height="34" fill={C.cream} />
          <path d="M90 290q200-60 400 0l-28-56H118Z" fill={C.roof} />
          <path d="M118 234q172 30 344 0M104 262q186 30 372 0" fill="none" strokeWidth={FINE} />
          <Window x={170} y={312} w={56} h={46} />
          <Window x={350} y={312} w={56} h={46} />
          <rect x="262" y="360" width="50" height="80" fill={C.plank} />
          {[140, 210, 280, 350, 420].map((x, i) => (
            <Lantern key={x} x={x} y={300} s={0.7} className={`cs-swing ${i % 2 ? "is-late" : ""}`} />
          ))}
        </g>
        <path d="M520 470h40v16h40v16h40v16h40v16h40" fill="none" strokeWidth={FINE + 0.8} />
        <Tree x={600} y={440} s={0.5} />
        <Tufts at={[[80, 470], [260, 500], [420, 480], [560, 540], [680, 520]]} />
        <g>
          <Shadow x={785} y={420} w={80} />
          <path d="M760 420l10-110h30l10 110Z" fill={C.snow} />
          <path d="M766 380h44M770 340h36" fill="none" stroke={C.red} strokeWidth="8" />
          <rect x="770" y="290" width="30" height="20" fill={C.glow} />
          <path d="M764 290l21-20 21 20Z" fill={C.red} />
        </g>
        {/* Guishan Island as seen from the Yilan coast: the turtle's small
            head at the left, a dip for the neck, the high domed shell, then
            a long low tail out to sea; pale cliffs along the waterline. */}
        <g>
          <path
            d="M1110 402q8-40 34-58q26-16 50-4q16 10 24 30q20-8 36-30q34-66 84-110q22-16 42-6q40 26 70 90q22 46 64 64q60 18 130 28q50 8 80 0V402Z"
            fill={C.leaf}
          />
          <path d="M1110 402q8-22 30-26q28 6 60 2q30 0 50 10q60-12 120-6q60 8 120 6q70 4 130 2q60 0 92 12V402Z" fill={C.stone} />
          <path d="M1140 390l6-12M1180 392l4-12M1240 394l6-14M1300 392l4-12M1360 394l6-14M1420 392l4-12M1480 394l6-14M1540 394l4-12" fill="none" strokeWidth={FINE} />
          <Shade d="M1420 230q40 26 70 90q22 46 64 64q60 18 130 28V402H1430Z" />
          <path d="M1160 350q12-8 24 0M1300 300q16-10 30 0M1350 250q14-10 28 0M1400 290q14-10 28 0M1520 360q14-10 28 0" fill="none" strokeWidth={FINE} />
          <path d="M1386 214q-14 30-10 70" fill="none" strokeWidth={FINE} strokeOpacity=".6" />
          <g fill="none" strokeWidth={FINE} strokeOpacity=".5">
            <path d="M1180 418h60M1300 422h90M1460 418h70" />
          </g>
        </g>
        <Boat x={960} y={470} />
      </g>
    ),
  },
  iceland: {
    // Hallgrímskirkja and coloured roofs at the left, a road between, then
    // Skógafoss and its puffins at the right.
    prep: (
      <g>
        <Range y={360} peaks={[[200, 80], [520, 150], [860, 110], [1200, 170], [1520, 100]]} />
        <Cloud x={700} y={140} />
        <Birds x={1000} y={120} />
        <Ground y={420} />
        <g>
          <Shadow x={240} y={440} w={340} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={`a${i}`} x={110 + i * 24} y={440 - (i + 1) * 50} width="24" height={(i + 1) * 50} fill={C.snow} />
          ))}
          <rect x="206" y="110" width="52" height="330" fill={C.snow} />
          <path d="M206 110l26-70 26 70Z" fill={C.snow} />
          <path d="M232 40V14M224 24h16" fill="none" />
          <rect x="220" y="150" width="24" height="30" fill={C.shade} />
          <circle cx="232" cy="210" r="10" fill={C.shade} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={`b${i}`} x={258 + i * 24} y={440 - (4 - i) * 50} width="24" height={(4 - i) * 50} fill={C.snow} />
          ))}
          <Shade d="M258 240h96v200h-96Z" />
          <path d="M220 440v-60q12-16 24 0v60" fill={C.plank} />
        </g>
        <House x={400} y={440} w={90} h={70} roof={C.red} wall={C.snow} windows={1} />
        <House x={510} y={440} w={80} h={60} roof="#7fa6c4" wall={C.cream} windows={1} door={false} />
        <Trail d="M620 580q120-100 380-150h40q-200 50-300 150Z" />
        {[700, 820, 940].map((x, i) => (
          <path key={x} d={`M${x} ${520 - i * 30}v-30`} fill="none" stroke={C.orange} strokeWidth="5" />
        ))}
        <g>
          <path d="M1040 440q10-150 50-240q30-50 100-60q90-6 170 4h90q90-14 150 10q50 30 60 90q10 110 30 196Z" fill={C.grass} />
          <path d="M1060 260q60-40 140-30M1450 230q60 0 100 30" fill="none" strokeWidth={FINE} />
          <Shade d="M1500 150q50 30 60 90q10 110 30 196h-90Z" />
          <rect x="1260" y="146" width="96" height="294" fill={C.ice} />
          <g className="cs-fall" fill="none" stroke="#fff" strokeWidth="4">
            <path d="M1274 150V438" />
            <path d="M1296 150V438" />
            <path d="M1318 150V438" />
            <path d="M1340 150V438" />
          </g>
          <ellipse cx="1308" cy="446" rx="90" ry="16" fill={C.snow} />
        </g>
        <Puffin x={1500} y={460} />
        <Puffin x={1560} y={468} s={0.85} />
      </g>
    ),
    // Turf houses at the left, Icelandic horses between, Kirkjufell under the
    // northern lights at the right.
    hotel: (
      <g>
        <Aurora x={80} y={170} w={1500} />
        <Range y={380} peaks={[[160, 70], [480, 120], [800, 90], [1100, 60]]} />
        <Water y={430} x0={980} />
        <Ground y={430} to={1060} />
        {[60, 210, 360].map((x, i) => (
          <g key={x}>
            <Shadow x={x + 70} y={450} w={170} />
            <path d={`M${x} 450V${370 - i * 8}l70-74 70 74V450Z`} fill={C.grass} />
            <path d={`M${x + 8} ${374 - i * 8}q30-20 62-62M${x + 132} ${374 - i * 8}q-30-20-62-62`} fill="none" strokeWidth={FINE} />
            <path d={`M${x + 34} 450V${388 - i * 6}l36-36 36 36V450Z`} fill={C.snow} />
            <rect x={x + 58} y={410 - i * 6} width="24" height={40 + i * 6} fill={C.red} />
            <Window x={x + 60} y={372 - i * 6} w={20} h={18} />
          </g>
        ))}
        {[[640, 480], [780, 470]].map(([x, y], i) => (
          <g key={x} className="cs-graze" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-i * 2}s` }}>
            <Shadow x={x} y={y} w={110} />
            <path d={`M${x - 34} ${y - 40}v40M${x - 14} ${y - 40}v40M${x + 18} ${y - 40}v40M${x + 34} ${y - 40}v40`} fill="none" strokeWidth="6" />
            <path d={`M${x - 46} ${y - 70}q46-14 90 0q10 20-4 30h-82q-14-10-4-30Z`} fill={i ? C.wood : C.dark} />
            <path d={`M${x + 40} ${y - 68}l24-34q10-6 18 2l6 16q-8 6-18 2l-12 22Z`} fill={i ? C.wood : C.dark} />
            <path d={`M${x + 58} ${y - 104}q-14 4-18 24M${x - 46} ${y - 64}q-14 20-6 40`} fill="none" stroke={C.cream} strokeWidth="7" />
          </g>
        ))}
        <g>
          <path d="M1120 430q70-240 170-270q90 40 180 270Z" fill={C.ice} />
          <path d="M1240 220q30-50 50-60q40 20 60 70q-14 10-26 0q-12 12-26 2q-16 8-34-6Z" fill={C.snow} />
          <path d="M1170 380q60-30 120-10q60-20 130 10M1200 320q50-20 100-6" fill="none" strokeWidth={FINE} />
          <Shade d="M1290 160q90 40 180 270h-150Z" />
        </g>
      </g>
    ),
  },
  norway: {
    // A fjord cliff with a waterfall at the left, boats on the water, a stave
    // church on the shore at the right.
    prep: (
      <g>
        <Range y={340} peaks={[[300, 90], [600, 160], [900, 120], [1200, 170]]} />
        <Cloud x={760} y={130} />
        <Birds x={560} y={150} />
        <Water y={430} />
        <g>
          <path d="M-20 100q140 20 240 120q100 120 160 210l40 40H-20Z" fill={C.rock} />
          <path d="M20 140q60 10 110 40M60 220q60 20 120 70M100 320q60 30 120 90" fill="none" strokeWidth={FINE} />
          <Shade d="M220 220q100 120 160 210l40 40H260Z" />
          <path d="M-20 100q90 8 160 40q-50 10-90 0q-40 10-70 0Z" fill={C.snow} />
          <g className="cs-fall" fill="none" stroke="#fff" strokeWidth="5"><path d="M300 260V430" /></g>
          <Pine x={110} y={290} s={0.4} />
          <Pine x={170} y={330} s={0.35} />
        </g>
        <Boat x={760} y={480} s={1.2} sail={C.red} />
        <Boat x={1040} y={460} s={0.7} />
        <path d="M1180 430q200-60 532-40V580H1180Z" fill={C.grass} />
        <Pine x={1260} y={430} s={0.9} />
        <g>
          <Shadow x={1480} y={420} w={260} />
          <rect x="1400" y="310" width="160" height="110" fill={C.wood} />
          <path d="M1400 340h160M1400 370h160M1400 400h160" fill="none" strokeWidth={FINE} />
          <path d="M1370 320l110-66 110 66Z" fill={C.dark} />
          <rect x="1430" y="216" width="100" height="40" fill={C.wood} />
          <path d="M1410 226l70-56 70 56Z" fill={C.dark} />
          <path d="M1455 170l25-74 25 74Z" fill={C.dark} />
          <path d="M1370 320q-24-30 8-44M1590 320q24-30-8-44M1410 226q-18-24 6-34M1550 226q18-24-6-34" fill="none" strokeWidth="4" />
          <rect x="1465" y="362" width="30" height="58" rx="14" fill={C.dark} />
          <Shade d="M1520 310h40v110h-40Z" />
        </g>
        <Pine x={1640} y={430} s={1} />
      </g>
    ),
    // Red rorbu cabins on stilts at the left, cod drying racks, a Viking ship
    // at the right.
    hotel: (
      <g>
        <Range y={380} peaks={[[140, 120], [420, 240], [700, 180], [1000, 120], [1320, 200], [1600, 140]]} fill={C.ice} />
        <Mountain x={240} y={410} w={500} h={270} fill={C.rock} />
        <Cloud x={980} y={120} />
        <Water y={420} />
        {[60, 220, 380].map((x) => (
          <g key={x}>
            <path d={`M${x + 12} 490V420M${x + 62} 490V420M${x + 112} 490V420`} fill="none" strokeWidth="5" />
            <House x={x} y={420} w={124} h={92} roof={C.dark} wall={C.red} windows={2} door={false} />
          </g>
        ))}
        <path d="M40 432h520" fill="none" strokeWidth="5" />
        <path d="M640 430l30-80 30 80M760 430l30-80 30 80M670 360h120" fill="none" strokeWidth="4" />
        <path d="M690 362v28M710 362v32M730 362v26M750 362v30M770 362v28" fill="none" strokeWidth={FINE + 1} />
        <g className="cs-bob" style={{ transformOrigin: "1280px 470px" }}>
          <path d="M1040 440q240 70 480 0q30-40 60-90q-30 10-56 36H1096q-26-26-56-36q30 50 0 90Z" fill={C.wood} />
          <path d="M1080 430q200 40 400 0" fill="none" strokeWidth={FINE} />
          <path d="M1280 390V160" fill="none" strokeWidth="5" />
          <path d="M1170 180h220v170H1170Z" fill={C.snow} />
          <path d="M1200 180v170M1240 180v170M1320 180v170M1360 180v170" fill="none" stroke={C.red} strokeWidth="16" />
          <Shade d="M1330 180h60v170h-60Z" />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={1110 + i * 42} cy={400} r="14" fill={i % 2 ? C.red : C.yellow} />
          ))}
        </g>
      </g>
    ),
  },
  finland: {
    // Reindeer in the pines at the left, a frozen lake, a lakeside sauna at
    // the right.
    prep: (
      <g>
        <Range y={360} peaks={[[200, 60], [600, 90], [1000, 70], [1400, 100]]} />
        <Cloud x={820} y={130} />
        <Ground y={440} />
        <path d="M900 470q300-30 812-10V580H900Z" fill={C.ice} />
        <path d="M960 500q200-14 500 0M1100 530q200-10 420 0" fill="none" strokeWidth={FINE} strokeOpacity=".7" />
        <Pine x={80} y={450} s={1.5} />
        <Pine x={200} y={440} s={1.1} />
        {[[380, 470, 1], [530, 452, 0.75]].map(([x, y, s], i) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <g className="cs-graze" style={{ animationDelay: `${-i * 2}s` }}>
              <Shadow x={0} y={0} w={180} />
              <path d="M-60-50v50M-34-50v50M36-50v50M58-50v50" fill="none" strokeWidth="8" />
              <path d="M-80-100q80-30 150 0q14 30-6 50H-74q-20-20-6-50Z" fill={C.wood} />
              <path d="M-70-56q60 14 130 0" fill="none" stroke={C.cream} strokeWidth="10" />
              <path d="M64-96q20-40 40-44l24 26q-10 14-30 10l-20 20Z" fill={C.wood} />
              <path d="M100-140q-14-36 10-60M100-140q-34-24-26-58M118-136q22-24 46-20M110-170h-22M104-186q-14-6-14-20M116-196q10-10 24-8" fill="none" strokeWidth="4" />
              <circle cx="126" cy="-110" r="5" fill={INK} />
            </g>
          </g>
        ))}
        <Pine x={680} y={430} s={0.9} />
        <Pine x={780} y={444} s={1.2} />
        <Pine x={940} y={450} s={0.8} />
        <g>
          <path d="M1260 470h240" fill="none" strokeWidth="5" />
          <House x={1250} y={460} w={200} h={110} roof={C.dark} wall={C.wood} windows={1} snowy chimney />
          <Smoke x={1392} y={266} />
          <path d="M1460 460h120v10h-120Z" fill={C.plank} />
          <path d="M1470 470v40M1570 470v40" fill="none" strokeWidth="4" />
        </g>
        <Pine x={1620} y={440} s={1.4} />
      </g>
    ),
    // Glass igloos under the aurora at the left, pines, a log cabin at the
    // right.
    hotel: (
      <g>
        <Aurora x={60} y={150} w={1560} />
        <Range y={380} peaks={[[300, 70], [800, 100], [1300, 80]]} />
        <Ground y={450} />
        {[80, 300, 520].map((x) => (
          <g key={x}>
            <Shadow x={x + 95} y={450} w={220} />
            <path d={`M${x} 450a95 95 0 0 1 190 0Z`} fill={C.ice} />
            <path d={`M${x + 95} 355V450M${x + 28} 383l67 67M${x + 162} 383l-67 67M${x + 8} 410q87-40 174 0`} fill="none" strokeWidth={FINE} />
            <path d={`M${x + 20} 400a80 80 0 0 1 60-38`} fill="none" stroke="#fff" strokeWidth="6" />
            <circle cx={x + 95} cy={424} r="16" fill={C.glow} />
          </g>
        ))}
        <Pine x={800} y={450} s={1} />
        <Pine x={900} y={440} s={0.7} />
        <Pine x={1000} y={450} s={1.2} />
        <LogCabin x={1130} y={450} />
        <Pine x={1560} y={450} s={1.4} />
      </g>
    ),
  },
  netherlands: {
    // A windmill at the left, tulip stripes, canal houses at the right, a
    // canal along the front.
    prep: (
      <g>
        <Cloud x={600} y={130} />
        <Cloud x={1100} y={90} s={0.8} />
        <Birds x={820} y={110} />
        <path d="M-20 400H1692V580H-20Z" fill={C.grass} />
        <Water y={500} />
        <g>
          <Shadow x={260} y={420} w={200} />
          <path d="M190 420l34-200h72l34 200Z" fill={C.cream} />
          <Shade d="M270 220h26l34 200h-60Z" />
          <path d="M184 340h152l-6 14H190Z" fill={C.plank} />
          <path d="M206 228l54-56 54 56Z" fill={C.dark} />
          <Window x={244} y={260} w={30} h={34} />
          <rect x="244" y="370" width="32" height="50" fill={C.plank} />
          <g className="cs-spin" style={{ transformOrigin: "260px 214px" }}>
            {[0, 90, 180, 270].map((a) => (
              <g key={a} transform={`rotate(${a} 260 214)`}>
                <path d="M260 214V40" fill="none" strokeWidth="5" />
                <rect x="262" y="52" width="36" height="150" fill={C.snow} />
                <path d="M262 82h36M262 112h36M262 142h36M262 172h36M280 52v150" fill="none" strokeWidth={FINE} />
              </g>
            ))}
            <circle cx="260" cy="214" r="9" fill={C.dark} />
          </g>
        </g>
        {[C.red, C.yellow, C.rose, C.orange, C.lilac].map((color, i) => (
          <path key={color} d={`M${420 + i * 100} 494l${110 + i * 16}-84h56l-${70 - i * 6} 84Z`} fill={color} />
        ))}
        <Tulips x={380} y={480} cols={8} rows={1} />
        <Tufts at={[[60, 460], [140, 480], [700, 470], [900, 460]]} />
        {[
          [1000, C.wood, 0],
          [1100, C.red, 1],
          [1200, C.cream, 0],
          [1300, C.dark, 1],
          [1400, C.rose, 0],
          [1500, "#9fb7c9", 1],
        ].map(([x, fill, tall]) => {
          const top = 260 - tall * 34;
          return (
            <g key={x}>
              <path d={`M${x} 494V${top}h20v-20h20v-20h20v20h20v20h20V494Z`} fill={fill} />
              <path d={`M${x + 50} ${top - 40}v-10`} fill="none" strokeWidth={FINE} />
              {[0, 1, 2].map((r) => (
                <g key={r}>
                  <Window x={x + 16} y={top + 26 + r * 64} w={24} h={34} />
                  <Window x={x + 60} y={top + 26 + r * 64} w={24} h={34} />
                </g>
              ))}
              <path d={`M${x + 40} 494v-36h20v36`} fill={C.plank} />
            </g>
          );
        })}
        <Shade d="M1500 226h100v268h-100Z" />
        <Pine x={1650} y={494} s={0.9} snowy={false} fill={C.leaf} />
      </g>
    ),
    // Canal houses at the left, a bridge, a houseboat, bicycles on the quay
    // at the right.
    hotel: (
      <g>
        <Cloud x={820} y={120} />
        <Birds x={1100} y={140} />
        <Water y={440} />
        {[40, 140, 240, 340, 440].map((x, i) => {
          const top = 220 + (i % 2) * 30;
          return (
            <g key={x}>
              <path d={`M${x} 440V${top}l50-56 50 56V440Z`} fill={[C.red, C.cream, C.wood, C.rose, "#9fb7c9"][i]} />
              {[0, 1, 2].map((r) => (
                <g key={r}>
                  <Window x={x + 16} y={top + 20 + r * 64} w={24} h={34} />
                  <Window x={x + 60} y={top + 20 + r * 64} w={24} h={34} />
                </g>
              ))}
            </g>
          );
        })}
        <path d="M30 440h530" fill="none" strokeWidth="5" />
        <g>
          <path d="M600 440q140-90 280 0v-30q-140-80-280 0Z" fill={C.stone} />
          <path d="M610 400v-24M650 382v-24M700 368v-24M740 364v-24M780 368v-24M830 382v-24M870 400v-24M610 376q130-70 260 0" fill="none" strokeWidth={FINE + 0.6} />
        </g>
        <g className="cs-bob" style={{ transformOrigin: "1120px 470px" }}>
          <path d="M980 450h280l-20 30H1000Z" fill={C.plank} />
          <rect x="1010" y="390" width="220" height="60" fill="#a9c6a0" />
          <Window x={1030} y={404} w={30} h={28} />
          <Window x={1090} y={404} w={30} h={28} />
          <Window x={1150} y={404} w={30} h={28} />
          <path d="M1000 390h240l-10-14H1010Z" fill={C.roof} />
        </g>
        <path d="M1300 440H1692V580H1300Z" fill={C.stone} />
        <path d="M1300 440h392" fill="none" strokeWidth="5" />
        {[1380, 1530].map((x, i) => (
          <g key={x} transform={`translate(${x} 500)`} fill="none">
            <circle cx="0" cy="0" r="34" />
            <circle cx="110" cy="0" r="34" />
            <path d="M0 0l40-60h50l20 60M40-60l15 60h-55M90-60l-8-16h-14M40-60l-6-14h-14" strokeWidth="4" />
            <path d="M-20-40h40v24h-40Z" fill={i ? C.red : C.yellow} strokeWidth={FINE} />
          </g>
        ))}
      </g>
    ),
  },
  france: {
    // The Eiffel Tower over Paris roofs at the left, poplars along a road,
    // Mont Blanc and a chalet at the right.
    prep: (
      <g>
        <Range y={360} peaks={[[900, 110], [1100, 190], [1300, 260], [1500, 200], [1650, 140]]} fill={C.ice} />
        <Mountain x={1120} y={430} w={520} h={320} />
        <Cloud x={480} y={120} />
        <Birds x={640} y={180} />
        <path d="M-20 420q600-30 1732 20V580H-20Z" fill={C.snow} />
        {[30, 330, 400].map((x, i) => (
          <g key={x}>
            <rect x={x} y={340 - i * 6} width="70" height={80 + i * 6} fill={C.cream} />
            <path d={`M${x - 6} ${340 - i * 6}h82l-10-22H${x + 4}Z`} fill="#9fb2c2" />
            <Window x={x + 14} y={360 - i * 6} w={16} h={20} />
            <Window x={x + 42} y={360 - i * 6} w={16} h={20} />
          </g>
        ))}
        <g>
          <Shadow x={220} y={440} w={240} />
          <path d="M120 440q50-110 72-210l20-120h16l20 120q22 100 72 210h-56q-28-60-44-60t-44 60Z" fill={C.wood} />
          <path d="M150 360h140M178 270h84M200 190h40" fill="none" strokeWidth="5" />
          <path d="M140 400l60-40M300 400l-60-40M170 320l40-50M270 320l-40-50M196 240l24-50M244 240l-24-50" fill="none" strokeWidth={FINE} />
          <path d="M220 110V60M212 74h16" fill="none" />
          <Shade d="M228 110l20 120q22 100 72 210h-56q-28-60-36-60Z" />
        </g>
        <Trail d="M520 580q120-90 360-150h40q-180 60-280 150Z" />
        {[600, 700, 800, 900].map((x, i) => (
          <g key={x}>
            <path d={`M${x} ${470 - i * 14}V${440 - i * 14}`} fill="none" strokeWidth="4" />
            <path d={`M${x} ${290 - i * 8}q22 60 0 ${150 - i * 6}q-22-90 0-${150 - i * 6}Z`} fill={C.leaf} />
          </g>
        ))}
        <Pine x={1060} y={450} s={1} />
        <House x={1270} y={450} w={190} h={110} roof={C.dark} wall={C.wood} windows={2} snowy chimney />
        <Smoke x={1405} y={258} />
        <Pine x={1580} y={450} s={1.2} />
      </g>
    ),
    // A Paris building over a café at the left, street lamps, an Alpine
    // chalet village at the right.
    hotel: (
      <g>
        <Range y={360} peaks={[[900, 140], [1150, 230], [1400, 180], [1640, 240]]} fill={C.ice} />
        <Mountain x={980} y={420} w={420} h={270} />
        <Mountain x={1280} y={420} w={440} h={310} />
        <Cloud x={600} y={110} />
        <path d="M-20 440H860q200-10 852 0V580H-20Z" fill={C.snow} />
        <path d="M-20 456H760q80 0 140 124H-20Z" fill={C.stone} />
        <g>
          <rect x="60" y="150" width="380" height="300" fill={C.cream} />
          <Shade d="M380 150h60v300h-60Z" />
          <path d="M50 160h400l-36-60H86Z" fill="#9fb2c2" />
          {[120, 220, 320].map((x) => <rect key={x} x={x} y="110" width="30" height="34" fill={C.cream} />)}
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3, 4].map((c) => <Window key={`${r}${c}`} x={84 + c * 72} y={180 + r * 64} w={30} h={42} />),
          )}
          <path d="M70 240h360M70 304h360" fill="none" strokeWidth="4" />
          <path d="M60 380h380v28q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0q-19 14-38 0Z" fill={C.red} />
          <path d="M98 380v28M174 380v28M250 380v28M326 380v28M402 380v28" fill="none" stroke="#fff" strokeWidth="8" />
          {[130, 300].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="436" rx="26" ry="6" fill={C.cream} />
              <path d={`M${x} 436v18M${x - 40} 454v-30h14v30M${x + 40} 454v-30h-14v30`} fill="none" strokeWidth={FINE + 1} />
            </g>
          ))}
        </g>
        {[560, 760].map((x) => (
          <g key={x}>
            <path d={`M${x} 456V300`} fill="none" strokeWidth="5" />
            <path d={`M${x - 16} 300h32l-6-30h-20Z`} fill={C.glow} />
          </g>
        ))}
        <House x={960} y={450} w={150} h={90} roof={C.dark} wall={C.wood} windows={1} snowy />
        <House x={1180} y={450} w={190} h={110} roof={C.dark} wall={C.wood} windows={2} snowy chimney />
        <Smoke x={1315} y={258} />
        <Pine x={1460} y={450} s={1} />
        <Pine x={1580} y={450} s={1.3} />
      </g>
    ),
  },
  switzerland: {
    // The Matterhorn at the left, a small lake, a red train on a stone
    // viaduct at the right.
    prep: (
      <g>
        <Range y={340} peaks={[[600, 120], [900, 180], [1200, 140], [1500, 200]]} fill={C.ice} />
        <Cloud x={620} y={110} />
        <g>
          <path d="M80 440l170-200 70-150q40 50 40 120l170 230Z" fill={C.ice} />
          <path d="M250 240l70-150q40 50 40 120q-30-14-56 20q-24-10-54 10Z" fill={C.snow} />
          <path d="M200 340q60-40 120-20M330 260l20 60M300 370q60-30 120 10" fill="none" strokeWidth={FINE} />
          <Shade d="M320 90q40 50 40 120l170 230H360Z" />
        </g>
        <Ground y={430} />
        <path d="M520 474q200-40 380 0q-180 30-380 0Z" fill={C.sea} />
        <Pine x={480} y={450} s={0.8} />
        <Pine x={940} y={450} s={0.9} />
        <g>
          <path d="M1000 310h712v20H1000Z" fill={C.stone} />
          <path d="M1000 330h712V452H1000Z" fill={C.rock} />
          {[1030, 1170, 1310, 1450, 1590].map((x) => (
            <path key={x} d={`M${x} 454v-70a50 50 0 0 1 100 0v70Z`} fill={C.snow} />
          ))}
          <path d="M1000 360h712M1000 400h712" fill="none" strokeWidth={FINE} strokeOpacity=".6" />
          <g className="cs-train">
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={1000 + i * 100} y="268" width="94" height="42" rx="10" fill={C.red} />
                <rect x={1010 + i * 100} y="276" width="74" height="16" fill={C.glow} />
                <path d={`M${1010 + i * 100} 300h74`} fill="none" strokeWidth={FINE} />
              </g>
            ))}
          </g>
        </g>
      </g>
    ),
    // A chalet with flower boxes at the left, a fence, cows with bells on the
    // meadow at the right.
    hotel: (
      <g>
        <Range y={340} peaks={[[700, 140], [1000, 220], [1300, 180], [1580, 240]]} fill={C.ice} />
        <Mountain x={1060} y={400} w={560} h={280} />
        <Cloud x={640} y={110} />
        <path d="M-20 450q500-20 900-60t832-10V580H-20Z" fill={C.grass} />
        <g>
          <Shadow x={260} y={460} w={380} />
          <rect x="100" y="270" width="320" height="190" fill={C.wood} />
          <path d="M100 300h320M100 330h320M100 390h320M100 420h320" fill="none" strokeWidth={FINE} strokeOpacity=".6" />
          <path d="M60 290l200-126 200 126Z" fill={C.snow} />
          <path d="M60 290q30 10 60 0q30 12 60 0q30 10 60 0q30 12 60 0q30 10 60 0q30 12 60 0q30 10 40 0" fill="none" strokeWidth={FINE} />
          {[130, 230, 330].map((x) => (
            <g key={x}>
              <Window x={x} y={300} w={50} h={48} />
              <path d={`M${x - 6} 350h62v14h-62Z`} fill={C.plank} />
              <circle cx={x + 6} cy={348} r="7" fill={C.red} />
              <circle cx={x + 24} cy={346} r="7" fill={C.rose} />
              <circle cx={x + 42} cy={348} r="7" fill={C.red} />
            </g>
          ))}
          <rect x="235" y="390" width="50" height="70" fill={C.dark} />
          <Shade d="M360 270h60v190h-60Z" />
        </g>
        <Fence x={500} y={462} n={8} />
        <Tufts at={[[60, 520], [440, 500], [600, 530], [900, 510], [1150, 520], [1420, 500], [1600, 530]]} />
        {[[1000, 470, 1], [1300, 440, 0.8]].map(([x, y, s], i) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <Shadow x={0} y={0} w={220} />
            <path d="M-70-34v34M-44-34v34M48-34v34M72-34v34" fill="none" strokeWidth="9" />
            <rect x="-90" y="-112" width="180" height="82" rx="34" fill={C.snow} />
            <path d="M-50-112q24 30-12 70l30 6q20-40 0-76ZM30-112q-20 30 22 64q20-30 10-64Z" fill={C.dark} />
            <path d="M-90-80q-20 10-16 40" fill="none" strokeWidth="4" />
            <rect x="80" y="-136" width="58" height="54" rx="22" fill={C.snow} />
            <rect x="96" y="-104" width="38" height="22" rx="10" fill={C.rose} />
            <path d="M88-132l-12-16M130-132l12-16" fill="none" strokeWidth="5" />
            <circle cx="98" cy="-118" r="3" fill={INK} />
            <circle cx="120" cy="-118" r="3" fill={INK} />
            <g className="cs-swing" style={{ transformOrigin: "106px -82px", animationDelay: `${-i * 1.2}s` }}>
              <path d="M104-82v6M96-76h20l4 18h-28Z" fill={C.yellow} />
            </g>
          </g>
        ))}
        <Tulips x={720} y={530} cols={8} rows={1} colors={[C.yellow, C.lilac, C.snow]} />
      </g>
    ),
  },
  newZealand: {
    // A stone church and lupins by the lake at the left, the Southern Alps
    // across the water, a kiwi under a silver fern at the right.
    prep: (
      <g>
        <Range y={360} peaks={[[300, 160], [560, 230], [800, 180], [1060, 250], [1300, 170]]} fill={C.ice} />
        <Mountain x={480} y={390} w={420} h={270} />
        <Mountain x={820} y={390} w={460} h={230} />
        <Cloud x={1300} y={120} />
        <Water y={380} />
        <path d="M-20 420q200-50 520-10q100 20 140 170H-20Z" fill={C.grass} />
        <g>
          <Shadow x={165} y={420} w={200} />
          <rect x="90" y="330" width="150" height="90" fill={C.stone} />
          <path d="M90 350h150M90 380h150M120 330v90M170 330v90M210 330v90" fill="none" strokeWidth={FINE} strokeOpacity=".5" />
          <path d="M80 340l85-70 85 70Z" fill={C.roof} />
          <rect x="190" y="300" width="40" height="40" fill={C.stone} />
          <path d="M210 300v-30M200 284h20" fill="none" />
          <Window x={140} y={360} w={34} h={40} />
        </g>
        {[300, 340, 380, 420, 460, 500].map((x, i) => (
          <g key={x} className="cs-sway" style={{ transformOrigin: `${x}px 470px`, animationDelay: `${-i * 0.5}s` }}>
            <path d={`M${x} 470v-30`} fill="none" stroke={C.leaf} strokeWidth="3" />
            <path d={`M${x} 360q12 40 0 84q-12-44 0-84Z`} fill={[C.lilac, C.rose, C.yellow][i % 3]} />
          </g>
        ))}
        <Boat x={760} y={450} s={0.8} />
        <path d="M980 580q80-100 260-116q250-40 472-50V580Z" fill={C.grass} />
        <g className="cs-sway" style={{ transformOrigin: "1600px 480px" }}>
          <path d="M1600 480q-50-180-200-280" fill="none" stroke={C.leaf} strokeWidth="6" />
          {Array.from({ length: 12 }, (_, i) => {
            const t = i / 12;
            const x = 1600 - 200 * t;
            const y = 480 - 280 * t + 60 * t * t;
            return <path key={i} d={`M${x} ${y}q-${30 - i * 2}-6-${56 - i * 4}-${18 - i}M${x} ${y}q4-${30 - i * 2} 14-${54 - i * 4}`} fill="none" stroke={C.leaf} strokeWidth="5" />;
          })}
        </g>
        <g transform="translate(1340 480)">
          <Shadow x={0} y={0} w={170} />
          <path d="M-20 0v-14l-8 6M20 0v-14l8 6" fill="none" strokeWidth="5" />
          <ellipse cx="0" cy="-52" rx="74" ry="52" fill={C.wood} />
          <path d="M-50-70q20-10 40 0M-40-40q20-10 40 0M10-80q20-10 40 0" fill="none" strokeWidth={FINE} />
          <circle cx="62" cy="-78" r="24" fill={C.wood} />
          <path d="M82-80q56 20 78 56" fill="none" strokeWidth="5" />
          <circle cx="70" cy="-84" r="3" fill={INK} />
        </g>
      </g>
    ),
    // Hobbit holes in a grassy hill at the left, a fence, sheep on rolling
    // hills at the right.
    hotel: (
      <g>
        <Cloud x={700} y={110} />
        <Birds x={1000} y={120} />
        <path d="M-20 340q300-60 700-10t600-40 432-20V580H-20Z" fill={C.farGrass} />
        <path d="M-20 480q60-280 360-280t360 280Z" fill={C.grass} />
        <Shade d="M340 200q300 0 360 280H500Z" />
        {[[340, 420, 70], [560, 466, 46]].map(([x, y, r]) => (
          <g key={x}>
            <circle cx={x} cy={y} r={r} fill={C.plank} />
            <circle cx={x} cy={y} r={r * 0.82} fill={C.wood} />
            <path d={`M${x} ${y - r * 0.82}V${y + r}M${x - r * 0.45} ${y - r * 0.7}V${y + r}M${x + r * 0.45} ${y - r * 0.7}V${y + r}`} fill="none" strokeWidth={FINE} strokeOpacity=".6" />
            <circle cx={x} cy={y} r={r * 0.12} fill={C.yellow} />
          </g>
        ))}
        <circle cx="180" cy="390" r="28" fill={C.glow} />
        <path d="M152 390h56M180 362v56" fill="none" strokeWidth={FINE} />
        {[160, 220, 480, 640].map((x, i) => (
          <circle key={x} cx={x} cy={472 - (i % 2) * 6} r="8" fill={[C.yellow, C.rose, C.lilac, C.red][i]} />
        ))}
        <path d="M-20 480H1712V580H-20Z" fill={C.grass} />
        <Fence x={760} y={482} n={7} />
        <Tufts at={[[60, 530], [300, 540], [700, 520], [1160, 540], [1380, 530], [1560, 545]]} />
        {[[1060, 470], [1260, 500], [1460, 450], [1610, 490]].map(([x, y], i) => (
          <g key={x} className="cs-graze" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-i * 1.3}s` }}>
            <Shadow x={x} y={y} w={110} />
            <path d={`M${x - 22} ${y - 8}v16M${x + 16} ${y - 8}v16`} fill="none" strokeWidth="6" />
            <path d={`M${x - 46} ${y - 34}q-12-30 18-34q12-22 34-8q26-10 32 16q26 12 6 34q0 22-28 22H${x - 24}q-28 0-22-30Z`} fill={C.snow} />
            <path d={`M${x - 30} ${y - 30}q6-6 12 0M${x} ${y - 46}q6-6 12 0M${x + 10} ${y - 20}q6-6 12 0`} fill="none" strokeWidth={FINE} />
            <ellipse cx={x + 48} cy={y - 34} rx="15" ry="12" fill={INK} />
          </g>
        ))}
      </g>
    ),
  },
  canada: {
    // The Rockies over a turquoise lake with a red canoe at the left, a moose
    // among snowy pines at the right.
    prep: (
      <g>
        <Range y={360} peaks={[[120, 150], [380, 230], [640, 190], [900, 240], [1200, 160]]} fill={C.ice} />
        <Mountain x={40} y={400} w={420} h={290} />
        <Mountain x={340} y={400} w={480} h={320} />
        <Mountain x={700} y={400} w={380} h={230} />
        <Cloud x={1200} y={120} />
        <Water y={390} x1={1000} fill="#a6d6d6" />
        <Pine x={80} y={470} s={1.2} />
        <Pine x={180} y={480} s={0.8} />
        <g className="cs-bob" style={{ transformOrigin: "560px 460px" }}>
          <path d="M460 450q100 34 200 0q-100 12-200 0Z" fill={C.red} />
          <path d="M560 452l40-60M596 398l12-20" fill="none" strokeWidth="4" />
        </g>
        <path d="M900 440q300-50 812-20V580H900Z" fill={C.snow} />
        <Pine x={980} y={440} s={1.3} />
        <g transform="translate(1260 470)">
          <Shadow x={0} y={0} w={240} />
          <path d="M-70-44v44M-42-44v44M40-44v44M64-44v44" fill="none" strokeWidth="11" />
          <path d="M-100-104q90-34 170 0q18 36-6 60H-90q-24-24-10-60Z" fill={C.dark} />
          <path d="M60-118q30-24 56-10l30 50q-12 20-38 8l-30-28Z" fill={C.dark} />
          <path d="M132-80q4 18-4 26" fill="none" strokeWidth="4" />
          <path d="M80-134q-30-50 6-64q10 22 20 10q10 22 22 2q12 30-34 52Z" fill={C.wood} />
          <path d="M108-132q30-46 66-34q-10 22 4 22q-6 22-40 22Z" fill={C.wood} />
          <circle cx="114" cy="-108" r="4" fill={INK} />
          <Shade d="M-100-104q90-34 170 0v60H-90Z" />
        </g>
        <Pine x={1520} y={450} s={1.5} />
        <Pine x={1640} y={440} s={1.1} />
      </g>
    ),
    // A log cabin at the left, a path and fence, a maple tree dropping red
    // leaves at the right.
    hotel: (
      <g>
        <Range y={380} peaks={[[300, 130], [700, 200], [1100, 150], [1500, 210]]} fill={C.ice} />
        <Cloud x={760} y={120} />
        <Ground y={450} />
        <Pine x={70} y={450} s={1.3} />
        <LogCabin x={170} y={450} w={300} h={130} />
        <Pine x={560} y={450} s={1} />
        <Trail d="M600 580q120-80 300-120h40q-160 40-240 120Z" />
        <Pine x={860} y={440} s={0.8} />
        <Fence x={980} y={462} n={5} />
        <g>
          <Shadow x={1420} y={460} w={340} />
          <path d="M1410 460V320l-60-60M1414 400l70-100M1410 340l-40-30" fill="none" strokeWidth="14" stroke={C.plank} />
          {[[1300, 260, 70, C.red], [1420, 190, 100, C.orange], [1540, 260, 80, C.red], [1360, 330, 60, C.orange], [1480, 320, 66, C.red]].map(([x, y, r, fill]) => (
            <path key={`${x}${y}`} d={`M${x - r} ${y}q-6-${r * 0.6} ${r * 0.4}-${r * 0.8}q${r * 0.2}-${r * 0.5} ${r * 0.7}-${r * 0.3}q${r * 0.6}-${r * 0.2} ${r * 0.8} ${r * 0.4}q${r * 0.5} ${r * 0.4} ${r * 0.2} ${r * 0.9}q-${r * 0.2} ${r * 0.6}-${r * 0.9} ${r * 0.5}q-${r * 0.7} ${r * 0.1}-${r * 1.2}-${r * 0.7}Z`} fill={fill} />
          ))}
          <path d="M1340 240q10-10 22 0M1440 170q10-10 22 0M1520 250q10-10 22 0M1400 300q10-10 22 0" fill="none" strokeWidth={FINE} />
        </g>
        {[[1300, 0], [1440, 2.2], [1560, 4.1], [1380, 5.6], [1620, 3]].map(([x, delay]) => (
          <path
            key={x}
            className="cs-leaf"
            style={{ animationDelay: `${-delay}s` }}
            d={`M${x} 330l6-12 4 8 8-4-2 10 8 2-10 6 2 8-8-4-6 8-2-10-10 0 8-8-6-6 10 0Z`}
            fill={C.red}
          />
        ))}
      </g>
    ),
  },
};

function CountryScene({ country, page }) {
  const scene = SCENES[country]?.[page];
  if (!scene) return null;
  return (
    <SnowScene snow={isSnowyCountry(country)}>
      <svg className="country-scene-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          {/* The pencil look: lines wobble a little, and fills are streaky. */}
          <filter id="country-scene-pencil" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="3" result="wobble" />
            <feTurbulence type="fractalNoise" baseFrequency="0.5 2.2" numOctaves="1" seed="8" result="streak" />
            <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.5" result="streakAlpha" />
            <feComposite in="wobble" in2="streakAlpha" operator="in" />
          </filter>
          {/* Pencil hatching for the shaded side of things. */}
          <pattern id="country-scene-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 0V9" stroke={INK} strokeWidth="1.3" strokeOpacity=".35" />
          </pattern>
        </defs>
        <g filter="url(#country-scene-pencil)" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
          {scene}
        </g>
      </svg>
    </SnowScene>
  );
}

export default CountryScene;
