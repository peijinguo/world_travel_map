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
  // ---- More places (Taiwan, Iceland, Norway, the Netherlands, France,
  // Switzerland, New Zealand, Canada) ----
  skyscraper: (
    <>
      <path fill="#9fd0c7" d="M20 44V34l-3-1 1-5 2-1v-6l-2-1 1-5 3-1V8h6v6l3 1 1 5-2 1v6l2 1 1 5-3 1v10z" />
      <path fill="none" d="M24 8V2M19 27h10M19 20h10" />
      <path fill="none" d="M8 44h32" />
    </>
  ),
  lantern: (
    <>
      <path fill="none" d="M14 4v6M34 4v6M4 4h40" />
      <path fill="#e95459" d="M8 10h12c2 4 2 14 0 18H8c-2-4-2-14 0-18zM28 10h12c2 4 2 14 0 18H28c-2-4-2-14 0-18z" />
      <path fill="none" d="M8 15h12M8 23h12M28 15h12M28 23h12M14 28v4M34 28v4" />
      <path fill="#f2bf4e" d="M12 32h4v3h-4zM32 32h4v3h-4z" />
      <path fill="none" d="M6 44c6-3 30-3 36 0" />
    </>
  ),
  hotspring: (
    <>
      <path fill="none" stroke="#e9704f" strokeWidth="2.4" d="M16 20c-4-4 4-6 0-11M24 20c-4-4 4-6 0-11M32 20c-4-4 4-6 0-11" />
      <path fill="#9cc7df" d="M5 30c4-3 34-3 38 0v6c-4 4-34 4-38 0z" />
      <path fill="none" d="M10 33c4 1 8 1 12 0s8-1 12 0" />
      <path fill="#a7a49b" d="M3 31c-1-4 3-6 6-4 2-3 6-2 6 1-4 0-9 1-12 3zM45 31c1-4-3-6-6-4-2-3-6-2-6 1 4 0 9 1 12 3z" />
    </>
  ),
  gorge: (
    <>
      <path fill="#a7a49b" d="M3 44V8c6 2 8 8 9 14s3 12 5 22zM45 44V6c-6 3-8 9-9 15s-3 13-5 23z" />
      <path fill="#78aeca" d="M17 44c2-6 4-10 7-14 3 4 5 8 7 14z" />
      <path fill="#71a85d" d="M4 10c3-3 6-2 8 1M37 9c3-3 6-3 8 0" />
    </>
  ),
  balloon: (
    <>
      <path fill="#f2bf4e" d="M24 4c9 0 15 6 15 14 0 7-6 12-10 16H19C15 30 9 25 9 18 9 10 15 4 24 4z" />
      <path fill="none" stroke="#e95459" strokeWidth="2.4" d="M24 4c-4 4-6 10-6 15s2 10 4 15M24 4c4 4 6 10 6 15s-2 10-4 15" />
      <path fill="#b7835e" d="M19 38h10l-1 6h-8z" />
      <path fill="none" d="M19 34v4M29 34v4" />
    </>
  ),
  lake: (
    <>
      <path fill="#85ae77" d="M3 28 14 14l7 8 6-10 18 16z" />
      <path fill="#78aeca" d="M3 30c8-3 34-3 42 0v6c-8 4-34 4-42 0z" />
      <path fill="none" stroke="#fff" d="M12 33h8M26 34h9" />
      <path fill="#f4efe1" d="M33 22h6l-1 4h-4z" />
    </>
  ),
  train: (
    <>
      <path fill="#d9584c" d="M8 34V18c0-4 3-6 7-6h18c4 0 7 2 7 6v16z" />
      <path fill="#cfe9f5" d="M12 17h8v7h-8zM24 17h12v7H24z" />
      <path fill="none" d="M8 28h32" />
      <circle fill="#46535b" cx="15" cy="37" r="3" />
      <circle fill="#46535b" cx="33" cy="37" r="3" />
      <path fill="none" d="M2 42h44M6 44h2M14 44h2M22 44h2M30 44h2M38 44h2" />
    </>
  ),
  temple: (
    <>
      <path fill="#e95459" d="M4 18c6 0 10-4 20-8 10 4 14 8 20 8l-3 4H7z" />
      <path fill="#d9584c" d="M9 22h30v18H9z" />
      <path fill="#f2bf4e" d="M8 40h32v4H8z" />
      <path fill="#f4efe1" d="M20 40V28h8v12z" />
      <path fill="none" d="M14 26v14M34 26v14M24 5v5" />
    </>
  ),
  boat: (
    <>
      <path fill="#f4efe1" d="M23 6v24l-13-2z" />
      <path fill="#9cc7df" d="M25 10v20l11-3z" />
      <path fill="#d9584c" d="M6 32h36c-2 6-8 9-18 9S8 38 6 32z" />
      <path fill="none" stroke="#78aeca" d="M3 44c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  lighthouse: (
    <>
      <path fill="#f4efe1" d="M18 42l3-26h6l3 26z" />
      <path fill="none" stroke="#e95459" strokeWidth="3" d="M20 26h8M19 34h10" />
      <path fill="#46535b" d="M19 16h10l-1-5h-8z" />
      <path fill="#f2bf4e" d="M21 11h6V8h-6z" />
      <path fill="none" stroke="#f2bf4e" d="M30 10h10M30 7l8-3M8 10h10M10 4l8 3" />
      <path fill="none" d="M4 42h40" />
    </>
  ),
  beach: (
    <>
      <path fill="#f2d5a6" d="M3 34c10-4 32-4 42 0v10H3z" />
      <path fill="#78aeca" d="M3 30c6-2 12 2 18 0s12 2 18 0 6 0 6 0v6c-10-3-32-3-42 0z" />
      <path fill="none" stroke="#85ae77" strokeWidth="2.4" d="M30 34c0-10 2-18 6-24M36 10c-5-2-9 0-11 3M36 10c4-2 8 0 9 3M36 10c-2 4-1 7 1 9" />
      <circle fill="#f2bf4e" cx="12" cy="12" r="5" />
    </>
  ),
  turbine: (
    <>
      <path fill="#f4efe1" d="M23 44l1-26 1 26z" />
      <path fill="#f4efe1" d="M24 18 22 4l4 0zM24 18l12 7-2 3zM24 18 12 25l2 3z" />
      <circle fill="#9cc7df" cx="24" cy="18" r="2.6" />
      <path fill="#85ae77" d="M4 44c8-4 32-4 40 0z" />
    </>
  ),
  church: (
    <>
      <path fill="#f4efe1" d="M20 42V14l4-10 4 10v28z" />
      <path fill="#d9d4c8" d="M8 42V28l6-6 6 4v16zM40 42V28l-6-6-6 4v16z" />
      <path fill="none" d="M24 18v8M22 42v-6h4v6M4 42h40" />
    </>
  ),
  lagoon: (
    <>
      <path fill="none" stroke="#c9d8e1" d="M14 18c-3-4 3-6 0-10M24 16c-3-4 3-6 0-10M34 18c-3-4 3-6 0-10" />
      <path fill="#9fe0e2" d="M4 30c4-6 36-6 40 0v6c-6 6-34 6-40 0z" />
      <path fill="#46535b" d="M2 31c3-3 6-4 9-3l-2 6zM46 31c-3-3-6-4-9-3l2 6z" />
      <path fill="none" stroke="#fff" d="M14 33h8M27 34h7" />
    </>
  ),
  geyser: (
    <>
      <path fill="#cfe9f5" d="M20 34c-2-8-1-16 4-28 5 12 6 20 4 28z" />
      <path fill="#fff" d="M14 12c3-4 8-4 10 0 3-3 8-2 9 2-6 2-13 2-19-2z" />
      <path fill="#a7a49b" d="M4 40c6-6 12-6 16-4 4-2 10-2 24 4z" />
      <path fill="none" stroke="#78aeca" d="M18 38h12" />
    </>
  ),
  waterfall: (
    <>
      <path fill="#85ae77" d="M3 8h14v34H3zM31 8h14v34H31z" />
      <path fill="#9cc7df" d="M17 8h14v28H17z" />
      <path fill="none" stroke="#fff" d="M21 12v18M27 12v20M24 14v14" />
      <path fill="#cfe9f5" d="M10 38c4-4 24-4 28 0v6H10z" />
    </>
  ),
  glacier: (
    <>
      <path fill="#cfe9f5" d="M4 30 14 12l6 8 6-14 18 24z" />
      <path fill="#9cc7df" d="M14 12l3 10 3-2 6-14 2 16z" />
      <path fill="#78aeca" d="M3 32c8-3 34-3 42 0v8H3z" />
      <path fill="#fff" d="M12 36l4-4 4 4zM28 37l5-5 4 5z" />
    </>
  ),
  whale: (
    <>
      <path fill="#5b7280" d="M4 28c4-10 16-14 26-10 6 2 9 6 9 10-8 6-22 7-35 0z" />
      <path fill="#5b7280" d="M37 24c2-6 6-8 9-7-2 3-2 6-1 9z" />
      <path fill="none" stroke="#9cc7df" d="M14 12c-1-3 1-5 3-6M14 12c1-3 4-4 6-3" />
      <circle fill="#fff" stroke="none" cx="12" cy="24" r="1.4" />
      <path fill="none" stroke="#78aeca" d="M3 40c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  fjord: (
    <>
      <path fill="#71a85d" d="M3 40V12c5 0 8 4 10 10s3 12 4 18zM45 40V8c-5 1-8 6-10 12s-3 14-4 20z" />
      <path fill="#78aeca" d="M17 40c2-8 4-14 7-20 3 6 5 12 7 20z" />
      <path fill="#f4efe1" d="M20 36h8l-1 3h-6z" />
      <path fill="none" stroke="#9cc7df" d="M8 16v10M40 12v12" />
    </>
  ),
  mountain: (
    <>
      <path fill="#7daac4" d="M2 42 20 8l6 10 4-4 16 28z" />
      <path fill="#fff" d="m14 20 6-12 6 10 4-4 6 9-6-3-4 4-4-5-4 4z" />
      <path fill="none" d="M2 43c12-2 31 2 44-1" />
    </>
  ),
  opera: (
    <>
      <path fill="#f4efe1" d="M3 38 20 14h12l13 24z" />
      <path fill="#9cc7df" d="M20 14v24h12V14z" />
      <path fill="none" d="M24 14v24M28 14v24" />
      <path fill="none" stroke="#78aeca" d="M3 43c5-2 9 2 14 0s9 2 14 0 9 2 14 0" />
    </>
  ),
  fish: (
    <>
      <path fill="none" d="M10 6v36M38 6v36M6 8h36" />
      <path fill="#c99867" d="M16 10c3 0 4 3 4 8s-2 9-4 9-4-4-4-9 1-8 4-8zM32 10c3 0 4 3 4 8s-2 9-4 9-4-4-4-9 1-8 4-8z" />
      <path fill="#c99867" d="M13 27h6l-3 4zM29 27h6l-3 4z" />
      <path fill="none" d="M24 8v28" />
      <path fill="#d9584c" d="M18 36h12v8H18z" />
    </>
  ),
  globe: (
    <>
      <circle fill="#9cc7df" cx="24" cy="20" r="14" />
      <path fill="none" d="M10 20h28M24 6c6 8 6 20 0 28M24 6c-6 8-6 20 0 28M13 12c7 3 15 3 22 0M13 28c7-3 15-3 22 0" />
      <path fill="#a7a49b" d="M18 36h12l2 8H16z" />
    </>
  ),
  canal: (
    <>
      <path fill="#b7835e" d="M3 30V12l5-6 5 6v18zM13 30V10l5-6 5 6v20zM25 30V12l5-6 5 6v18zM35 30V10l5-6 5 6v20z" />
      <path fill="none" d="M6 16h4M16 14h4M28 16h4M38 14h4M6 22h4M16 20h4M28 22h4M38 20h4" />
      <path fill="#78aeca" d="M2 32h44v12H2z" />
      <path fill="#f4efe1" d="M14 36h20l-3 4H17z" />
    </>
  ),
  windmill: (
    <>
      <path fill="#f4efe1" d="M17 44 19 22h10l2 22z" />
      <path fill="#b7835e" d="M17 22c0-4 3-7 7-7s7 3 7 7z" />
      <path fill="none" stroke="#5b7280" strokeWidth="2.2" d="m10 7 28 24M38 7 10 31" />
      <circle fill="#f2bf4e" cx="24" cy="19" r="2.2" />
      <path fill="#b7835e" d="M22 44v-6c0-2 4-2 4 0v6z" />
      <path fill="none" d="M3 44h42" />
    </>
  ),
  tulip: (
    <>
      <path fill="none" stroke="#71a85d" strokeWidth="2.2" d="M12 44V26M24 44V22M36 44V26" />
      <path fill="#71a85d" d="M24 36c-6-2-8-6-8-10 5 1 8 4 8 10zM24 36c6-2 8-6 8-10-5 1-8 4-8 10z" />
      <path fill="#e95459" d="M7 26c0-6 2-10 5-10s5 4 5 10zM31 26c0-6 2-10 5-10s5 4 5 10z" />
      <path fill="#f2bf4e" d="M19 22c0-7 2-12 5-12s5 5 5 12z" />
      <path fill="none" d="M10 16l2 4 2-4M22 10l2 4 2-4M34 16l2 4 2-4" />
    </>
  ),
  cheese: (
    <>
      <path fill="#f2bf4e" d="M4 30 30 12l14 10v14L4 38z" />
      <path fill="#e8a44e" d="M4 30h40v8H4z" />
      <circle fill="#fbe3a0" cx="20" cy="24" r="3" />
      <circle fill="#fbe3a0" cx="32" cy="20" r="2.4" />
      <circle fill="#fbe3a0" cx="36" cy="27" r="2" />
    </>
  ),
  bike: (
    <>
      <circle fill="#cfe9f5" cx="12" cy="32" r="8" />
      <circle fill="#cfe9f5" cx="36" cy="32" r="8" />
      <path fill="none" stroke="#e95459" strokeWidth="2.4" d="m12 32 8-14h14l2 14M20 18l6 14 8-14M18 14h6M32 14l2 4" />
    </>
  ),
  eiffel: (
    <>
      <path fill="#c38a60" d="M23 6h2l2 12 3 12 6 14h-7c-1-4-3-6-5-6s-4 2-5 6h-7l6-14 3-12z" />
      <path fill="none" d="M24 2v4M20 18h8M17 30h14M21 24h6M9 44h30" />
    </>
  ),
  wine: (
    <>
      <path fill="#8a2f3c" d="M8 14h12l-1 10c0 4-2 6-5 6s-5-2-5-6z" />
      <path fill="none" d="M14 30v10M10 40h8" />
      <path fill="#4f8a45" d="M28 10h6v6c3 2 5 5 5 9v17H23V25c0-4 2-7 5-9z" />
      <path fill="#f4efe1" d="M25 28h12v8H25z" />
    </>
  ),
  lavender: (
    <>
      <path fill="#85ae77" d="M2 44c6-6 38-6 44 0z" />
      <path fill="none" stroke="#8f78ba" strokeWidth="5" d="M8 40l4-12M18 40l2-14M28 40l0-14M38 40l-2-12" />
      <path fill="none" stroke="#71a85d" d="M8 41v-4M18 41v-4M28 41v-4M38 41v-4" />
      <circle fill="#f2bf4e" cx="38" cy="10" r="5" />
    </>
  ),
  abbey: (
    <>
      <path fill="#a7a49b" d="M6 40c2-10 8-16 18-22 10 6 16 12 18 22z" />
      <path fill="#d9d4c8" d="M20 22V12h8v10z" />
      <path fill="none" d="M24 12V3M12 32h24M16 26h16" />
      <path fill="#78aeca" d="M2 40c8-2 36-2 44 0v4H2z" />
    </>
  ),
  bridge: (
    <>
      <path fill="#b7835e" d="M3 22 24 14l21 8v4H3z" />
      <path fill="none" d="M8 26v10M16 24v12M32 24v12M40 26v10" />
      <path fill="#d9d4c8" d="M22 12h6v14h-6zM22 12l3-6 3 6z" />
      <path fill="#78aeca" d="M2 36h44v8H2z" />
    </>
  ),
  fountain: (
    <>
      <path fill="none" stroke="#9cc7df" strokeWidth="3" d="M24 38V6" />
      <path fill="#cfe9f5" d="M18 8c2-4 10-4 12 0-4 2-8 2-12 0z" />
      <path fill="#78aeca" d="M3 38c8-3 34-3 42 0v6H3z" />
      <path fill="none" stroke="#fff" d="M12 41h8M28 41h8" />
    </>
  ),
  bear: (
    <>
      <circle fill="#f4efe1" cx="14" cy="14" r="5" />
      <circle fill="#f4efe1" cx="34" cy="14" r="5" />
      <path fill="#f4efe1" d="M12 28c0-11 5-17 12-17s12 6 12 17c0 9-5 13-12 13s-12-4-12-13z" />
      <circle fill="#283033" stroke="none" cx="20" cy="25" r="1.4" />
      <circle fill="#283033" stroke="none" cx="28" cy="25" r="1.4" />
      <path fill="#283033" d="M22 31h4l-2 2z" />
    </>
  ),
  cow: (
    <>
      <path fill="#f4efe1" d="M12 20c0-6 5-10 12-10s12 4 12 10v10c0 6-5 10-12 10s-12-4-12-10z" />
      <path fill="#46535b" d="M14 14c4 0 6 3 6 6-4 0-6-2-6-6zM34 22c-3 0-5 3-4 6 3 0 5-2 4-6z" />
      <path fill="#f2c5b6" d="M16 32c0-3 4-4 8-4s8 1 8 4-4 6-8 6-8-3-8-6z" />
      <path fill="none" d="M12 16 6 12M36 16l6-4M21 33v1M27 33v1" />
      <path fill="#f2bf4e" d="M22 40h4v4h-4z" />
    </>
  ),
  hobbit: (
    <>
      <path fill="#85ae77" d="M2 30c4-14 14-20 22-20s18 6 22 20z" />
      <circle fill="#71a85d" cx="24" cy="30" r="11" />
      <circle fill="#f2bf4e" cx="24" cy="30" r="8" />
      <circle fill="#283033" stroke="none" cx="27" cy="30" r="1.2" />
      <path fill="#a7a49b" d="M4 44c4-4 36-4 40 0z" />
    </>
  ),
  volcano: (
    <>
      <path fill="#5b7280" d="M3 42 17 18h14l14 24z" />
      <path fill="#e87543" d="M17 18h14l-3 6-4-2-3 3-2-4z" />
      <path fill="#c9d8e1" d="M18 12c-3-3 0-7 4-6 2-3 7-2 7 2 3 0 4 3 2 5-4 1-9 1-13-1z" />
      <path fill="#78aeca" d="M30 38c4-2 8-2 10 0-3 2-7 2-10 0z" />
    </>
  ),
  cablecar: (
    <>
      <path fill="none" d="M2 8c14 4 30 4 44 0M24 11v7" />
      <path fill="#e95459" d="M14 18h20c2 0 3 2 3 4l-2 14c0 2-1 3-3 3H16c-2 0-3-1-3-3l-2-14c0-2 1-4 3-4z" />
      <path fill="#cfe9f5" d="M16 22h7v7h-7zM25 22h7v7h-7z" />
      <path fill="#85ae77" d="M2 44c10-6 34-6 44 0z" />
    </>
  ),
  bungy: (
    <>
      <path fill="#a7a49b" d="M3 6h14v38H3zM31 6h14v38H31z" />
      <path fill="#b7835e" d="M3 6h42v5H3z" />
      <path fill="none" stroke="#e95459" strokeWidth="2" d="M24 11c-2 6 2 10 0 16" />
      <circle fill="#f2bf4e" cx="24" cy="30" r="3" />
      <path fill="none" d="M24 33v5M21 36h6" />
      <path fill="#78aeca" d="M17 40h14v4H17z" />
    </>
  ),
  totem: (
    <>
      <path fill="#c38a60" d="M18 44V6h12v38z" />
      <path fill="#e95459" d="M10 8h28v6H10z" />
      <circle fill="#fff" cx="21" cy="20" r="2" />
      <circle fill="#fff" cx="27" cy="20" r="2" />
      <path fill="#71a85d" d="M18 26h12v6H18z" />
      <path fill="none" d="M20 36h8M18 40h12" />
    </>
  ),
  greenGables: (
    <>
      <path fill="#f4efe1" d="M8 42V22l10-10 10 10v20zM28 42V26h12v16z" />
      <path fill="#4f8a45" d="M6 23 18 10l12 13zM26 27l8-6 8 6z" />
      <path fill="#4f8a45" d="M15 30h6v6h-6zM31 30h6v5h-6z" />
      <path fill="none" d="M4 42h40" />
    </>
  ),
  cliff: (
    <>
      <path fill="#a7a49b" d="M3 44V18h24l4 26z" />
      <path fill="#85ae77" d="M3 18h24l-2 4H3z" />
      <path fill="#78aeca" d="M31 44c2-10 6-14 14-14v14z" />
      <circle fill="#e9704f" cx="22" cy="14" r="2" />
      <path fill="none" d="M22 16v-0M45 20v0" />
    </>
  ),
  timberHouse: (
    <>
      <path fill="#f4d59e" d="M8 42V20l16-12 16 12v22z" />
      <path fill="#d9584c" d="M6 21 24 6l18 15z" />
      <path fill="none" d="M8 28h32M8 35h32M16 20v22M32 20v22M16 28l8 7 8-7" />
      <path fill="#cfe9f5" d="M20 36h8v6h-8z" />
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
