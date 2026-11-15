import SnowScene from "./SnowScene";
import "../assets/pages/_country-scene.scss";
import swissTrain from "../assets/country-bg/switzerland-train.webp";
import dutchSail from "../assets/country-bg/netherlands-sail.webp";
import mapleLeaves from "../assets/country-bg/canada-maple.webp";
import mapleCells from "../assets/country-bg/canada-maple.json";

// The picture behind 行前準備 and 機票住宿 for every country: one hand-drawn
// picture per country and page across the bottom of the screen. Files are src/assets/country-bg/<country>-<page>.webp.
const PICTURES = import.meta.glob("../assets/country-bg/*-{prep,hotel}.webp", {
  eager: true,
  import: "default",
});

// It moves a little, from an SVG laid exactly over the picture, in the
// picture's own pixels: water ripples (the picture's own water redrawn through
// a swaying ripple), the northern lights shimmer, a waterfall streams,
// chimneys smoke, and lanterns, leaves or petals drift across.
// water: [x0, y0, x1, y1]; aurora and fall: the same; smoke: [x, y] of each
// chimney top; drift: what drifts, where each one starts, and how big it is.
const SCENES = {
  japan: {
    size: [1200, 675],
    prep: { water: [0, 632, 1200, 675], drift: { kind: "petal", from: [[200, 420], [160, 455], [250, 440], [130, 400], [290, 470]] } },
    // Hot-spring steam, the pool rippling, and the red lantern swaying.
    hotel: { water: [110, 578, 380, 628], steam: [[150, 600], [190, 596], [232, 602], [275, 598], [320, 604]], sway: { box: [884, 490, 918, 536], pivot: [901, 491] } },
  },
  taiwan: {
    size: [1200, 675],
    prep: { water: [610, 596, 1200, 668], drift: { kind: "lantern", from: [[115, 500], [178, 470], [230, 530]] } },
    hotel: {},
  },
  iceland: {
    prep: { size: [1200, 788], head: { box: [130, 630, 197, 680], patch: [152, 634, 197, 677], pivot: [150, 674], sky: "#fafcfc" }, fall: [648, 534, 836, 740], water: [80, 754, 876, 788] },
    hotel: { aurora: [60, 135, 470, 250], water: [190, 304, 503, 330] },
  },
  norway: {
    prep: { water: [0, 282, 330, 330] },
    hotel: { water: [170, 286, 503, 330] },
  },
  finland: {
    prep: { water: [178, 284, 380, 330], smoke: [[434, 206]] },
    hotel: { aurora: [50, 110, 440, 210], smoke: [[410, 222]] },
  },
  netherlands: {
    prep: { sails: { src: dutchSail, at: [28, 116], size: [57, 74], hub: [86, 182], seconds: 14 }, water: [200, 290, 503, 330], drift: { kind: "petal", from: [[470, 170], [420, 190], [500, 210], [380, 180]] } },
    hotel: { water: [0, 268, 330, 330], drift: { kind: "petal", from: [[480, 130], [440, 150], [500, 170], [400, 160]] } },
  },
  france: {
    prep: {},
    hotel: { smoke: [[93, 106]] },
  },
  switzerland: {
    // The train is cut from the picture (the picture has it painted out).
    prep: { train: { src: swissTrain, at: [264, 230], size: [172, 49], from: 250, to: -240, slope: -0.11, hideLeft: [190, 215], seconds: 20 } },
    hotel: { smoke: [[20, 122]] },
  },
  newZealand: {
    prep: { water: [160, 256, 503, 292] },
    hotel: { smoke: [[34, 156]] },
  },
  canada: {
    prep: { size: [1200, 788], water: [330, 605, 1200, 728], bob: [852, 668, 1110, 724], nod: { box: [188, 508, 344, 638], pivot: [250, 600] } },
    // The picture's maple is bare; its leaves sit on top in patches that drop.
    hotel: { smoke: [[423, 174]], maple: { src: mapleLeaves, ...mapleCells, ground: 292, seconds: 20 } },
  },
};
const DEFAULT_SIZE = [503, 330];

const EASE = ".45 0 .55 1;.45 0 .55 1";

// Sizes below are for a picture 503px wide; `k` scales them to the picture's
// own width so a larger picture moves just as much on screen.
const BASE_WIDTH = 503;

