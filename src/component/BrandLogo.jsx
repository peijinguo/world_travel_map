// The site logo: a folded world map with three location pins. On load the
// map unfolds and the pins drop in one after another; after that the pins
// take turns to hop now and then, and hovering the brand makes them all hop.
// The animation lives in _custom.scss (.brand-logo).

const INK = "#1f3a5a";

// A map pin whose tip is at 0,0.
const PIN = "M0 0C-1.2-3.4-6-6.6-6-11.4a6 6 0 0 1 12 0C6-6.6 1.2-3.4 0 0z";

const pins = [
  { className: "is-red", fill: "#e9776b", x: 24, y: 17.5, scale: 1 },
  { className: "is-yellow", fill: "#efc24f", x: 11.5, y: 31, scale: 0.86 },
  { className: "is-blue", fill: "#9cc7df", x: 37, y: 35, scale: 0.8 },
];

function BrandLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 48 48" aria-hidden="true">
      <g className="brand-logo-map">
        <path
          fill="#fbf6ec"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinejoin="round"
          d="M4.5 14 16.5 9.5 31.5 14 43.5 9.5V38.5L31.5 43 16.5 38.5 4.5 43Z"
        />
        <g fill="#93c07f">
          <path d="M11 22c2-3 6-4 9-3 3 0 4 2 3 4s-4 2-5 4c0 3-2 6-5 5-2-1-1-4-2-6s-1-3 0-4z" />
          <path d="M26 19c3-2 8-2 11 0 2 1 3 3 1 4-2 0-3 1-3 3s-2 4-4 5c-2 1-3-1-3-3s-3-2-3-4 0-4 1-5z" />
          <path d="M33 33c1-1 3-1 4 0s0 3-2 3-3-2-2-3z" />
        </g>
        <path fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" d="M16.5 9.5V38.5M31.5 14V43" />
      </g>
      {pins.map((pin) => (
        <g key={pin.className} transform={`translate(${pin.x} ${pin.y}) scale(${pin.scale})`}>
          <g className={`brand-logo-pin ${pin.className}`}>
            <path fill={pin.fill} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" d={PIN} />
            <circle fill="#fff" cx="0" cy="-11.4" r="2.4" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export default BrandLogo;
