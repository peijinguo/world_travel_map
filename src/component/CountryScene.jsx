import SnowScene from "./SnowScene";
import "../assets/pages/_country-scene.scss";

// The faint picture behind 行前準備 and 機票住宿 for every country but Japan
// (which keeps its hand-drawn snow scenes, PrepScene and HotelScene). Each is
// two corner drawings in the colored-pencil look of Japan's: wobbly ink
// lines and grainy pastel fills, from the SVG filter below. Drawings are in a
// 836 × 560 box, the size of Japan's corner pieces (see _snow-scene.scss).
const W = 836;
const H = 560;
const INK = "#4f5a5e";
const C = {
  snow: "#ffffff",
  ice: "#cfe0ee",
  sky: "#a9c6de",
  sea: "#8fb6d4",
  grass: "#a8c79a",
  leaf: "#7fa77a",
  pine: "#8e9c95",
  rock: "#b9b2a6",
  wood: "#b39377",
  dark: "#7c6a5c",
  red: "#d88a7e",
  rose: "#ecb3a8",
  yellow: "#f1d58a",
  orange: "#eda56f",
  lilac: "#b9a4d6",
  cream: "#f6ecd6",
  glow: "#fbe6a2",
};

// ---- Building blocks (x, y is the foot of each thing) ----

const Ground = ({ d, fill = C.snow }) => <path d={d} fill={fill} />;

function Mountain({ x, y, w, h, fill = C.ice, cap = true }) {
  const top = [x + w / 2, y - h];
  return (
    <g>
      <path d={`M${x} ${y}L${top[0]} ${top[1]}L${x + w} ${y}Z`} fill={fill} />
      {cap && (
        <path
          d={`M${top[0] - w * 0.17} ${top[1] + h * 0.34}L${top[0]} ${top[1]}L${top[0] + w * 0.17} ${top[1] + h * 0.34}
            l-${w * 0.06} ${h * 0.08} l-${w * 0.05} -${h * 0.07} l-${w * 0.05} ${h * 0.09}Z`}
          fill={C.snow}
        />
      )}
    </g>
  );
}

function Pine({ x, y, s = 1, snowy = true, fill = C.pine }) {
  const tier = (top, half, bottom) =>
    `M${x} ${y - top * s}L${x + half * s} ${y - bottom * s}H${x - half * s}Z`;
  return (
    <g>
      <path d={`M${x} ${y}V${y - 18 * s}`} fill="none" />
      <path d={tier(150, 34, 70)} fill={fill} />
      <path d={tier(120, 46, 40)} fill={fill} />
      <path d={tier(90, 58, 14)} fill={fill} />
      {snowy && (
        <path
          d={`M${x - 15 * s} ${y - 118 * s}L${x} ${y - 150 * s}L${x + 15 * s} ${y - 118 * s}q-8 6-15 0q-7 6-15 0Z`}
          fill={C.snow}
        />
      )}
    </g>
  );
}

function Cloud({ x, y, s = 1 }) {
  const r = (n) => n * s;
  return (
    <path
      d={`M${x} ${y}h${r(110)}a${r(20)} ${r(20)} 0 0 0 ${r(4)}-${r(38)}a${r(30)} ${r(30)} 0 0 0-${r(48)}-${r(24)}
        a${r(26)} ${r(26)} 0 0 0-${r(48)} ${r(10)}a${r(22)} ${r(22)} 0 0 0-${r(18)} ${r(52)}Z`}
      fill={C.snow}
    />
  );
}

function Gabled({ x, y, w, h, roof = C.red, wall = C.cream, door = true, windows = 1, snowy = false }) {
  const peak = h * 0.55;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      <path d={`M${x - 10} ${y - h + 4}L${x + w / 2} ${y - h - peak}L${x + w + 10} ${y - h + 4}Z`} fill={snowy ? C.snow : roof} />
      {Array.from({ length: windows }, (_, i) => (
        <rect key={i} x={x + ((i + 1) * w) / (windows + 1) - 9} y={y - h * 0.72} width="18" height="18" fill={C.glow} />
      ))}
      {door && <rect x={x + w / 2 - 11} y={y - 36} width="22" height="36" fill={C.wood} />}
    </g>
  );
}

