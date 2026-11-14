import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { geoConicConformal, geoPath } from "d3-geo";
import CountryEmblem from "../../component/CountryEmblem";
import HomeWaves from "../../component/HomeWaves";
import PlaceMotif from "../../component/PlaceMotif";
import { countryBase, countryById, loadDetailed, mainland } from "../../data/countries";
import { countryPlaces, loadRegions } from "../../data/places";

// A country's own home page, in the style of the Japan map (Home.jsx): the
// country drawn large in deep green on the sea of waves, and the white panel
// listing its pages. A country with places (src/data/places.js) is drawn by
// region with a hand-drawn motif on a dotted leader for each place, exactly
// like the snow towns on the Japan map; the others show their emblem.
const SIZE = 1000;
// The Japan map's markers are drawn on a map about 570 units wide; this map
// is 1000, so the markers are scaled up to look the same size.
const MARKER_SCALE = 1.75;

const pages = [
  { path: "prep", name: "行前準備", note: "出發前的清單" },
  { path: "planner", name: "行程規劃", note: "每天的路線與地圖" },
  { path: "hotel", name: "機票住宿", note: "航班與住宿" },
  { path: "wishlist", name: "想吃清單", note: "想吃的店與菜單" },
];

// With places, the land leaves a margin all round for their motifs.
const makeProjection = (country, shape, margin = [60, 60, 60, 60]) => {
  const [lon, lat] = country.focus;
  const [top, right, bottom, left] = margin;
  return geoConicConformal()
    .rotate([-lon, 0])
    .parallels(country.id === "canada" ? [49, 77] : [lat - 5, lat + 5])
    .fitExtent([[left, top], [SIZE - right, SIZE - bottom]], shape);
};

