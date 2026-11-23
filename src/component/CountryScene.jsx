import SnowScene from "./SnowScene";
import "../assets/pages/_country-scene.scss";
import swissTrain from "../assets/country-bg/switzerland-train.webp";
import dutchSail from "../assets/country-bg/netherlands-sail.webp";
import mapleLeaves from "../assets/country-bg/canada-maple.webp";
import mapleCells from "../assets/country-bg/canada-maple.json";
import icelandRiver from "../assets/country-bg/iceland-prep-water.png";

// The picture behind 行前準備 and 機票住宿 for every country: one hand-drawn
// picture per country and page across the bottom of the screen. Files are src/assets/country-bg/<country>-<page>.webp.
const PICTURES = import.meta.glob("../assets/country-bg/*-{prep,hotel}.webp", {
  eager: true,
  import: "default",
});

// It moves a little, from an SVG laid exactly over the picture, in the
// picture's own pixels: water flows (the picture's own water redrawn through
// a drifting ripple, see Sea), the northern lights shimmer, a waterfall
// streams, chimneys smoke, and lanterns, leaves or petals drift across.
// sea: the water's outline or matte; aurora and fall: [x0, y0, x1, y1]; smoke: [x, y] of each
// chimney top; drift: what drifts, where each one starts, and how big it is.
const SCENES = {
  japan: {
    size: [1200, 675],
    prep: { sea: { outline: [[0, 641], [120, 639], [260, 633], [330, 629], [640, 629], [760, 633], [980, 635], [1200, 641], [1200, 675], [0, 675]], bands: [[629, 648, 0.5], [648, 675, 0.8]] }, drift: { kind: "petal", from: [[200, 420], [160, 455], [250, 440], [130, 400], [290, 470]] } },
    // Hot-spring steam, the pool rippling, and the red lantern swaying.
    hotel: { sea: { outline: [[105, 592], [140, 590], [150, 583], [285, 584], [300, 591], [370, 591], [382, 597], [380, 622], [360, 628], [160, 628], [130, 620], [105, 612]], bands: [[583, 628, 0.55]], seconds: 40 }, steam: [[150, 600], [190, 596], [232, 602], [275, 598], [320, 604]], sway: { box: [884, 490, 918, 536], pivot: [901, 491] } },
  },
  taiwan: {
    size: [1200, 675],
    // The sea flowing (finer far out), the fishing boat rocking, and sky
    // lanterns rising from the city along the painted ones, which glow.
    prep: {
      sea: {
        outline: [[650, 594], [1200, 594], [1200, 612], [1150, 616], [1140, 630], [1070, 640], [1040, 655], [965, 660], [960, 675], [600, 675], [628, 655], [628, 630], [700, 622], [700, 610]],
        bands: [[594, 622, 0.6], [622, 675, 1]],
      },
      bob: [874, 601, 918, 619],
      skyLanterns: { from: [112, 540], to: [300, 360], size: 19, count: 4, seconds: 18, glow: [[113, 493, 11], [145, 463, 8], [175, 437, 6], [205, 415, 4]] },
    },
    // The teahouse's red lanterns sway and glow, brightening and dimming.
    hotel: {
      lanterns: [
        { box: [139, 220, 177, 262], pivot: [158, 220] },
        { box: [186, 398, 225, 440], pivot: [206, 398] },
        { box: [248, 533, 272, 558], pivot: [260, 533] },
      ],
    },
  },
  iceland: {
    // The river below the puffin runs between rocks: only its water flows
    // (a matte of the water cut from the picture), gently, so rocks stay put.
    prep: { size: [1200, 788], head: { box: [130, 630, 197, 680], patch: [152, 634, 197, 677], pivot: [150, 674], sky: "#fafcfc" }, fall: [648, 534, 836, 740], sea: { matte: { src: icelandRiver, at: [60, 745], size: [825, 43] }, bands: [[745, 788, 0.4]], seconds: 22 } },
    // The lake only: below the far shore, around the spit and the grassy bank.
    hotel: { aurora: [60, 135, 470, 250], sea: { outline: [[205, 309.5], [503, 308.5], [503, 330], [256, 330], [243, 319], [354, 319], [352, 315], [212, 315]], bands: [[308, 316, 0.45], [316, 330, 0.7]], seconds: 40 } },
  },
  norway: {
    // The fjord only (not its green shore or the trees), with the ferry rocking.
    prep: {
      sea: { outline: [[0, 292], [60, 290], [95, 284], [200, 279], [330, 279], [330, 290], [302, 297], [290, 312], [276, 330], [0, 330]], bands: [[279, 296, 0.5], [296, 330, 0.8]], seconds: 40 },
      bob: [143, 288, 180, 312],
    },
    // The water only: below the stilts and the rocky shore, and around the
    // Viking ship, which stays put.
    hotel: { sea: { outline: [[245, 290], [357, 290], [359, 316], [372, 324], [478, 324], [489, 312], [492, 290], [503, 290], [503, 330], [160, 330], [160, 303], [245, 303]], bands: [[290, 305, 0.5], [305, 330, 0.75]], seconds: 40 } },
  },
  finland: {
    // The lake only: not the snowy shrubs in front, the rocks or the cabin's deck.
    prep: { sea: { outline: [[176, 280], [372, 280], [372, 289], [366, 297], [338, 300], [335, 312], [345, 330], [228, 330], [226, 296], [176, 292]], bands: [[280, 296, 0.5], [296, 330, 0.75]], seconds: 44 }, smoke: [[434, 206]] },
    hotel: { aurora: [50, 110, 440, 210], smoke: [[410, 222]] },
  },
  netherlands: {
    // The hub sits on the front of the cap; the picture's leftover sail is painted out.
    prep: { sails: { src: dutchSail, at: [15, 130], size: [70, 63], hub: [74, 193], tips: [[18, 142], [114, 145], [134, 244], [32, 258]], seconds: 14 }, sea: { outline: [[215, 289], [300, 293], [400, 298], [503, 303], [503, 330], [235, 330], [230, 302], [215, 296]], bands: [[289, 305, 0.5], [305, 330, 0.75]], seconds: 40 }, drift: { kind: "petal", from: [[470, 170], [420, 190], [500, 210], [380, 180]] } },
    // The canal only: below the quay wall and the moored boat, left of the tulips.
    hotel: { sea: { outline: [[0, 304], [108, 302], [113, 285], [150, 280], [198, 278], [226, 278], [245, 271], [330, 269], [330, 281], [300, 285], [276, 291], [256, 303], [241, 316], [233, 330], [0, 330]], bands: [[269, 295, 0.5], [295, 330, 0.75]], seconds: 40 }, drift: { kind: "petal", from: [[480, 130], [440, 150], [500, 170], [400, 160]] } },
  },
  france: {
    prep: {},
    hotel: { smoke: [[93, 106]] },
  },
  switzerland: {
    // The train is cut from the picture (the picture has it painted out).
    prep: { train: { src: swissTrain, at: [264, 230], size: [172, 49], from: 250, to: -240, slope: -0.11, hideLeft: [190, 215], seconds: 20 } },
    // The cow grazing: its head lifts a little to chew, then dips again.
    // Only the head and neck are cut (not the front leg just right of them).
    hotel: { smoke: [[20, 122]], graze: { box: [361, 279, 405, 323], shape: [[362, 285], [378, 278], [397, 278], [399, 290], [397, 305], [391, 316], [382, 322], [370, 320], [363, 302]], pivot: [397, 283] } },
  },
  newZealand: {
    // The lake only: not the kiwi, the fern, the rocks along the shore, or the
    // little sailboat by the far shore (the notch at x 250-262).
    prep: { sea: { outline: [[165, 256], [247, 256], [251, 260], [261, 260], [265, 256], [452, 256], [442, 262], [430, 272], [410, 282], [386, 284], [381, 276], [368, 269], [345, 267], [332, 274], [329, 284], [300, 284], [265, 279], [240, 275], [200, 272], [170, 266]], bands: [[256, 268, 0.45], [268, 285, 0.7]], seconds: 44 } },
    hotel: { smoke: [[34, 156]] },
  },
  canada: {
    prep: { size: [1200, 788], sea: { outline: [[322, 605], [1200, 605], [1200, 650], [1150, 656], [1120, 700], [1112, 738], [980, 742], [980, 726], [1100, 722], [1110, 690], [1105, 667], [860, 671], [854, 690], [860, 723], [980, 726], [980, 742], [760, 742], [700, 738], [560, 729], [470, 723], [330, 719], [318, 690], [320, 640]], bands: [[605, 640, 0.55], [640, 742, 0.85]] }, bob: [852, 668, 1110, 724], nod: { box: [188, 508, 344, 638], pivot: [250, 600] } },
    // The picture's maple is bare; its leaves sit on top in patches that drop.
    hotel: { smoke: [[423, 174]], maple: { src: mapleLeaves, ...mapleCells, ground: 292, seconds: 20 } },
  },
};
const DEFAULT_SIZE = [503, 330];