function Lantern({ x, y, s = 1, className = "" }) {
  return (
    <g className={className} style={{ transformOrigin: `${x}px ${y - 30 * s}px` }}>
      <path d={`M${x} ${y - 48 * s}V${y - 40 * s}`} fill="none" />
      <path
        d={`M${x - 12 * s} ${y - 40 * s}h${24 * s}q${12 * s} ${16 * s} 0 ${32 * s}h-${24 * s}q-${12 * s}-${16 * s} 0-${32 * s}Z`}
        fill={C.red}
      />
    </g>
  );
}

function Aurora({ x, y, w }) {
  return (
    <g className="cs-aurora">
      <path
        d={`M${x} ${y}q${w * 0.25}-${70} ${w * 0.5}-10t${w * 0.5}-30`}
        fill="none"
        stroke="#9fdcc0"
        strokeWidth="26"
        strokeOpacity=".75"
      />
      <path
        d={`M${x + 30} ${y + 34}q${w * 0.25}-${60} ${w * 0.5}-6t${w * 0.45}-34`}
        fill="none"
        stroke={C.lilac}
        strokeWidth="14"
        strokeOpacity=".6"
      />
    </g>
  );
}

function Smoke({ x, y }) {
  return (
    <g className="cs-smoke" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x} ${y}q-14-18 0-34t0-34`} fill="none" strokeOpacity=".6" />
    </g>
  );
}

function Boat({ x, y, s = 1, sail = C.snow }) {
  return (
    <g className="cs-bob" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x - 40 * s} ${y - 14 * s}h${80 * s}l-${14 * s} ${14 * s}h-${52 * s}Z`} fill={C.wood} />
      <path d={`M${x} ${y - 14 * s}V${y - 70 * s}l${30 * s} ${46 * s}Z`} fill={sail} />
    </g>
  );
}

function Water({ y, x0 = 0, x1 = W }) {
  return (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={H - y} fill={C.sea} stroke="none" />
      <g className="cs-ripple" fill="none" strokeOpacity=".55">
        <path d={`M${x0 + 40} ${y + 30}q20-8 40 0t40 0`} />
        <path d={`M${x0 + 200} ${y + 60}q20-8 40 0t40 0`} />
        <path d={`M${x0 + 120} ${y + 100}q20-8 40 0t40 0`} />
      </g>
    </g>
  );
}

function Tulips({ x, y, rows = 3, colors = [C.red, C.yellow, C.rose, C.orange] }) {
  return (
    <g>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: 9 }, (_, i) => {
          const tx = x + i * 30 + r * 12;
          const ty = y + r * 30;
          return (
            <g key={`${r}-${i}`} className="cs-sway" style={{ transformOrigin: `${tx}px ${ty}px`, animationDelay: `${-(i + r) * 0.4}s` }}>
              <path d={`M${tx} ${ty}V${ty - 18}`} fill="none" stroke={C.leaf} />
              <path d={`M${tx - 7} ${ty - 30}l4 6 3-7 3 7 4-6v8q0 6-7 6t-7-6Z`} fill={colors[(i + r) % colors.length]} />
            </g>
          );
        }),
      )}
    </g>
  );
}

// ---- The drawings: [bottom-left, bottom-right] per page ----