function CountryHome() {
  const { country: countryId } = useParams();
  const country = countryById(countryId);
  const places = useMemo(() => countryPlaces[countryId] ?? [], [countryId]);
  const [shape, setShape] = useState(null);
  const [regions, setRegions] = useState(null);
  const [activeId, setActiveId] = useState(null);
  // A clicked place stays on the panel; until then hovering previews places.
  const [pinnedId, setPinnedId] = useState(null);

  useEffect(() => {
    if (!country) return undefined;
    let live = true;
    (places.length ? loadRegions(country.id) : Promise.resolve(null)).then((data) => {
      if (live && data) setRegions(data.features);
    });
    loadDetailed().then((features) => {
      const found = features.find((item) => item.id === country.topoId);
      if (live) setShape(found ? mainland(found, country) : null);
    });
    return () => {
      live = false;
    };
  }, [country, places]);

  const drawing = useMemo(() => {
    if (!country) return null;
    if (regions) {
      const projection = makeProjection(country, { type: "FeatureCollection", features: regions }, [70, 170, 150, 170]);
      const path = geoPath(projection);
      return {
        regions: regions.map((region) => ({ id: region.id, name: region.properties.name, d: path(region) })),
        project: projection,
        focus: projection(country.focus),
      };
    }
    if (!shape) return null;
    const projection = makeProjection(country, shape);
    const path = geoPath(projection);
    return {
      paths: shape.geometry.coordinates.map((polygon) => path({ type: "Polygon", coordinates: polygon })),
      project: projection,
      focus: projection(country.focus),
    };
  }, [shape, regions, country]);

  // Japan has its own snow map; unknown ids go back to the globe.
  if (countryId === "japan") return <Navigate to="/japan" replace />;
  if (!country) return <Navigate to="/" replace />;

  const base = countryBase(country.id);
  const activePlace = places.find((place) => place.id === activeId) ?? places[0] ?? null;
  const preview = (id) => {
    if (!pinnedId) setActiveId(id);
  };
  const pick = (id) => {
    setActiveId(id);
    setPinnedId((pinned) => (pinned === id ? null : id));
  };

  // Without places, the emblem floats beside the land, towards the open sea.
  const [fx, fy] = drawing?.focus ?? [SIZE / 2, SIZE / 2];
  const clamp = (value) => Math.min(SIZE - 120, Math.max(120, value));
  const emblem = [clamp(fx + (fx > SIZE / 2 ? -270 : 270)), clamp(fy - 240)];

  // Where each motif sits: pushed out from its place (by its offset, or
  // straight out from the map's middle), then nudged apart from its
  // neighbours and kept inside the map, so no two motifs overlap.
  const motifSpots = new Map();
  if (drawing?.regions) {
    const spots = places.map((place) => {
      const [x, y] = drawing.project(place.lonLat);
      let [ox, oy] = place.offset ?? [0, 0];
      if (!place.offset) {
        const dx = x - SIZE / 2;
        const dy = y - SIZE * 0.45;
        const length = Math.hypot(dx, dy) || 1;
        [ox, oy] = [(dx / length) * 150, (dy / length) * 150];
      }
      return { id: place.id, x: x + ox, y: y + oy };
    });
    const GAP = 118;
    const keepInside = (spot) => {
      spot.x = Math.min(SIZE - 70, Math.max(70, spot.x));
      spot.y = Math.min(SIZE - 110, Math.max(70, spot.y));
    };
    for (let round = 0; round < 80; round += 1) {
      spots.forEach((a, i) => {
        spots.slice(i + 1).forEach((b) => {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 0.01;
          if (distance >= GAP) return;
          const push = (GAP - distance) / 2;
          a.x -= (dx / distance) * push;
          a.y -= (dy / distance) * push;
          b.x += (dx / distance) * push;
          b.y += (dy / distance) * push;
        });
      });
      spots.forEach(keepInside);
    }
    spots.forEach((spot) => motifSpots.set(spot.id, [Math.round(spot.x), Math.round(spot.y)]));
  }

  const marker = (place) => {
    const [x, y] = drawing.project(place.lonLat);
    const [mx, my] = motifSpots.get(place.id);
    const [ox, oy] = [mx - x, my - y];
    const active = place.id === activePlace?.id;
    return (
      <g
        key={place.id}
        className={`town-marker ${active ? "is-active" : ""}`}
        role="button"
        tabIndex="0"
        aria-label={`${place.name}：${place.note}`}
        aria-pressed={active}
        onPointerEnter={(event) => event.pointerType === "mouse" && preview(place.id)}
        onFocus={() => preview(place.id)}
        onClick={() => pick(place.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            pick(place.id);
          }
        }}
      >
        {drawing.regions
          .filter((region) => region.id === place.region)
          .map((region) => (
            <path key={region.id} className="municipality-shape" d={region.d} fillRule="evenodd" />
          ))}
        <g className="marker-position" transform={`translate(${x} ${y})`}>
          <line className="marker-leader country-place-leader" x1="0" y1="0" x2={ox} y2={oy} />
          <circle className="country-place-dot" r="5" />
          <g transform={`translate(${ox} ${oy}) scale(${MARKER_SCALE})`}>
            <g className="marker-visual">
              <g className="marker-pop">
                <PlaceMotif type={place.motif} />
                <g className="marker-label" transform="translate(0 25)">
                  <rect x={-(place.name.length * 6 + 10)} y="0" width={place.name.length * 12 + 20} height="23" rx="11.5" />
                  <text x="0" y="15" textAnchor="middle">{place.name}</text>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    );
  };

  // The active place is drawn last so it sits on top of its neighbours.
  const orderedPlaces = activePlace
    ? [...places.filter((place) => place.id !== activePlace.id), activePlace]
    : places;

  return (
    <div className="home-page country-home">
      <HomeWaves />
      <section className="country-hero" aria-labelledby="country-title">
        <h1 id="country-title" className="visually-hidden">{country.name}旅行地圖</h1>
        <div className="country-stage">
          <svg className="country-map" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${country.name}地圖`}>
            {drawing?.regions ? (
              <>
                <g className="country-geography" aria-hidden="true">
                  {drawing.regions.map((region) => (
                    <path key={region.id} className="prefecture-shape" d={region.d} fillRule="evenodd" />
                  ))}
                </g>
                {orderedPlaces.map(marker)}
              </>
            ) : drawing ? (
              <>
                <g className="country-geography">
                  {drawing.paths.map((d, index) => (
                    <path key={index} className="prefecture-shape" d={d} fillRule="evenodd" />
                  ))}
                </g>
                <line className="marker-leader country-map-leader" x1={fx} y1={fy} x2={emblem[0]} y2={emblem[1]} />
                <circle className="country-map-dot" cx={fx} cy={fy} r="7" />
                <g transform={`translate(${emblem[0]} ${emblem[1]})`}>
                  <g className="country-map-emblem">
                    <circle className="country-map-halo" r="34" />
                    <CountryEmblem type={country.id} />
                    <g transform="translate(0 46)">
                      <rect x={-(country.name.length * 9 + 16)} y="0" width={country.name.length * 18 + 32} height="30" rx="15" className="country-map-label" />
                      <text x="0" y="21" textAnchor="middle" className="country-map-label-text">{country.name}</text>
                    </g>
                  </g>
                </g>
              </>
            ) : (
              <text x={SIZE / 2} y={SIZE / 2} textAnchor="middle" className="country-map-loading">載入地圖中…</text>
            )}
          </svg>
        </div>

        <aside className="resort-panel country-panel" aria-live="polite">
          {activePlace ? (
            <>
              <div className="panel-topline">
                <span>{drawing?.regions?.find((region) => region.id === activePlace.region)?.name ?? country.name}</span>
                <span>{activePlace.en}</span>
              </div>
              <div className="town-heading">
                <div className="town-illustration">
                  <svg viewBox="-24 -24 48 48" width="56" height="56"><PlaceMotif type={activePlace.motif} /></svg>
                </div>
                <div>
                  <h2><span className="brush-title">{activePlace.name}</span></h2>
                  <p>{activePlace.note}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="panel-topline"><span>{country.region}</span><span>{country.en}</span></div>
              <div className="town-heading">
                <div className="town-illustration">
                  <svg viewBox="-24 -24 48 48" width="56" height="56"><CountryEmblem type={country.id} /></svg>
                </div>
                <div>
                  <h2><span className="brush-title">{country.name}</span></h2>
                  <p>{country.note}</p>
                </div>
              </div>
            </>
          )}
          {activePlace?.spots ? (
            // Like the Japan map's town card listing its ski resorts: the
            // place's sights, each opening its own page (SpotDetail.jsx).
            <ul className="resort-list">
              {activePlace.spots.map((spot, index) => (
                <li key={spot.en}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Link to={`/c/${country.id}/spot/${activePlace.id}/${index}`}>
                    {spot.name}
                    <small>{spot.en}</small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="resort-list">
              {pages.map((page, index) => (
                <li key={page.path}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Link to={`${base}/${page.path}`}>
                    {page.name}
                    <small>{page.note}</small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}

// A fresh map for each country, so moving from one country's page straight
// to another's never shows the last country's map or place.
function CountryHomeRoute() {
  const { country } = useParams();
  return <CountryHome key={country} />;
}

export default CountryHomeRoute;
