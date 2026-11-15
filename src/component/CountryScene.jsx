import SnowScene from "./SnowScene";
import { isSnowyCountry } from "../data/countries";
import taiwan from "../assets/country-bg/taiwan.webp";
import iceland from "../assets/country-bg/iceland.webp";
import norway from "../assets/country-bg/norway.webp";
import finland from "../assets/country-bg/finland.webp";
import netherlands from "../assets/country-bg/netherlands.webp";
import france from "../assets/country-bg/france.webp";
import switzerland from "../assets/country-bg/switzerland.webp";
import newZealand from "../assets/country-bg/newZealand.webp";
import canada from "../assets/country-bg/canada.webp";
import "../assets/pages/_country-scene.scss";

// The picture behind 行前準備 and 機票住宿 for every country but Japan (which
// keeps its own snow scenes, PrepScene and HotelScene): one hand-drawn
// panorama per country across the bottom of the screen, shown on both pages,
// with snow falling over it where the country has snow.
//
// It moves a little, from an SVG laid exactly over the picture, in the
// picture's own pixels: water ripples (the picture's own water redrawn through
// a swaying ripple), the northern lights shimmer, a waterfall streams,
// chimneys smoke, and lanterns, leaves, petals or birds drift across.
// water: [x0, y0, x1, y1]; aurora and fall: the same; smoke: [x, y] of each
// chimney; drift: what drifts and where it starts.
const SCENES = {
  taiwan: { src: taiwan, w: 647, h: 314, water: [180, 246, 500, 300], drift: { kind: "lantern", from: [[175, 120], [250, 170], [330, 150]] } },
  iceland: { src: iceland, w: 647, h: 314, aurora: [300, 50, 640, 145], fall: [214, 178, 292, 262], water: [250, 260, 520, 304] },
  norway: { src: norway, w: 643, h: 314, water: [0, 246, 643, 310], drift: { kind: "bird", from: [[120, 80], [380, 60]] } },
  finland: { src: finland, w: 647, h: 309, aurora: [250, 60, 640, 150], water: [200, 228, 520, 286], smoke: [[518, 196]] },
  netherlands: { src: netherlands, w: 647, h: 309, water: [230, 246, 647, 304], drift: { kind: "petal", from: [[600, 120], [480, 140], [640, 160], [560, 100]] } },
  france: { src: france, w: 643, h: 309, water: [0, 270, 430, 300], drift: { kind: "petal", from: [[20, 70], [60, 90], [40, 120], [80, 60]] } },
  switzerland: { src: switzerland, w: 647, h: 305, drift: { kind: "bird", from: [[150, 70], [420, 50], [300, 90]] } },
  newZealand: { src: newZealand, w: 647, h: 305, water: [160, 200, 480, 252], drift: { kind: "bird", from: [[260, 60], [480, 80]] } },
  canada: { src: canada, w: 643, h: 305, water: [130, 226, 620, 296], smoke: [[538, 146]], drift: { kind: "leaf", from: [[560, 60], [610, 90], [520, 100], [630, 50]] } },
};

const EASE = ".45 0 .55 1;.45 0 .55 1";

// The picture's water redrawn through a ripple that sways and bobs.
function Water({ id, src, w, h, box: [x0, y0, x1, y1] }) {
  const region = { x: x0 - 40, y: y0 - 20, width: x1 - x0 + 80, height: y1 - y0 + 40 };
  return (
    <g>
      <defs>
        <filter id={`${id}-ripple`} {...region} filterUnits="userSpaceOnUse">
          <feTurbulence {...region} type="fractalNoise" baseFrequency="0.012 0.18" numOctaves="2" seed="4" result="noise" />
          <feOffset in="noise" result="swell">
            <animate attributeName="dx" dur="14s" repeatCount="indefinite" values="0;-30;0" calcMode="spline" keyTimes="0;.5;1" keySplines={EASE} />
            <animate attributeName="dy" dur="5s" repeatCount="indefinite" values="0;5;0" calcMode="spline" keyTimes="0;.5;1" keySplines={EASE} />
          </feOffset>
          <feDisplacementMap in="SourceGraphic" in2="swell" scale="3" xChannelSelector="R" yChannelSelector="G" />
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
function Aurora({ id, box: [x0, y0, x1, y1] }) {
  const w = x1 - x0;
  const h = y1 - y0;
  const band = (dy) => `M${x0} ${y1 - h * 0.1 + dy}C${x0 + w * 0.3} ${y1 - h * 0.6 + dy} ${x0 + w * 0.55} ${y0 + h * 0.55 + dy} ${x1} ${y0 + h * 0.15 + dy}`;
  return (
    <g>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter={`url(#${id}-soft)`} fill="none" strokeLinecap="round">
        <path className="cs-aurora" d={band(0)} stroke="#8fe0b4" strokeWidth="18" />
        <path className="cs-aurora is-late" d={band(16)} stroke="#c1a9e6" strokeWidth="10" />
      </g>
    </g>
  );
}

// A waterfall streaming down.
function Fall({ id, src, w, h, box: [x0, y0, x1, y1] }) {
  const region = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  return (
    <g>
      <defs>
        <filter id={`${id}-stream`} {...region} filterUnits="userSpaceOnUse">
          <feTurbulence {...region} type="fractalNoise" baseFrequency="0.25 0.03" numOctaves="2" seed="2" result="noise" />
          <feOffset in="noise" result="flow">
            <animate attributeName="dy" dur="1.6s" repeatCount="indefinite" values="0;40" />
          </feOffset>
          <feDisplacementMap in="SourceGraphic" in2="flow" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id={`${id}-fall`}>
          <rect {...region} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-fall)`}>
        <image href={src} width={w} height={h} filter={`url(#${id}-stream)`} />
      </g>
    </g>
  );
}

function Smoke({ x, y }) {
  return (
    <g fill="none" stroke="#9aa3a6" strokeWidth="2.4" strokeLinecap="round">
      {[0, 1, 2].map((i) => (
        <path key={i} className="cs-smoke" style={{ animationDelay: `${-i * 1.4}s` }} d={`M${x} ${y}q-6-8 0-16t0-16`} />
      ))}
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
  bird: <path d="M-6 0q3-4 6 0q3-4 6 0" fill="none" stroke="#6c7675" strokeWidth="1.2" strokeLinecap="round" />,
};

function Drift({ kind, from }) {
  return from.map(([x, y], i) => (
    <g key={i} transform={`translate(${x} ${y})`}>
      <g className={`cs-drift is-${kind}`} style={{ animationDelay: `${-i * (kind === "lantern" ? 4 : 2.3)}s` }}>
        {DRIFTERS[kind]}
      </g>
    </g>
  ));
}

function CountryScene({ country }) {
  const scene = SCENES[country];
  if (!scene) return null;
  const { src, w, h } = scene;
  const id = `country-scene-${country}`;
  return (
    <SnowScene snow={isSnowyCountry(country)}>
      <div className="country-scene" style={{ aspectRatio: `${w} / ${h}` }}>
        <img className="country-scene-art" src={src} alt="" />
        <svg className="country-scene-motion" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {scene.water && <Water id={id} src={src} w={w} h={h} box={scene.water} />}
          {scene.aurora && <Aurora id={id} box={scene.aurora} />}
          {scene.fall && <Fall id={id} src={src} w={w} h={h} box={scene.fall} />}
          {scene.smoke?.map(([x, y]) => <Smoke key={`${x}${y}`} x={x} y={y} />)}
          {scene.drift && <Drift {...scene.drift} />}
        </svg>
      </div>
    </SnowScene>
  );
}

export default CountryScene;
