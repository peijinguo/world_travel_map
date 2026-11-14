import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { geoConicConformal, geoPath } from "d3-geo";
import CountryEmblem from "../../component/CountryEmblem";
import HomeWaves from "../../component/HomeWaves";
import { countryBase, countryById, loadDetailed, mainland } from "../../data/countries";

// A country's own home page, in the style of the Japan map (Home.jsx): the
// country drawn large in deep green on the sea of waves, its hand-drawn
// emblem on a dotted leader, and the white panel listing its pages.
const SIZE = 1000;

const pages = [
  { path: "prep", name: "行前準備", note: "出發前的清單" },
  { path: "planner", name: "行程規劃", note: "每天的路線與地圖" },
  { path: "hotel", name: "機票住宿", note: "航班與住宿" },
  { path: "wishlist", name: "想吃清單", note: "想吃的店與菜單" },
];

function CountryHome() {
  const { country: countryId } = useParams();
  const country = countryById(countryId);
  const [shape, setShape] = useState(null);

  useEffect(() => {
    if (!country) return undefined;
    let live = true;
    loadDetailed().then((features) => {
      const found = features.find((item) => item.id === country.topoId);
      if (live) setShape(found ? mainland(found, country) : null);
    });
    return () => {
      live = false;
    };
  }, [country]);

  const drawing = useMemo(() => {
    if (!shape || !country) return null;
    const [lon, lat] = country.focus;
    const projection = geoConicConformal()
      .rotate([-lon, 0])
      .parallels(country.id === "canada" ? [49, 77] : [lat - 5, lat + 5])
      .fitExtent([[60, 60], [SIZE - 60, SIZE - 60]], shape);
    const path = geoPath(projection);
    return {
      paths: shape.geometry.coordinates.map((polygon) => path({ type: "Polygon", coordinates: polygon })),
      focus: projection(country.focus),
    };
  }, [shape, country]);

  // Japan has its own snow map; unknown ids go back to the globe.
  if (countryId === "japan") return <Navigate to="/japan" replace />;
  if (!country) return <Navigate to="/" replace />;

  const base = countryBase(country.id);
  // The emblem floats beside the land, towards the open sea at the top left
  // or right, whichever side of the map the focus point is not on.
  const [fx, fy] = drawing?.focus ?? [SIZE / 2, SIZE / 2];
  const clamp = (value) => Math.min(SIZE - 120, Math.max(120, value));
  const emblem = [clamp(fx + (fx > SIZE / 2 ? -270 : 270)), clamp(fy - 240)];

  return (
    <div className="home-page country-home">
      <HomeWaves />
      <section className="country-hero" aria-labelledby="country-title">
        <h1 id="country-title" className="visually-hidden">{country.name}旅行地圖</h1>
        <div className="country-stage">
          <svg className="country-map" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${country.name}地圖`}>
            {drawing ? (
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

        <aside className="resort-panel country-panel">
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
        </aside>
      </section>
    </div>
  );
}

export default CountryHome;