// The picture's water redrawn through a ripple that sways and bobs.
function Water({ id, src, w, h, k, box: [x0, y0, x1, y1] }) {
  const region = { x: x0 - 40 * k, y: y0 - 20 * k, width: x1 - x0 + 80 * k, height: y1 - y0 + 40 * k };
  return (
    <g>
      <defs>
        <filter id={`${id}-ripple`} {...region} filterUnits="userSpaceOnUse">
          <feTurbulence {...region} type="fractalNoise" baseFrequency={`${0.012 / k} ${0.18 / k}`} numOctaves="2" seed="4" result="noise" />
          <feOffset in="noise" result="swell">
            <animate attributeName="dx" dur="9s" repeatCount="indefinite" values={`0;${-40 * k};0`} calcMode="spline" keyTimes="0;.5;1" keySplines={EASE} />
            <animate attributeName="dy" dur="3.5s" repeatCount="indefinite" values={`0;${8 * k};0`} calcMode="spline" keyTimes="0;.5;1" keySplines={EASE} />
          </feOffset>
          <feDisplacementMap in="SourceGraphic" in2="swell" scale={6 * k} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id={`${id}-water`}>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-water)`}>
        <image href={src} width={w} height={h} filter={`url(#${id}-ripple)`} />
      </g>
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
function Nod({ id, src, w, h, box: [x0, y0, x1, y1], pivot: [px, py], className = "cs-nod", round = 30 }) {
  return (
    <g>
      <defs>
        <filter id={`${id}-nod-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id={`${id}-nod`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={round} fill="#fff" filter={`url(#${id}-nod-soft)`} />
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
function Sails({ src, at: [x, y], size: [sw, sh], hub: [hx, hy], seconds }) {
  return (
    <g>
      {/* Turn about the hub in picture pixels, not the group's own centre. */}
      <g style={{ transformBox: "view-box", transformOrigin: "0 0" }}>
        {[0, 90, 180, 270].map((angle) => (
          <image key={angle} href={src} x={x} y={y} width={sw} height={sh} transform={`rotate(${angle} ${hx} ${hy})`} />
        ))}
        <animateTransform attributeName="transform" type="rotate" dur={`${seconds}s`} repeatCount="indefinite"
          values={`0 ${hx} ${hy};360 ${hx} ${hy}`} />
      </g>
      <circle cx={hx} cy={hy} r="2.5" fill="#6e5f50" />
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
  lantern: (
    <g>
      <path d="M-6 0l-2-14q8-5 16 0l-2 14Z" fill="#f6dfa0" stroke="#b9876a" strokeWidth=".8" />
      <ellipse cx="0" cy="1" rx="2" ry="1.2" fill="#eda56f" />
    </g>
  ),
  petal: <path d="M0 0q4-4 7 0q-3 4-7 0Z" fill="#f2b9c0" stroke="#d88a9a" strokeWidth=".5" />,
  leaf: <path d="M0-6l2 3 3-1-1 3 3 1-4 2 1 3-3-1-1 3-1-3-3 1 1-3-4-2 3-1-1-3 3 1Z" fill="#e0866f" stroke="#b5604c" strokeWidth=".5" />,
};

// Drifters are drawn half again as big as their shapes, so they show on a phone.
function Drift({ kind, from, k }) {
  return from.map(([x, y], i) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${k * 1.5})`}>
      <g className={`cs-drift is-${kind}`} style={{ animationDelay: `${-i * (kind === "lantern" ? 4 : 2.3)}s` }}>
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
          {scene.water && <Water id={id} src={src} w={w} h={h} k={k} box={scene.water} />}
          {scene.aurora && <Aurora id={id} k={k} box={scene.aurora} />}
          {scene.fall && <Fall id={id} k={k} box={scene.fall} />}
          {scene.smoke?.map(([x, y], i) => <Smoke key={`${x}${y}`} id={`${id}-${i}`} x={x} y={y} k={k} />)}
          {scene.steam && <Steam id={id} k={k} from={scene.steam} />}
          {scene.sway && <Nod id={`${id}-sway`} src={src} w={w} h={h} {...scene.sway} className="cs-sway" round={12} />}
          {scene.nod && <Nod id={id} src={src} w={w} h={h} {...scene.nod} />}
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
