// Hand-drawn emblems for the globe home page, drawn in the same style as the
// town motifs on the Japan map (HandDrawnMotif.jsx): flat colour fills with a
// dark round-capped outline, on a 48 x 48 box centred on 0,0.
const INK = "#283033";

const emblems = {
  // Taiwan: Taipei 101.
  taiwan: (
    <>
      <path fill="#9fd0c7" d="M21 44V36l-3-1 1-6 3-1V22l-2-1 1-5 3-1V9h4v6l3 1 1 5-2 1v6l3 1 1 6-3 1v8z" />
      <path fill="none" d="M20 29h8M20 22h8M22 15h4M24 9V3M21 36h6" />
      <path fill="#f2bf4e" d="M22.5 40h3v4h-3z" />
      <path fill="none" d="M10 44h28" />
    </>
  ),
  // Japan: Mt Fuji under snow with the rising sun.
  japan: (
    <>
      <circle fill="#e95459" cx="35" cy="12" r="6" />
      <path fill="#78aeca" d="M3 41c7-6 11-16 16-26h10c5 10 9 20 16 26z" />
      <path fill="#fff" d="M14 25c2-4 3-7 5-10h10c2 3 3 6 5 10l-4-2-3 3-3-3-3 3-3-3z" />
      <path fill="none" d="M2 42c12-2 31 2 44-1" />
    </>
  ),
  // Iceland: aurora over a volcano.
  iceland: (
    <>
      <path fill="none" stroke="#6fd3a6" strokeWidth="3" d="M4 12c8-6 14 4 22-2s12-4 18 0" />
      <path fill="none" stroke="#a48ad0" strokeWidth="2.4" d="M6 19c7-4 13 3 20-1s11-2 16 1" />
      <path fill="#5b7280" d="M4 42 17 26h14l13 16z" />
      <path fill="#e87543" d="M17 26h14l-3 5-3-2-2 3-2-3-2 2z" />
      <path fill="none" d="M2 43c12-2 31 2 44-1" />
    </>
  ),
  // Norway: a viking ship on the fjord.
  norway: (
    <>
      <path fill="none" d="M24 8v24" />
      <path fill="#e95459" d="M14 11h20l-2 15H16z" />
      <path fill="none" stroke="#fff" strokeWidth="2.4" d="M15 18h18M24 12v13" />
      <path fill="#b7835e" d="M5 30c4 2 9 3 19 3s15-1 19-3c0 6-6 10-19 10S5 36 5 30z" />
      <path fill="none" d="M5 30c-2-3-2-6 1-8M43 30c2-3 2-6-1-8" />
      <path fill="none" stroke="#78aeca" d="M3 44c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  // Switzerland: the Matterhorn and a little Swiss flag.
  switzerland: (
    <>
      <path fill="#7daac4" d="M3 42 20 9l5 8 4-2 16 27z" />
      <path fill="#fff" d="m14 21 6-12 5 8 4-2 4 7-5-2-3 3-4-4-3 4z" />
      <path fill="none" d="M38 8v14" />
      <path fill="#e95459" d="M38 8h8v7h-8z" />
      <path fill="none" stroke="#fff" strokeWidth="1.6" d="M42 9.5v4M40 11.5h4" />
      <path fill="none" d="M2 43c12-2 31 2 44-1" />
    </>
  ),
  // Finland: a reindeer.
  finland: (
    <>
      <path fill="none" stroke="#a97852" strokeWidth="2.2" d="M18 15 13 5M15 10l-5-1M16 13l-6 1M30 15l5-10M33 10l5-1M32 13l6 1" />
      <path fill="#c99867" d="M17 17c0-3 3-4 7-4s7 1 7 4l-1 13c0 6-3 10-6 10s-6-4-6-10z" />
      <path fill="#c99867" d="M17 19c-4-1-6 1-6 3 3 1 5 0 6-1zM31 19c4-1 6 1 6 3-3 1-5 0-6-1z" />
      <circle fill={INK} stroke="none" cx="21" cy="23" r="1.3" />
      <circle fill={INK} stroke="none" cx="27" cy="23" r="1.3" />
      <circle fill="#e95459" cx="24" cy="38" r="3" />
    </>
  ),
  // New Zealand: a kiwi bird.
  newZealand: (
    <>
      <path fill="#a97852" d="M7 27c0-9 7-15 16-15s14 6 14 13c0 8-7 13-16 13S7 35 7 27z" />
      <circle fill="#a97852" cx="35" cy="20" r="6" />
      <path fill="none" d="m40 22 7 10" />
      <circle fill={INK} stroke="none" cx="37" cy="18.5" r="1.2" />
      <path fill="none" d="M18 37v6h-3m3 0h3M26 37v6h-3m3 0h3" />
      <path fill="none" d="M13 24c3-2 6-2 9 0M15 30c3-2 6-2 9 0" />
    </>
  ),
  // Canada: a maple leaf.
  canada: (
    <>
      <path fill="#e95459" d="m24 3 4 8 4-2-1 10 6-6 2 4 5-1-3 8 3 2-11 8 1 4-9-1-9 1 1-4-11-8 3-2-3-8 5 1 2-4 6 6-1-10 4 2z" />
      <path fill="none" d="M24 35v10" />
    </>
  ),
  // Netherlands: a windmill with tulips.
  netherlands: (
    <>
      <path fill="#f4efe1" d="M17 44 19 22h10l2 22z" />
      <path fill="#b7835e" d="M17 22c0-4 3-7 7-7s7 3 7 7z" />
      <path fill="none" stroke="#5b7280" strokeWidth="2.2" d="m10 7 28 24M38 7 10 31" />
      <circle fill="#f2bf4e" cx="24" cy="19" r="2.2" />
      <path fill="#b7835e" d="M22 44v-6c0-2 4-2 4 0v6z" />
      <path fill="#e95459" d="M5 38c0-3 1-5 3-5s3 2 3 5zM37 38c0-3 1-5 3-5s3 2 3 5z" />
      <path fill="none" stroke="#71a85d" d="M8 38v6M40 38v6" />
      <path fill="none" d="M3 44h42" />
    </>
  ),
  // France: the Eiffel Tower.
  france: (
    <>
      <path fill="#c38a60" d="M23 6h2l2 12 3 12 6 14h-7c-1-4-3-6-5-6s-4 2-5 6h-7l6-14 3-12z" />
      <path fill="none" d="M24 2v4M20 18h8M17 30h14M21 24h6" />
      <path fill="none" d="M9 44h30" />
    </>
  ),
};

function CountryEmblem({ type, className = "" }) {
  return (
    <svg
      className={`country-emblem ${className}`}
      x="-24"
      y="-24"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {emblems[type]}
      </g>
    </svg>
  );
}

export default CountryEmblem;
