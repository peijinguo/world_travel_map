// The night sky behind the globe home page: twinkling stars across the
// screen, and hand-drawn planets travelling dotted orbits around the globe.
//
// The orbits are tilted ellipses around the globe. Each is drawn twice: the
// "back" layer sits under the globe, and the "front" layer, clipped to the
// near (lower) half of the ellipses, sits over it, so a planet passes behind
// the globe on the far side of its orbit and in front of it on the near side.
// Both copies of a planet run the same SMIL motion from page load, so they
// stay in step without any React re-render.

const INK = "#161a22";

// Seeded so the sky looks the same on every visit.
const random = (() => {
  let seed = 20261114;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
})();

const dots = Array.from({ length: 70 }, () => ({
  x: random() * 100,
  y: random() * 100,
  r: 0.6 + random() * 1.1,
  delay: -random() * 4,
}));
const sparkles = [
  [12, 14, 9], [52, 8, 12], [88, 11, 8], [18, 46, 11], [90, 58, 12],
  [46, 80, 11], [80, 86, 8], [8, 90, 7], [64, 30, 6], [32, 64, 6],
].map(([x, y, size], index) => ({ x, y, size, delay: -index * 0.7 }));

const sparkle = (size) => `M0 ${-size}C${size * 0.18} ${-size * 0.18} ${size * 0.18} ${-size * 0.18} ${size} 0C${size * 0.18} ${size * 0.18} ${size * 0.18} ${size * 0.18} 0 ${size}C${-size * 0.18} ${size * 0.18} ${-size * 0.18} ${size * 0.18} ${-size} 0C${-size * 0.18} ${-size * 0.18} ${-size * 0.18} ${-size * 0.18} 0 ${-size}Z`;

export function StarrySky() {
  return (
    <div className="space-sky" aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {dots.map((dot, index) => (
          <circle
            key={index}
            className="space-star"
            cx={`${dot.x}%`}
            cy={`${dot.y}%`}
            r={dot.r}
            style={{ animationDelay: `${dot.delay}s` }}
          />
        ))}
      </svg>
      {sparkles.map((star, index) => (
        <svg
          key={index}
          className="space-sparkle"
          style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: `${star.delay}s` }}
          width={star.size * 2}
          height={star.size * 2}
          viewBox={`${-star.size} ${-star.size} ${star.size * 2} ${star.size * 2}`}
        >
          <path d={sparkle(star.size)} />
        </svg>
      ))}
    </div>
  );
}