const SCENES = {
  taiwan: {
    prep: [
      // Taipei 101 among green hills.
      <g key="l">
        <Cloud x={430} y={150} s={1.1} />
        <path d="M0 330q140-90 300-40t300 10 236-40V560H0Z" fill={C.grass} />
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const y = 470 - i * 42;
            return <path key={i} d={`M${170 - 4} ${y}l-8-42h${100}l-8 42Z`} fill={C.ice} />;
          })}
          <rect x="190" y="90" width="40" height="40" fill={C.ice} />
          <path d="M210 90V40" fill="none" />
        </g>
        <Ground d="M0 470q200-30 420 0t416-10V560H0Z" fill={C.grass} />
      </g>,
      // Tea terraces, sky lanterns drifting up.
      <g key="r">
        <Lantern x={560} y={220} className="cs-rise" />
        <Lantern x={690} y={170} s={0.8} className="cs-rise is-late" />
        <path d="M0 400q220-120 520-160t316 0V560H0Z" fill={C.grass} />
        <g fill="none" stroke={C.leaf}>
          <path d="M120 420q200-90 420-120t296-10" />
          <path d="M60 470q240-100 480-130t296 0" />
          <path d="M20 520q260-100 520-130t296 10" />
        </g>
      </g>,
    ],
    hotel: [
      // A Jiufen teahouse hung with red lanterns.
      <g key="l">
        <rect x="70" y="280" width="300" height="190" fill={C.cream} />
        <path d="M40 290q170-60 360 0l-20-50H60Z" fill={C.dark} />
        <rect x="110" y="320" width="60" height="50" fill={C.glow} />
        <rect x="260" y="320" width="60" height="50" fill={C.glow} />
        <rect x="190" y="390" width="50" height="80" fill={C.wood} />
        {[90, 160, 230, 300, 370].map((x, i) => (
          <Lantern key={x} x={x} y={330} s={0.7} className={`cs-swing ${i % 2 ? "is-late" : ""}`} />
        ))}
        <Ground d="M0 470q400-14 836 0V560H0Z" />
      </g>,
      // Guishan Island off the coast, a boat bobbing.
      <g key="r">
        <Cloud x={160} y={170} />
        <Water y={400} />
        <path d="M380 400q40-80 120-70t110-50q30 30 20 70t140 50Z" fill={C.leaf} />
        <Boat x={240} y={450} />
      </g>,
    ],
  },
  iceland: {
    prep: [
      // Hallgrímskirkja's stepped columns.
      <g key="l">
        <Mountain x={420} y={420} w={360} h={190} />
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={`a${i}`} x={110 + i * 22} y={440 - (i + 1) * 46} width="22" height={(i + 1) * 46} fill={C.ice} />
          ))}
          <rect x="198" y="120" width="44" height="320" fill={C.ice} />
          <path d="M198 120l22-60 22 60Z" fill={C.ice} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={`b${i}`} x={242 + i * 22} y={440 - (4 - i) * 46} width="22" height={(4 - i) * 46} fill={C.ice} />
          ))}
        </g>
        <Ground d="M0 440q300-20 836 10V560H0Z" />
      </g>,
      // Skógafoss pouring off its cliff; a puffin on the rock.
      <g key="r">
        <path d="M120 470q10-140 40-230q20-60 70-80q80-10 150 4h90q90-14 170 0q60 20 80 80q20 90 30 226Z" fill={C.grass} />
        <path d="M380 164h90v300h-90Z" fill={C.ice} />
        <path d="M200 200q40-10 60 10M600 210q-30-12-60 6" fill="none" strokeOpacity=".5" />
        <g className="cs-fall" fill="none" stroke="#fff">
          <path d="M395 165V455" />
          <path d="M425 165V455" />
          <path d="M455 165V455" />
        </g>
        <Ground d="M0 460q420-40 836 0V560H0Z" />
        <g transform="translate(640 455)">
          <ellipse cx="0" cy="-24" rx="18" ry="24" fill="#3d4448" />
          <ellipse cx="4" cy="-20" rx="10" ry="16" fill={C.snow} />
          <circle cx="2" cy="-50" r="13" fill="#3d4448" />
          <path d="M12 -52l18 4-18 8Z" fill={C.orange} />
        </g>
      </g>,
    ],
    hotel: [
      // Turf houses with grass roofs.
      <g key="l">
        {[60, 190, 320].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 450V${370 - i * 6}l70-70 70 70V450Z`} fill={C.grass} />
            <path d={`M${x + 40} 450V${380 - i * 6}l30-30 30 30V450Z`} fill={C.snow} />
            <rect x={x + 60} y={410 - i * 6} width="20" height={40 + i * 6} fill={C.red} />
          </g>
        ))}
        <Ground d="M0 450q400-20 836 10V560H0Z" />
      </g>,
      // Kirkjufell under the northern lights.
      <g key="r">
        <Aurora x={120} y={180} w={640} />
        <path d="M250 430q60-220 150-250q80 40 160 250Z" fill={C.ice} />
        <path d="M368 232q22-40 32-52q30 20 46 56q-12 10-22 0q-10 12-22 2q-14 8-34-6Z" fill={C.snow} />
        <Water y={430} />
      </g>,
    ],
  },
  norway: {
    prep: [
      // A fjord between steep cliffs, a boat on the water.
      <g key="l">
        <path d="M0 120q100 40 160 260l40 70H0Z" fill={C.rock} />
        <path d="M836 160q-160 60-220 240l-30 50H836Z" fill={C.rock} />
        <path d="M60 170q40 20 60 60q-30-10-60 0Z" fill={C.snow} />
        <Water y={440} />
        <Boat x={380} y={480} s={1.1} sail={C.red} />
      </g>,
      // A stave church, roofs stacked and dragon-headed.
      <g key="r">
        <Pine x={200} y={460} s={1.1} />
        <g>
          <rect x="400" y="330" width="160" height="130" fill={C.wood} />
          <path d="M370 340l110-70 110 70Z" fill={C.dark} />
          <rect x="430" y="240" width="100" height="40" fill={C.wood} />
          <path d="M410 250l70-60 70 60Z" fill={C.dark} />
          <path d="M455 190l25-70 25 70Z" fill={C.dark} />
          <path d="M370 340q-20-30 6-40M590 340q20-30-6-40" fill="none" />
          <rect x="465" y="400" width="30" height="60" fill={C.dark} />
        </g>
        <Ground d="M0 460q420-30 836 0V560H0Z" />
      </g>,
    ],
    hotel: [
      // Red rorbu cabins on stilts over the water.
      <g key="l">
        <Mountain x={300} y={400} w={480} h={260} fill={C.rock} />
        <Water y={420} />
        {[80, 230, 380].map((x) => (
          <g key={x}>
            <path d={`M${x + 10} 470V420M${x + 110} 470V420`} fill="none" />
            <Gabled x={x} y={420} w={120} h={90} roof={C.dark} wall={C.red} windows={2} door={false} />
          </g>
        ))}
      </g>,
      // A Viking ship, striped sail up.
      <g key="r">
        <Water y={430} />
        <g className="cs-bob" style={{ transformOrigin: "420px 460px" }}>
          <path d="M220 430q200 60 400 0q20-40 40-70q-20 10-40 30H260q-20-20-40-30q20 30-0 70Z" fill={C.wood} />
          <path d="M420 400V180" fill="none" />
          <path d="M330 200h180v150H330Z" fill={C.snow} />
          <path d="M360 200v150M390 200v150M450 200v150M480 200v150" fill="none" stroke={C.red} strokeWidth="14" />
        </g>
      </g>,
    ],
  },
  finland: {
    prep: [
      // A reindeer among the pines.
      <g key="l">
        <Pine x={90} y={450} s={1.4} />
        <Pine x={210} y={450} s={1.1} />
        <g transform="translate(420 450)">
          <ellipse cx="0" cy="-90" rx="80" ry="40" fill={C.wood} />
          <path d="M-60-60v60M-30-60v60M40-60v60M64-60v60" fill="none" strokeWidth="9" />
          <path d="M70-110q30-30 60-20l10 20q-30 10-50 30Z" fill={C.wood} />
          <path d="M110-140q-10-40 20-60M110-140q-30-30-10-60M128-140q20-20 40-20M100-160h-20" fill="none" />
          <circle cx="140" cy="-110" r="5" fill={C.red} />
        </g>
        <Ground d="M0 450q400-30 836 0V560H0Z" />
      </g>,
      // A sauna cabin by a frozen lake, smoke rising.
      <g key="r">
        <Pine x={720} y={420} s={1.3} />
        <Gabled x={430} y={420} w={180} h={110} roof={C.dark} wall={C.wood} windows={1} snowy />
        <rect x="560" y="260" width="22" height="50" fill={C.dark} />
        <Smoke x={571} y={255} />
        <path d="M0 440q300-20 836 0V560H0Z" fill={C.ice} />
        <Ground d="M0 510q400-20 836 0V560H0Z" />
      </g>,
    ],
    hotel: [
      // Glass igloos under the aurora.
      <g key="l">
        <Aurora x={60} y={150} w={700} />
        {[120, 330, 540].map((x) => (
          <g key={x}>
            <path d={`M${x} 450a90 90 0 0 1 180 0Z`} fill={C.ice} />
            <path d={`M${x + 90} 360V450M${x + 30} 385l60 65M${x + 150} 385l-60 65`} fill="none" strokeOpacity=".6" />
            <circle cx={x + 90} cy={420} r="16" fill={C.glow} />
          </g>
        ))}
        <Ground d="M0 450q400-20 836 0V560H0Z" />
      </g>,
      // A log cabin, chimney smoking.
      <g key="r">
        <Pine x={120} y={440} s={1.2} />
        <g>
          <rect x="330" y="320" width="260" height="120" fill={C.wood} />
          <path d="M330 345h260M330 370h260M330 395h260M330 420h260" fill="none" strokeOpacity=".6" />
          <path d="M300 330l160-100 160 100Z" fill={C.snow} />
          <rect x="370" y="350" width="40" height="34" fill={C.glow} />
          <rect x="500" y="350" width="40" height="34" fill={C.glow} />
          <rect x="530" y="230" width="24" height="60" fill={C.dark} />
          <Smoke x={542} y={225} />
        </g>
        <Pine x={720} y={440} s={1.3} />
        <Ground d="M0 440q400-20 836 0V560H0Z" />
      </g>,
    ],
  },
  netherlands: {
    prep: [
      // A windmill turning over a tulip field.
      <g key="l">
        <path d="M180 430l30-200h80l30 200Z" fill={C.cream} />
        <path d="M200 240l50-50 50 50Z" fill={C.dark} />
        <g className="cs-spin" style={{ transformOrigin: "250px 230px" }}>
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a} 250 230)`}>
              <path d="M250 230V60" fill="none" />
              <rect x="252" y="70" width="34" height="150" fill={C.snow} />
            </g>
          ))}
        </g>
        <rect x="235" y="380" width="30" height="50" fill={C.wood} />
        <path d="M0 430h836V560H0Z" fill={C.grass} />
        <Tulips x={330} y={470} rows={3} />
      </g>,
      // A row of canal houses with stepped gables.
      <g key="r">
        {[
          [200, C.wood],
          [300, C.red],
          [400, C.cream],
          [500, C.dark],
          [600, C.rose],
        ].map(([x, fill], i) => (
          <g key={x}>
            <path
              d={`M${x} 440V${260 - (i % 2) * 30}h20v-20h20v-20h20v20h20v20h20V440Z`}
              fill={fill}
            />
            <rect x={x + 20} y={300} width="20" height="26" fill={C.snow} />
            <rect x={x + 60} y={300} width="20" height="26" fill={C.snow} />
            <rect x={x + 20} y={360} width="20" height="26" fill={C.snow} />
            <rect x={x + 60} y={360} width="20" height="26" fill={C.snow} />
          </g>
        ))}
        <Water y={440} />
      </g>,
    ],
    hotel: [
      // Canal houses over the water, a boat drifting by.
      <g key="l">
        {[60, 160, 260, 360].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 420V${240 + (i % 2) * 20}l50-50 50 50V420Z`} fill={[C.red, C.cream, C.wood, C.rose][i]} />
            <rect x={x + 20} y={290} width="22" height="30" fill={C.glow} />
            <rect x={x + 58} y={290} width="22" height="30" fill={C.glow} />
            <rect x={x + 20} y={350} width="22" height="30" fill={C.glow} />
            <rect x={x + 58} y={350} width="22" height="30" fill={C.glow} />
          </g>
        ))}
        <Water y={420} />
        <g className="cs-bob" style={{ transformOrigin: "300px 470px" }}>
          <path d="M220 460h180l-20 20H240Z" fill={C.wood} />
          <rect x="250" y="440" width="100" height="20" fill={C.snow} />
        </g>
      </g>,
      // Tulip rows and a bicycle.
      <g key="r">
        <path d="M0 400h836V560H0Z" fill={C.grass} />
        <Tulips x={60} y={450} rows={3} />
        <g transform="translate(560 470)" fill="none">
          <circle cx="0" cy="0" r="34" />
          <circle cx="110" cy="0" r="34" />
          <path d="M0 0l40-60h50l20 60M40-60l15 60h-55M90-60l-8-16h-14M40-60l-6-14h-14" />
        </g>
      </g>,
    ],
  },
  france: {
    prep: [
      // The Eiffel Tower.
      <g key="l">
        <Cloud x={420} y={190} />
        <g>
          <path d="M150 460q50-110 70-200l20-130h20l20 130q20 90 70 200h-50q-30-60-50-60t-50 60Z" fill={C.wood} />
          <path d="M190 300h120M215 200h70" fill="none" />
          <path d="M250 130V70" fill="none" />
        </g>
        <Ground d="M0 460q400-20 836 0V560H0Z" />
      </g>,
      // Mont Blanc above an Alpine chalet.
      <g key="r">
        <Mountain x={260} y={420} w={520} h={300} />
        <Pine x={180} y={460} s={1.1} />
        <Gabled x={470} y={460} w={170} h={100} roof={C.dark} wall={C.wood} windows={2} snowy />
        <Ground d="M0 460q420-30 836 0V560H0Z" />
      </g>,
    ],
    hotel: [
      // A Paris building over a café awning.
      <g key="l">
        <rect x="80" y="160" width="320" height="300" fill={C.cream} />
        <path d="M70 170h340l-30-50H100Z" fill={C.ice} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect key={`${r}${c}`} x={110 + c * 72} y={190 + r * 66} width="36" height="44" fill={C.glow} />
          )),
        )}
        <path d="M80 390h320v26q-20 14-40 0q-20 14-40 0q-20 14-40 0q-20 14-40 0q-20 14-40 0q-20 14-40 0q-20 14-40 0q-20 14-40 0Z" fill={C.red} />
        <Ground d="M0 460q400-14 836 0V560H0Z" />
      </g>,
      // A chalet village under the Alps.
      <g key="r">
        <Mountain x={120} y={400} w={360} h={220} />
        <Mountain x={400} y={400} w={420} h={260} />
        <Gabled x={240} y={460} w={130} h={80} roof={C.dark} wall={C.wood} windows={1} snowy />
        <Gabled x={470} y={460} w={150} h={95} roof={C.dark} wall={C.wood} windows={2} snowy />
        <Pine x={700} y={460} s={1} />
        <Ground d="M0 460q420-20 836 0V560H0Z" />
      </g>,
    ],
  },
  switzerland: {
    prep: [
      // The Matterhorn.
      <g key="l">
        <path d="M160 440l130-200 60-130q30 40 30 100l130 230Z" fill={C.ice} />
        <path d="M290 240l60-130q30 40 30 100q-30-10-50 30Z" fill={C.snow} />
        <Pine x={90} y={460} s={1} />
        <Ground d="M0 450q420-30 836 0V560H0Z" />
      </g>,
      // A red train crossing a stone viaduct.
      <g key="r">
        <Mountain x={420} y={320} w={400} h={200} />
        <path d="M60 320h700v140H60Z" fill={C.rock} />
        {[100, 240, 380, 520, 660].map((x) => (
          <path key={x} d={`M${x} 460v-60a50 50 0 0 1 100 0v60Z`} fill={C.snow} />
        ))}
        <g className="cs-train">
          <rect x="0" y="280" width="90" height="40" rx="8" fill={C.red} />
          <rect x="96" y="280" width="90" height="40" rx="8" fill={C.red} />
          <rect x="10" y="288" width="70" height="14" fill={C.glow} />
          <rect x="106" y="288" width="70" height="14" fill={C.glow} />
        </g>
        <Ground d="M0 470q420-20 836 0V560H0Z" />
      </g>,
    ],
    hotel: [
      // A chalet with flower boxes.
      <g key="l">
        <rect x="100" y="270" width="280" height="190" fill={C.wood} />
        <path d="M60 290l180-120 180 120Z" fill={C.snow} />
        {[140, 290].map((x) => (
          <g key={x}>
            <rect x={x} y="310" width="50" height="50" fill={C.glow} />
            <path d={`M${x - 6} 360h62v14h-62Z`} fill={C.red} />
          </g>
        ))}
        <path d="M100 390h280" fill="none" />
        <rect x="215" y="400" width="50" height="60" fill={C.dark} />
        <Ground d="M0 460q400-20 836 0V560H0Z" />
      </g>,
      // A cow with a bell on an Alpine meadow.
      <g key="r">
        <Mountain x={300} y={380} w={500} h={240} />
        <path d="M0 380q420-40 836 0V560H0Z" fill={C.grass} />
        <g transform="translate(360 470)">
          <rect x="-90" y="-110" width="180" height="80" rx="30" fill={C.snow} />
          <path d="M-40-110q20 30-10 70M30-110q-20 30 20 60" fill="none" strokeWidth="14" stroke={C.dark} />
          <path d="M-70-30v30M-40-30v30M50-30v30M76-30v30" fill="none" strokeWidth="9" />
          <rect x="80" y="-130" width="56" height="50" rx="20" fill={C.snow} />
          <path d="M88-128l-8-16M128-128l8-16" fill="none" />
          <g className="cs-swing" style={{ transformOrigin: "108px -80px" }}>
            <path d="M98-80h20l4 18h-28Z" fill={C.yellow} />
          </g>
        </g>
      </g>,
    ],
  },
  newZealand: {
    prep: [
      // A small stone church by a lake under the Southern Alps.
      <g key="l">
        <Mountain x={240} y={360} w={340} h={200} />
        <Mountain x={480} y={360} w={360} h={170} />
        <Water y={360} />
        <path d="M0 420q120-30 240 0V560H0Z" fill={C.grass} />
        <Gabled x={60} y={430} w={110} h={70} roof={C.dark} wall={C.rock} windows={1} door={false} />
        <path d="M115 330v-34M105 312h20" fill="none" />
      </g>,
      // A kiwi under a silver fern.
      <g key="r">
        <g className="cs-sway" style={{ transformOrigin: "660px 460px" }}>
          <path d="M660 460q-40-160-160-250" fill="none" stroke={C.leaf} strokeWidth="6" />
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 9;
            const x = 660 - 160 * t;
            const y = 460 - 250 * t + 40 * t * t;
            return <path key={i} d={`M${x} ${y}l-${50 - i * 4} -${20 - i}M${x} ${y}l${10} -${50 - i * 4}`} fill="none" stroke={C.leaf} strokeWidth="5" />;
          })}
        </g>
        <g transform="translate(380 460)">
          <ellipse cx="0" cy="-50" rx="70" ry="50" fill={C.wood} />
          <circle cx="62" cy="-74" r="22" fill={C.wood} />
          <path d="M80-76q50 20 70 50" fill="none" strokeWidth="5" />
          <path d="M-20 0v-12M20 0v-12" fill="none" strokeWidth="6" />
          <circle cx="68" cy="-80" r="3" fill={INK} />
        </g>
        <path d="M0 460q420-30 836 0V560H0Z" fill={C.grass} />
      </g>,
    ],
    hotel: [
      // A hobbit-hole door in a grassy hill.
      <g key="l">
        <path d="M0 470q60-260 330-260t330 260Z" fill={C.grass} />
        <circle cx="330" cy="400" r="70" fill={C.wood} />
        <circle cx="330" cy="400" r="70" fill="none" />
        <path d="M330 330v140M280 350v100M380 350v100" fill="none" strokeOpacity=".5" />
        <circle cx="340" cy="405" r="7" fill={C.yellow} />
        <circle cx="160" cy="380" r="26" fill={C.glow} />
        <circle cx="500" cy="380" r="26" fill={C.glow} />
        <path d="M0 470h836V560H0Z" fill={C.grass} />
      </g>,
      // Sheep on rolling hills.
      <g key="r">
        <path d="M0 360q200-80 420-20t416-40V560H0Z" fill={C.grass} />
        {[
          [220, 430],
          [420, 470],
          [620, 420],
        ].map(([x, y], i) => (
          <g key={x} className="cs-graze" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-i * 1.3}s` }}>
            <path d={`M${x - 40} ${y - 30}q-10-30 20-30q10-20 30-6q24-10 30 14q24 10 6 30q0 22-26 20H${x - 20}q-26 0-20-28Z`} fill={C.snow} />
            <ellipse cx={x + 44} cy={y - 30} rx="14" ry="11" fill={INK} />
            <path d={`M${x - 20} ${y - 6}v14M${x + 14} ${y - 6}v14`} fill="none" strokeWidth="6" />
          </g>
        ))}
      </g>,
    ],
  },
  canada: {
    prep: [
      // The Rockies over a lake, a red canoe on it.
      <g key="l">
        <Mountain x={40} y={380} w={360} h={250} />
        <Mountain x={300} y={380} w={420} h={290} />
        <Pine x={720} y={420} s={1.2} />
        <Water y={400} />
        <g className="cs-bob" style={{ transformOrigin: "360px 460px" }}>
          <path d="M280 450q80 30 160 0q-80 10-160 0Z" fill={C.red} />
          <path d="M360 452l30-50" fill="none" />
        </g>
      </g>,
      // A moose in the snowy pines.
      <g key="r">
        <Pine x={140} y={450} s={1.3} />
        <Pine x={700} y={450} s={1.5} />
        <g transform="translate(420 450)">
          <ellipse cx="0" cy="-100" rx="90" ry="50" fill={C.dark} />
          <path d="M-60-60v60M-30-60v60M40-60v60M66-60v60" fill="none" strokeWidth="10" />
          <path d="M70-130q40-10 60 20l20 40q-20 14-40 0l-30-30Z" fill={C.dark} />
          <path d="M90-140q-20-50 10-60q10 20 20 10q10 20 20 4q10 30-30 50Z" fill={C.wood} />
        </g>
        <Ground d="M0 450q420-30 836 0V560H0Z" />
      </g>,
    ],
    hotel: [
      // A log cabin, chimney smoking.
      <g key="l">
        <Pine x={70} y={440} s={1.2} />
        <rect x="200" y="320" width="270" height="120" fill={C.wood} />
        <path d="M200 345h270M200 370h270M200 395h270M200 420h270" fill="none" strokeOpacity=".6" />
        <path d="M170 330l165-100 165 100Z" fill={C.snow} />
        <rect x="240" y="350" width="44" height="36" fill={C.glow} />
        <rect x="380" y="350" width="44" height="36" fill={C.glow} />
        <rect x="410" y="232" width="24" height="60" fill={C.rock} />
        <Smoke x={422} y={226} />
        <Ground d="M0 440q400-20 836 0V560H0Z" />
      </g>,
      // A maple tree dropping red leaves.
      <g key="r">
        <path d="M500 460V300M500 360l-60-50M500 340l60-60" fill="none" strokeWidth="10" />
        <circle cx="500" cy="230" r="120" fill={C.red} />
        <circle cx="400" cy="290" r="70" fill={C.orange} />
        <circle cx="610" cy="280" r="76" fill={C.red} />
        {[
          [380, 0],
          [520, 2.2],
          [640, 4.1],
          [460, 5.6],
        ].map(([x, delay]) => (
          <path
            key={x}
            className="cs-leaf"
            style={{ animationDelay: `${-delay}s` }}
            d={`M${x} 330l6-12 4 8 8-4-2 10 8 2-10 6 2 8-8-4-6 8-2-10-10 0 8-8-6-6 10 0Z`}
            fill={C.red}
          />
        ))}
        <Ground d="M0 460q420-20 836 0V560H0Z" />
      </g>,
    ],
  },
};

