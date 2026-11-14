// Hand-drawn icons for the places on a country's map (CountryHome.jsx), in
// the same flat-fill, ink-outline style as the town motifs on the Japan map
// and the country emblems. Drawn on a 48 x 48 box centred on 0,0.
const INK = "#283033";

const motifs = {
  // Santa's red hat with a white bobble.
  santa: (
    <>
      <path fill="#e95459" d="M9 33c2-12 8-22 17-24 7-1 11 4 12 10l-6 1c0-3-2-5-5-4-5 2-8 9-9 17z" />
      <circle fill="#fff" cx="37" cy="21" r="4.5" />
      <path fill="#fff" d="M6 33c6-3 26-3 32 0v6c-6 3-26 3-32 0z" />
    </>
  ),
  // A glass igloo under the northern lights.
  aurora: (
    <>
      <path fill="none" stroke="#6fd3a6" strokeWidth="3" d="M3 13c8-6 14 3 21-2s13-4 21 1" />
      <path fill="none" stroke="#a48ad0" strokeWidth="2.4" d="M6 19c7-4 12 2 18-1s11-2 17 1" />
      <path fill="#cfe9f5" d="M8 42c0-10 7-17 16-17s16 7 16 17z" />
      <path fill="none" d="M24 25v17M13 31c7 2 15 2 22 0M10 37c9 2 19 2 28 0" />
      <path fill="none" d="M4 42h40" />
    </>
  ),
  // A skier coming down a snowy slope.
  ski: (
    <>
      <path fill="#eef6fa" d="M3 42 30 20l15 22z" />
      <circle fill="#e9704f" cx="22" cy="10" r="3.6" />
      <path fill="none" stroke="#e9704f" strokeWidth="3" d="m21 15-4 9 7 4-3 8" />
      <path fill="none" d="M10 30 31 42M15 20l-5 11M24 17l6 6" />
    </>
  ),
  // Helsinki's white cathedral with green domes.
  cathedral: (
    <>
      <path fill="#f4efe1" d="M10 42V24h28v18z" />
      <path fill="#71a85d" d="M17 24c0-7 3-11 7-11s7 4 7 11z" />
      <path fill="none" d="M24 13V6M22 8h4" />
      <path fill="#71a85d" d="M8 24c0-3 1-5 3-5s3 2 3 5zM34 24c0-3 1-5 3-5s3 2 3 5z" />
      <path fill="none" d="M15 42V31h4v11M29 42V31h4v11M22 42v-8h4v8M6 42h36" />
    </>
  ),
  // Porvoo's red riverside storehouses.
  redHouses: (
    <>
      <path fill="#d9584c" d="M5 36V23l7-7 7 7v13zM19 36V21l8-8 8 8v15zM35 36V24l5-5 5 5v12z" />
      <path fill="none" d="M10 36v-6h4v6M25 36v-7h4v7M39 36v-5h3v5" />
      <path fill="none" stroke="#78aeca" d="M3 41c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  // A medieval stone castle.
  castle: (
    <>
      <path fill="#c7c2b6" d="M8 42V18h7v4h4v-4h10v4h4v-4h7v24z" />
      <path fill="#e9704f" d="M9 18 11.5 9 14 18M34 18l2.5-9 2.5 9" />
      <path fill="#6c5a4c" d="M20 42V32c0-3 2-5 4-5s4 2 4 5v10z" />
      <path fill="none" d="M4 42h40" />
    </>
  ),
  // A lakeside sauna letting off steam.
  sauna: (
    <>
      <path fill="none" stroke="#9aa9b1" d="M18 12c-3-4 3-5 0-9M26 12c-3-4 3-5 0-9" />
      <path fill="#b7835e" d="M8 36V24l14-10 14 10v12z" />
      <path fill="#6c5a4c" d="M18 36v-8h7v8z" />
      <path fill="none" d="M8 29h28M8 33h28" />
      <path fill="none" stroke="#78aeca" d="M3 41c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  // Olavinlinna, the castle standing in a lake.
  lakeCastle: (
    <>
      <path fill="#78aeca" d="M3 38c6-3 36-3 42 0v4H3z" />
      <path fill="#c7c2b6" d="M12 38V20h6v4h12v-4h6v18z" />
      <path fill="#c7c2b6" d="M18 24V12h12v12z" />
      <path fill="#e9704f" d="M17 12l7-7 7 7z" />
      <path fill="none" d="M22 38v-6h4v6M22 18h4" />
    </>
  ),
  // Kuopio's Puijo tower above the forest.
  tower: (
    <>
      <path fill="#f4efe1" d="M21 42V14h6v28z" />
      <path fill="#9cc7df" d="M16 14l2-7h12l2 7z" />
      <path fill="none" d="M24 7V2" />
      <path fill="#71a85d" d="m4 42 6-12 6 12zM32 42l6-13 6 13z" />
      <path fill="none" d="M2 42h44" />
    </>
  ),
  // Koli's hilltop view over lakes and forest.
  hills: (
    <>
      <path fill="#85ae77" d="M3 34c6-10 12-14 18-12 5 1 8-6 13-6 6 0 9 8 11 18z" />
      <path fill="#78aeca" d="M3 36c8-2 34-2 42 0v6H3z" />
      <path fill="#2f7a3e" d="m9 34 3-6 3 6zM28 30l3-6 3 6zM36 32l3-6 3 6z" />
    </>
  ),
};

function PlaceMotif({ type, className = "" }) {
  return (
    <svg className={`place-motif ${className}`} x="-24" y="-24" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {motifs[type] ?? motifs.hills}
      </g>
    </svg>
  );
}

export default PlaceMotif;