const planets = {
  // A small red planet with craters.
  mars: (
    <>
      <circle r="30" fill="#ee8d68" />
      <circle cx="-10" cy="-8" r="5" fill="#d9644a" stroke="none" />
      <circle cx="9" cy="-12" r="4" fill="#d9644a" stroke="none" />
      <circle cx="12" cy="6" r="6" fill="#d9644a" stroke="none" />
      <circle cx="-6" cy="12" r="4" fill="#d9644a" stroke="none" />
      <circle cx="-17" cy="4" r="3" fill="#d9644a" stroke="none" />
    </>
  ),
  // A banded giant with its great spot.
  jupiter: (
    <>
      <clipPath id="planet-jupiter-clip"><circle r="62" /></clipPath>
      <circle r="62" fill="#fbe3c8" />
      <g clipPath="url(#planet-jupiter-clip)" stroke="none">
        <path fill="#f2a476" d="M-70-40c30-8 70 6 140-4v10c-60 8-100-4-140 4z" />
        <path fill="#f5bb92" d="M-70-16c40 6 90-8 140 2v12c-50-8-90 6-140-2z" />
        <path fill="#f2a476" d="M-70 14c50-6 90 8 140 0v12c-50 8-90-6-140 0z" />
        <path fill="#f5bb92" d="M-70 38c40 4 90-6 140 2v10c-50-6-90 4-140-2z" />
        <ellipse cx="22" cy="20" rx="17" ry="9" fill="#e9774f" />
        <ellipse cx="22" cy="20" rx="9" ry="4.5" fill="#fbd0a6" />
      </g>
      <circle r="62" fill="none" />
    </>
  ),
  // The moon, close in.
  moon: (
    <>
      <circle r="26" fill="#f1e6c8" />
      <circle cx="-8" cy="-6" r="4.5" fill="#dccaa0" stroke="none" />
      <circle cx="8" cy="-10" r="3" fill="#dccaa0" stroke="none" />
      <circle cx="7" cy="8" r="5" fill="#dccaa0" stroke="none" />
      <circle cx="-9" cy="11" r="2.5" fill="#dccaa0" stroke="none" />
    </>
  ),
  // A small pale banded planet.
  venus: (
    <>
      <clipPath id="planet-venus-clip"><circle r="28" /></clipPath>
      <circle r="28" fill="#fbe8c2" />
      <g clipPath="url(#planet-venus-clip)" stroke="none">
        <path fill="#f0cf8f" d="M-30-12c20-4 40 4 60-2v6c-20 6-40-2-60 2z" />
        <path fill="#f0cf8f" d="M-30 6c20 4 40-4 60 2v6c-20-6-40 2-60-2z" />
      </g>
      <circle r="28" fill="none" />
    </>
  ),
  // A ringed planet.
  saturn: (
    <>
      <clipPath id="planet-saturn-clip"><circle r="50" /></clipPath>
      <path fill="#f5eccf" d="M-82 22c-10-12 50-40 100-50s70-6 74 6l-12 6c-6-6-30-6-60 2s-80 30-90 42z" transform="rotate(-6)" />
      <circle r="50" fill="#fbd9b5" />
      <g clipPath="url(#planet-saturn-clip)" stroke="none">
        <path fill="#f3b588" d="M-55-26c30-6 70 6 110-2v9c-40 6-80-4-110 2z" />
        <path fill="#f6c69e" d="M-55-4c40 6 80-6 110 2v9c-40-6-80 6-110-2z" />
        <path fill="#f3b588" d="M-55 20c30-4 70 6 110 0v9c-40 4-80-6-110 0z" />
      </g>
      <circle r="50" fill="none" />
      <path fill="#f5eccf" d="M-85 26c-6 12 48 8 100-6s84-34 78-44c-2-3-8-4-16-3l-2 5c4 0 6 1 6 2 2 6-30 22-70 32s-80 14-82 8z" transform="rotate(-6)" />
      <path fill="none" stroke="#9fbf8a" strokeWidth="5" d="M-76 22c-2 6 40 2 86-10s76-28 72-34" transform="rotate(-6)" />
    </>
  ),
};

// [rx, ry] of each orbit, and the planets that travel it: how long a lap
// takes, and where along the lap each starts (0-1).
const orbits = [
  { id: "outer", rx: 500, ry: 320, laps: [{ planet: "jupiter", dur: 120, at: 0.66 }, { planet: "saturn", dur: 120, at: 0.12 }, { planet: "mars", dur: 120, at: 0.86 }, { planet: "venus", dur: 120, at: 0.4 }] },
  { id: "inner", rx: 372, ry: 360, laps: [{ planet: "moon", dur: 45, at: 0.62 }] },
];

const TILT = -12;

const ellipse = ([cx, cy], rx, ry) =>
  `M${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`;

const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// One layer of the orbits; `front` keeps only the near half (in front of the globe).
export function PlanetOrbits({ center, front = false }) {
  const [cx, cy] = center;
  const clipId = "planet-orbit-front-half";
  return (
    <g className={`planet-orbits ${front ? "is-front" : "is-back"}`} aria-hidden="true">
      {front && (
        <clipPath id={clipId}>
          <rect x={cx - 2000} y={cy} width="4000" height="2000" />
        </clipPath>
      )}
      <g transform={`rotate(${TILT} ${cx} ${cy})`} clipPath={front ? `url(#${clipId})` : undefined}>
        {orbits.map((orbit) => {
          const d = ellipse(center, orbit.rx, orbit.ry);
          const pathId = `planet-orbit-${orbit.id}-${front ? "front" : "back"}`;
          return (
            <g key={orbit.id}>
              <path id={pathId} className="planet-orbit" d={d} />
              {orbit.laps.map((lap) => (
                <g key={lap.planet} className="planet">
                  <g transform={`rotate(${-TILT})`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
                    {planets[lap.planet]}
                  </g>
                  {reduceMotion ? (
                    <animateMotion dur="1s" fill="freeze" keyPoints={`${lap.at};${lap.at}`} keyTimes="0;1" calcMode="linear">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  ) : (
                    <animateMotion dur={`${lap.dur}s`} begin={`${-lap.at * lap.dur}s`} repeatCount="indefinite">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </g>
    </g>
  );
}