// Countries without snow get no snowfall.
const NO_SNOW = new Set(["taiwan", "netherlands", "newZealand"]);

function Drawing({ children }) {
  return (
    <svg className="snow-scene-art country-scene-art" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* Stretched a little past the box, so ground and water run off the
          edges instead of ending in a drawn border. */}
      <g transform={`translate(-24 0) scale(${(W + 48) / W} ${(H + 40) / H})`}>
        <g filter="url(#country-scene-pencil)" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
          {children}
        </g>
      </g>
    </svg>
  );
}

function CountryScene({ country, page }) {
  const pair = SCENES[country]?.[page];
  if (!pair) return null;
  return (
    <SnowScene snow={!NO_SNOW.has(country)}>
      {/* The pencil look: lines wobble a little, and fills are streaky. */}
      <svg className="country-scene-defs" width="0" height="0" aria-hidden="true">
        <filter id="country-scene-pencil" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="3.5" result="wobble" />
          <feTurbulence type="fractalNoise" baseFrequency="0.5 2.2" numOctaves="1" seed="8" result="streak" />
          <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.45" result="streakAlpha" />
          <feComposite in="wobble" in2="streakAlpha" operator="in" />
        </filter>
      </svg>
      <div className="snow-scene-piece is-bottom-left" style={{ "--piece-w": W }}>
        <Drawing>{pair[0]}</Drawing>
      </div>
      <div className="snow-scene-piece is-bottom-right" style={{ "--piece-w": W }}>
        <Drawing>{pair[1]}</Drawing>
      </div>
    </SnowScene>
  );
}

export default CountryScene;