const EASE = ".45 0 .55 1;.45 0 .55 1";

// Sizes below are for a picture 503px wide; `k` scales them to the picture's
// own width so a larger picture moves just as much on screen.
const BASE_WIDTH = 503;

// Open sea: the picture's water redrawn through ripples that flow steadily
// one way (a seamless strip of noise sliding along) and lift a little, rather
// than sloshing back and forth. Each band ([top, bottom, size]) has its own
// ripple size, so the swell is finer and gentler towards the horizon.
// The water is given either as an outline ([[x, y], ...]) or, for water
// strewn with rocks, as a matte: a picture of just the water, white on black
// ({ src, at: [x, y], size: [w, h] }), so the rocks stay put.
function Sea({ id, src, w, h, k, outline, matte, bands, seconds = 34 }) {
  const xs = outline ? outline.map((p) => p[0]) : [matte.at[0], matte.at[0] + matte.size[0]];
  const x0 = Math.min(...xs) - 20 * k;
  const x1 = Math.max(...xs) + 20 * k;
  const tile = 260 * k;
  const water = outline ? { clipPath: `url(#${id}-sea)` } : { mask: `url(#${id}-sea)` };
  return (
    <g>
      <defs>
        {outline ? (
          <clipPath id={`${id}-sea`}>
            <polygon points={outline.map((p) => p.join(",")).join(" ")} />
          </clipPath>
        ) : (
          <mask id={`${id}-sea`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <image href={matte.src} x={matte.at[0]} y={matte.at[1]} width={matte.size[0]} height={matte.size[1]} />
          </mask>
        )}
        {bands.map(([y0, y1, size], i) => {
          // Bands overlap by `feather`, the lower one fading in over the
          // upper, so no straight seam shows where they meet.
          const feather = 4 * k;
          const last = i === bands.length - 1;
          const b0 = i === 0 ? y0 : y0 - feather;
          const b1 = last ? y1 : y1 + feather;
          const top = b0 - 10 * k;
          const height = b1 - b0 + 20 * k;
          return (
            <g key={i}>
              <clipPath id={`${id}-sea-${i}`}>
                <rect x={x0} y={b0} width={x1 - x0} height={b1 - b0} />
              </clipPath>
              {i > 0 && (
                <>
                  <linearGradient id={`${id}-sea-${i}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1={b0} x2="0" y2={y0 + feather}>
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#fff" stopOpacity="1" />
                  </linearGradient>
                  <mask id={`${id}-sea-${i}-in`} maskUnits="userSpaceOnUse" x={x0} y={b0} width={x1 - x0} height={b1 - b0}>
                    <rect x={x0} y={b0} width={x1 - x0} height={b1 - b0} fill={`url(#${id}-sea-${i}-fade)`} />
                  </mask>
                </>
              )}
              <filter id={`${id}-sea-${i}-flow`} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse"
                x={x0 - tile} y={top} width={x1 - x0 + tile} height={height}>
                <feTurbulence x={x0} y={top} width={tile} height={height} type="fractalNoise" stitchTiles="stitch"
                  baseFrequency={`${0.011 / (k * size)} ${0.16 / (k * size)}`} numOctaves="2" seed={7 + i} result="strip" />
                <feTile in="strip" x={x0 - tile} y={top} width={x1 - x0 + tile} height={height} result="sea" />
                <feOffset in="sea" x={x0} y={top} width={x1 - x0} height={height} result="flow">
                  <animate attributeName="dx" dur={`${seconds / size}s`} repeatCount="indefinite" values={`0;${tile}`} />
                  <animate attributeName="dy" dur="5s" repeatCount="indefinite" values={`0;${4 * k * size};0`}
                    calcMode="spline" keyTimes="0;.5;1" keySplines={EASE} />
                </feOffset>
                <feDisplacementMap in="SourceGraphic" in2="flow" scale={5 * k * size} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </g>
          );
        })}
      </defs>
      <g {...water}>
        {bands.map((_, i) => (
          <g key={i} clipPath={`url(#${id}-sea-${i})`} mask={i > 0 ? `url(#${id}-sea-${i}-in)` : undefined}>
            <image href={src} width={w} height={h} filter={`url(#${id}-sea-${i}-flow)`} />
          </g>
        ))}
      </g>
    </g>
  );
}

// A sky lantern's paper: round shoulders, tapering to the open, lit bottom.
const LANTERN = "M-9-6C-9-10.8-4.5-12.6 0-12.6C4.5-12.6 9-10.8 9-6L6.6 8.6Q0 10.6-6.6 8.6Z";

// Sky lanterns: paper lanterns lit from below, rising from the city along
// the painted ones, swaying, and growing small with distance. The painted
// lanterns (glow: [x, y, r]) flicker with the same warm light.
function SkyLanterns({ id, from: [fx, fy], to: [tx, ty], size, count, seconds, glow }) {
  const s = size / 20;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1e2" />
          <stop offset=".55" stopColor="#f9dcae" />
          <stop offset="1" stopColor="#f3a457" />
        </linearGradient>
        <filter id={`${id}-pencil`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation=".35" />
        </filter>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#ffd38d" stopOpacity=".75" />
          <stop offset=".45" stopColor="#ffbf75" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffbf75" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow.map(([x, y, r], i) => (
        <circle key={i} className="cs-flicker" cx={x} cy={y + r * 0.35} r={r * 1.9} fill={`url(#${id}-halo)`}
          style={{ animationDelay: `${-i * 0.7}s` }} />
      ))}
      {Array.from({ length: count }, (_, i) => {
        const lean = ((i * 37) % 5 - 2) * 14 * s;
        const begin = `${(-i * seconds) / count}s`;
        const dur = `${seconds}s`;
        return (
          <g key={i} opacity="0">
            <animate attributeName="opacity" dur={dur} begin={begin} repeatCount="indefinite"
              values="0;1;1;0" keyTimes="0;.1;.75;1" />
            <animateTransform attributeName="transform" type="translate" dur={dur} begin={begin} repeatCount="indefinite"
              values={`${fx} ${fy};${tx + lean} ${ty}`} calcMode="spline" keyTimes="0;1" keySplines=".3 0 .7 1" />
            <g>
              <animateTransform attributeName="transform" type="scale" dur={dur} begin={begin} repeatCount="indefinite"
                values={`${s};${s * 0.22}`} calcMode="spline" keyTimes="0;1" keySplines=".2 0 .6 1" />
              <g className="cs-lantern-sway" style={{ animationDelay: `${-i * 1.3}s` }}>
                <circle className="cs-flicker" cy="4" r="18" fill={`url(#${id}-halo)`} style={{ animationDelay: `${-i * 0.9}s` }} />
                <g filter={`url(#${id}-pencil)`}>
                  <path d={LANTERN} fill={`url(#${id}-paper)`} stroke="#e3b48a" strokeWidth=".45" />
                  {/* the shaded right-hand panels, as in the painted ones */}
                  <path d="M2.5-12.4C6-12 9-10.2 9-6L6.6 8.6Q4.5 9.6 2.2 9.9Z" fill="#ee9c74" opacity=".28" />
                  <path d="M-3.4-12.2L-2.4 9.8M2.5-12.4L2.2 9.9" stroke="#e8bd95" strokeWidth=".35" opacity=".8" />
                  <ellipse cy="9.3" rx="6.4" ry="1.3" fill="#f2a160" opacity=".9" />
                </g>
                <ellipse className="cs-flicker" cy="8.5" rx="1.5" ry="2" fill="#fff3c2" />
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}

// Hanging lanterns lit from inside: each sways a little about its hook and
// its light swells and dims, warming the red paper and the air around it.
function Lanterns({ id, src, w, h, items }) {
  return (
    <g>
      <defs>
        <filter id={`${id}-lantern-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <radialGradient id={`${id}-lantern-core`}>
          <stop offset="0" stopColor="#fff4c9" stopOpacity=".95" />
          <stop offset=".5" stopColor="#ffc27a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff8a5c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-lantern-halo`}>
          <stop offset="0" stopColor="#ffb07a" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffb07a" stopOpacity="0" />
        </radialGradient>
        {items.map(({ box: [x0, y0, x1, y1] }, i) => (
          <mask key={i} id={`${id}-lantern-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={(x1 - x0) / 3} fill="#fff" filter={`url(#${id}-lantern-soft)`} />
          </mask>
        ))}
      </defs>
      {items.map(({ box: [x0, y0, x1, y1], pivot: [px, py] }, i) => {
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2 + (y1 - y0) * 0.04;
        const r = (x1 - x0) / 2;
        const delay = { animationDelay: `${-i * 1.4}s` };
        return (
          <g key={i} className="cs-sway" style={{ transformBox: "view-box", transformOrigin: `${px}px ${py}px`, animationDelay: `${-i * 1.1}s` }}>
            <circle className="cs-glow" cx={cx} cy={cy} r={r * 2.3} fill={`url(#${id}-lantern-halo)`} style={delay} />
            <image href={src} width={w} height={h} mask={`url(#${id}-lantern-${i})`} />
            <ellipse className="cs-glow" cx={cx} cy={cy} rx={r * 0.8} ry={r * 0.75} fill={`url(#${id}-lantern-core)`}
              style={{ ...delay, mixBlendMode: "screen" }} />
          </g>
        );
      })}
    </g>
  );
}

// The northern lights: soft green and violet bands laid along the
// picture's own aurora, brightening and fading. `box` is where it runs, from
// its low left end up to its high right end.
function Aurora({ id, k, box: [x0, y0, x1, y1] }) {
  const w = x1 - x0;
  const h = y1 - y0;
  const band = (dy) => `M${x0} ${y1 - h * 0.1 + dy}C${x0 + w * 0.3} ${y1 - h * 0.6 + dy} ${x0 + w * 0.55} ${y0 + h * 0.55 + dy} ${x1} ${y0 + h * 0.15 + dy}`;
  return (
    <g>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={7 * k} />
        </filter>
      </defs>
      <g filter={`url(#${id}-soft)`} fill="none" strokeLinecap="round">
        <path className="cs-aurora" d={band(0)} stroke="#8fe0b4" strokeWidth={22 * k} />
        <path className="cs-aurora is-late" d={band(16 * k)} stroke="#c1a9e6" strokeWidth={13 * k} />
      </g>
    </g>
  );
}

// A waterfall streaming down: soft white streaks run down the picture's own
// falling water, fading in at the lip and out into the mist, which swells
// and settles at the foot. `box` is the falling water, lip to foot.
function Fall({ id, k, box: [x0, y0, x1, y1] }) {
  const width = x1 - x0;
  const count = Math.max(6, Math.round(width / (9 * k)));
  const dash = 14 * k;
  const gap = 22 * k;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".15" stopColor="#fff" stopOpacity="1" />
          <stop offset=".8" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-fall`} maskUnits="userSpaceOnUse" x={x0} y={y0} width={width} height={y1 - y0}>
          <rect x={x0} y={y0} width={width} height={y1 - y0} fill={`url(#${id}-fade)`} />
        </mask>
        <filter id={`${id}-streak`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation={0.7 * k} />
        </filter>
        <filter id={`${id}-mist`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation={7 * k} />
        </filter>
      </defs>
      <g mask={`url(#${id}-fall)`} filter={`url(#${id}-streak)`} stroke="#fff" strokeLinecap="round">
        {Array.from({ length: count }, (_, i) => {
          const x = x0 + ((i + 0.5) * width) / count + (((i * 37) % 7) - 3) * 0.5 * k;
          return (
            <line key={i} x1={x} y1={y0} x2={x} y2={y1} strokeWidth={(1.3 + ((i * 13) % 5) * 0.2) * k}
              strokeOpacity=".75" strokeDasharray={`${dash} ${gap}`}>
              <animate attributeName="stroke-dashoffset" values={`${-((i * 11) % 30) * k};${-((i * 11) % 30) * k - dash - gap}`}
                dur={`${0.6 + ((i * 7) % 5) * 0.08}s`} repeatCount="indefinite" />
            </line>
          );
        })}
      </g>
      <g filter={`url(#${id}-mist)`} fill="#fff">
        <ellipse className="cs-mist" cx={x0 + width / 2} cy={y1} rx={width * 0.55} ry={16 * k} />
        <ellipse className="cs-mist is-late" cx={x0 + width * 0.4} cy={y1 - 6 * k} rx={width * 0.35} ry={12 * k} />
      </g>
    </g>
  );
}

// An animal's head turning: the picture's own head, cut out with soft edges
// and tilted about its neck, over a patch of the sky behind it (beak and face)
// so no second head shows. head: { box: [x0, y0, x1, y1] around the head,
// patch: the same for the sky patch, pivot: [x, y] at the neck, sky colour }.
function Head({ id, src, w, h, box: [x0, y0, x1, y1], patch: [p0, q0, p1, q1], pivot: [px, py], sky }) {
  return (
    <g>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <mask id={`${id}-head`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2}
            fill="#fff" filter={`url(#${id}-soft)`} />
        </mask>
      </defs>
      <ellipse cx={(p0 + p1) / 2} cy={(q0 + q1) / 2} rx={(p1 - p0) / 2} ry={(q1 - q0) / 2}
        fill={sky} filter={`url(#${id}-soft)`} />
      <g className="cs-head" style={{ transformBox: "view-box", transformOrigin: `${px}px ${py}px` }}>
        <image href={src} width={w} height={h} mask={`url(#${id}-head)`} />
      </g>
    </g>
  );
}

// A train driving along a bridge: its cut-out runs in from past the right
// edge, crosses, and fades out behind the hill at hideLeft, then waits a
// moment before the next one. slope: how far up it climbs per step left.
function Train({ id, w, h, src, at: [x, y], size: [tw, th], from, to, slope, hideLeft: [h0, h1], seconds }) {
  const step = (dx) => `${dx} ${dx * slope}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-train-fade`} gradientUnits="userSpaceOnUse" x1={h0} y1="0" x2={h1} y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-train`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x="0" y="0" width={w} height={h} fill={`url(#${id}-train-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-train)`}>
        <image href={src} x={x} y={y} width={tw} height={th}>
          <animateTransform attributeName="transform" type="translate" dur={`${seconds}s`} repeatCount="indefinite"
            values={`${step(from)};${step(to)};${step(to)}`} keyTimes="0;0.8;1" />
        </image>
      </g>
    </g>
  );
}

// Something floating on the water (a canoe): the picture's own boat, cut out
// with soft edges, rocking gently over the rippling lake. bob: [x0, y0, x1, y1].
function Bob({ id, src, w, h, box: [x0, y0, x1, y1] }) {
  return (
    <g>
      <defs>
        <filter id={`${id}-bob-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <mask id={`${id}-bob`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2}
            fill="#fff" filter={`url(#${id}-bob-soft)`} />
        </mask>
      </defs>
      <g className="cs-bob">
        <image href={src} width={w} height={h} mask={`url(#${id}-bob)`} />
      </g>
    </g>
  );
}

// An animal nodding its head: the picture's own head, cut out with soft
// edges, tipped down about its neck; it grows a touch as it tips, so it
// always covers the head drawn beneath it. nod: { box, pivot }.
// shape: an outline ([[x, y], ...]) to cut instead of the box, where a box
// would take in something that must stay still (a leg beside the head).
function Nod({ id, src, w, h, box: [x0, y0, x1, y1], shape, pivot: [px, py], className = "cs-nod", round = 30 }) {
  return (
    <g>
      <defs>
        <filter id={`${id}-nod-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id={`${id}-nod`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          {shape
            ? <polygon points={shape.map((p) => p.join(",")).join(" ")} fill="#fff" filter={`url(#${id}-nod-soft)`} />
            : <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={round} fill="#fff" filter={`url(#${id}-nod-soft)`} />}
        </mask>
      </defs>
      <g className={className} style={{ transformBox: "view-box", transformOrigin: `${px}px ${py}px` }}>
        <image href={src} width={w} height={h} mask={`url(#${id}-nod)`} />
      </g>
    </g>
  );
}

// Hot-spring steam: faint, very soft wisps lifting straight off the water,
// widening and thinning as they rise, a few at a time from each spot.
const WISPS = 3;
function Steam({ id, k, from }) {
  return (
    <g filter={`url(#${id}-steam)`}>
      <defs>
        <filter id={`${id}-steam`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={9 * k / 2.4} />
        </filter>
      </defs>
      {from.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${k / 2.4})`}>
          {Array.from({ length: WISPS }, (_, j) => (
            <ellipse key={j} className="cs-steam" rx="16" ry="22" fill="#fff"
              style={{ animationDelay: `${-((i * 1.7 + (j * 7.5) / WISPS) % 7.5)}s` }} />
          ))}
        </g>
      ))}
    </g>
  );
}

// A windmill's sails turning: one sail cut from the picture (which has its
// own sails painted out), set four times round the hub and turned slowly.
// The mill is drawn three-quarter on, so the sails turn in a tilted plane:
// the picture's four sail tips give that plane (sail one along its x axis,
// sail two along its y axis), and the sails turn in it, seen foreshortened.
const PLAIN = { transformBox: "view-box", transformOrigin: "0 0" };
function Sails({ src, at: [x, y], size: [sw, sh], hub: [hx, hy], tips: [t1, t2, t3, t4], seconds }) {
  const a = ((t1[0] - hx) + (hx - t3[0])) / 2;
  const b = ((t1[1] - hy) + (hy - t3[1])) / 2;
  const c = ((t2[0] - hx) + (hx - t4[0])) / 2;
  const d = ((t2[1] - hy) + (hy - t4[1])) / 2;
  const det = a * d - b * c;
  const plane = `matrix(${a} ${b} ${c} ${d} ${hx} ${hy})`;
  const flat = `matrix(${d / det} ${-b / det} ${-c / det} ${a / det} 0 0) translate(${-hx} ${-hy})`;
  return (
    <g>
      <g style={PLAIN} transform={plane}>
        <g style={PLAIN}>
          {[0, 90, 180, 270].map((angle) => (
            <g key={angle} style={PLAIN} transform={`rotate(${angle}) ${flat}`}>
              <image href={src} x={x} y={y} width={sw} height={sh} />
            </g>
          ))}
          {/* Turn backwards in the plane: anticlockwise, as Dutch mills turn. */}
          <animateTransform attributeName="transform" type="rotate" dur={`${seconds}s`} repeatCount="indefinite"
            values="0;-360" />
        </g>
      </g>
      <circle cx={hx} cy={hy} r="3.6" fill="#7a6a5a" stroke="#5a4a3e" strokeWidth=".8" />
      <circle cx={hx - 0.9} cy={hy - 0.9} r="1.2" fill="#a8988a" />
    </g>
  );
}

// A maple losing its leaves: the leaves (cut from the picture, whose tree is
// bare) are split into patches; one after another each patch empties and a
// leaf drifts from it to the ground, until the tree stands bare. Then the
// leaves come back and it starts again. Times are shares of one cycle.
const LEAF_FIRST = 0.06; // first patch goes
const LEAF_LAST = 0.62; // last patch goes
const LEAF_FALL = 0.2; // how long a falling leaf takes
const LEAF_BACK = [0.86, 0.95]; // leaves grow back
function Maple({ id, src, at: [x, y], size: [mw, mh], cells, ground, seconds }) {
  const count = cells.length;
  const dur = `${seconds}s`;
  const t = (n) => Math.min(Math.max(n, 0), 1).toFixed(4);
  return (
    <g>
      <defs>
        {/* Soft-edged patches, so an emptied patch has no straight cut. */}
        <filter id={`${id}-leaves-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        {cells.map((cell, i) => (
          <mask key={i} id={`${id}-leaves-${i}`} maskUnits="userSpaceOnUse" x={x - 10} y={y - 10} width={mw + 20} height={mh + 20}>
            <path d={cell.d} fill="#fff" stroke="#fff" strokeWidth="3" filter={`url(#${id}-leaves-soft)`} />
          </mask>
        ))}
      </defs>
      {cells.map((cell, i) => {
        const go = LEAF_FIRST + ((LEAF_LAST - LEAF_FIRST) * cell.order) / Math.max(count - 1, 1);
        return (
          <image key={i} href={src} x={x} y={y} width={mw} height={mh} mask={`url(#${id}-leaves-${i})`}>
            <animate attributeName="opacity" dur={dur} repeatCount="indefinite"
              values="1;1;0;0;1;1" keyTimes={`0;${t(go)};${t(go + 0.03)};${t(LEAF_BACK[0])};${t(LEAF_BACK[1])};1`} />
          </image>
        );
      })}
      {cells.map((cell, i) => {
        const go = LEAF_FIRST + ((LEAF_LAST - LEAF_FIRST) * cell.order) / Math.max(count - 1, 1);
        const [cx, cy] = cell.c;
        const drift = 18 + ((i * 37) % 30);
        const end = `${cx + drift} ${ground - ((i * 13) % 8)}`;
        const keys = `0;${t(go)};${t(go + LEAF_FALL)};1`;
        return (
          <g key={`fall-${i}`} opacity="0">
            <animate attributeName="opacity" dur={dur} repeatCount="indefinite"
              values="0;0;1;1;0;0" keyTimes={`0;${t(go)};${t(go + 0.005)};${t(go + LEAF_FALL - 0.03)};${t(go + LEAF_FALL)};1`} />
            <animateTransform attributeName="transform" type="translate" dur={dur} repeatCount="indefinite"
              values={`${cx} ${cy};${cx} ${cy};${end};${end}`} keyTimes={keys} />
            <g>
              <animateTransform attributeName="transform" type="rotate" dur={dur} repeatCount="indefinite"
                values={`0;0;${280 + (i % 3) * 60};${280 + (i % 3) * 60}`} keyTimes={keys} />
              <g transform="scale(.8)">{DRIFTERS.leaf}</g>
            </g>
          </g>
        );
      })}
    </g>
  );
}

// Soft puffs leaving a chimney top, rising and drifting off to the right
// like the pencil smoke drawn in the pictures.
const PUFFS = 4;
function Smoke({ id, x, y, k }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <defs>
        <filter id={`${id}-puff`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <g filter={`url(#${id}-puff)`}>
        {Array.from({ length: PUFFS }, (_, i) => (
          <circle key={i} className="cs-puff" r="4" fill="#d3d8db" style={{ animationDelay: `${(-i * 4.8) / PUFFS}s` }} />
        ))}
      </g>
    </g>
  );
}

const DRIFTERS = {
  petal: <path d="M0 0q4-4 7 0q-3 4-7 0Z" fill="#f2b9c0" stroke="#d88a9a" strokeWidth=".5" />,
  leaf: <path d="M0-6l2 3 3-1-1 3 3 1-4 2 1 3-3-1-1 3-1-3-3 1 1-3-4-2 3-1-1-3 3 1Z" fill="#e0866f" stroke="#b5604c" strokeWidth=".5" />,
};

// Drifters are drawn half again as big as their shapes, so they show on a phone.
function Drift({ kind, from, k }) {
  return from.map(([x, y], i) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${k * 1.5})`}>
      <g className={`cs-drift is-${kind}`} style={{ animationDelay: `${-i * 2.3}s` }}>
        {DRIFTERS[kind]}
      </g>
    </g>
  ));
}

function CountryScene({ country, page }) {
  const src = PICTURES[`../assets/country-bg/${country}-${page}.webp`];
  if (!src) return null;
  const scene = SCENES[country]?.[page] ?? {};
  const [w, h] = scene.size ?? SCENES[country]?.size ?? DEFAULT_SIZE;
  const k = w / BASE_WIDTH;
  const id = `country-scene-${country}-${page}`;
  return (
    <SnowScene snow={false}>
      <div className="country-scene" style={{ aspectRatio: `${w} / ${h}` }}>
        <img className="country-scene-art" src={src} alt="" />
        <svg className="country-scene-motion" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {scene.sea && <Sea id={id} src={src} w={w} h={h} k={k} {...scene.sea} />}
          {scene.skyLanterns && <SkyLanterns id={id} {...scene.skyLanterns} />}
          {scene.lanterns && <Lanterns id={id} src={src} w={w} h={h} items={scene.lanterns} />}
          {scene.aurora && <Aurora id={id} k={k} box={scene.aurora} />}
          {scene.fall && <Fall id={id} k={k} box={scene.fall} />}
          {scene.smoke?.map(([x, y], i) => <Smoke key={`${x}${y}`} id={`${id}-${i}`} x={x} y={y} k={k} />)}
          {scene.steam && <Steam id={id} k={k} from={scene.steam} />}
          {scene.sway && <Nod id={`${id}-sway`} src={src} w={w} h={h} {...scene.sway} className="cs-sway" round={12} />}
          {scene.nod && <Nod id={id} src={src} w={w} h={h} {...scene.nod} />}
          {scene.graze && <Nod id={`${id}-graze`} src={src} w={w} h={h} {...scene.graze} className="cs-graze" round={14} />}
          {scene.bob && <Bob id={id} src={src} w={w} h={h} box={scene.bob} />}
          {scene.maple && <Maple id={id} {...scene.maple} />}
          {scene.sails && <Sails {...scene.sails} />}
          {scene.train && <Train id={id} w={w} h={h} {...scene.train} />}
          {scene.head && <Head id={id} src={src} w={w} h={h} {...scene.head} />}
          {scene.drift && <Drift {...scene.drift} k={k} />}
        </svg>
      </div>
    </SnowScene>
  );
}

export default CountryScene;
