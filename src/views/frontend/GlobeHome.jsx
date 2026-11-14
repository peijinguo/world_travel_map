import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { geoCentroid, geoConicConformal, geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import CountryEmblem from "../../component/CountryEmblem";
import { PlanetOrbits, StarrySky } from "../../component/SpaceBackdrop";

// The countries on the globe. `focus` is a real [longitude, latitude] on the
// country's land: the globe turns to it, and its emblem and the projected
// map's emblem sit there. `offset` places the emblem away from the point (in
// globe units) with a dotted leader, as on the Japan map, so the European
// emblems do not pile up. `keep` is how far (in degrees) from the focus an
// island or territory may lie and still be drawn on the projected map, which
// drops far-off overseas territories such as French Guiana or Svalbard.
// eslint-disable-next-line react-refresh/only-export-components
export const globeCountries = [
  { id: "taiwan", topoId: "158", name: "台灣", en: "TAIWAN", region: "亞洲", focus: [121, 23.7], offset: [108, 46], keep: 3, note: "台北 101 與山海小島" },
  { id: "japan", topoId: "392", name: "日本", en: "JAPAN", region: "亞洲", focus: [138.5, 36.4], offset: [118, -74], keep: 11, note: "北海道到長野的雪鄉", to: "/japan" },
  { id: "iceland", topoId: "352", name: "冰島", en: "ICELAND", region: "歐洲", focus: [-18.6, 64.9], offset: [-118, -84], keep: 6, note: "極光、火山與冰河" },
  { id: "norway", topoId: "578", name: "挪威", en: "NORWAY", region: "歐洲", focus: [9, 61.5], offset: [-26, -150], keep: 12, note: "峽灣與維京船" },
  { id: "finland", topoId: "246", name: "芬蘭", en: "FINLAND", region: "歐洲", focus: [26, 63], offset: [112, -108], keep: 8, note: "馴鹿與北極圈的森林湖泊" },
  { id: "netherlands", topoId: "528", name: "荷蘭", en: "NETHERLANDS", region: "歐洲", focus: [5.4, 52.2], offset: [-150, 4], keep: 4, note: "風車與鬱金香花田" },
  { id: "france", topoId: "250", name: "法國", en: "FRANCE", region: "歐洲", focus: [2.4, 46.6], offset: [-132, 108], keep: 9, note: "艾菲爾鐵塔與阿爾卑斯雪場" },
  { id: "switzerland", topoId: "756", name: "瑞士", en: "SWITZERLAND", region: "歐洲", focus: [8.2, 46.8], offset: [62, 128], keep: 4, note: "馬特洪峰與阿爾卑斯山" },
  { id: "newZealand", topoId: "554", name: "紐西蘭", en: "NEW ZEALAND", region: "大洋洲", focus: [172.5, -41.5], offset: [116, 36], keep: 9, note: "南阿爾卑斯山與奇異鳥" },
  { id: "canada", topoId: "124", name: "加拿大", en: "CANADA", region: "北美洲", focus: [-100, 56], offset: [-64, -122], keep: 40, note: "洛磯山脈與楓葉" },
];

const SIZE = 1000;
const CENTER = [500, 540];
const RADIUS = 330;
// Degrees the globe turns per globe unit dragged.
const DRAG_SPEED = 0.28;
const START = [70, 32];

const featured = new Map(globeCountries.map((country) => [country.topoId, country]));
const graticule = geoGraticule10();
// Coastlines only (edges that belong to one country), drawn as one dark ink
// line so the land reads like the hand-drawn planets around it.
const coastline = mesh(worldTopo, worldTopo.objects.countries, (a, b) => a === b);
const sphere = { type: "Sphere" };

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const wrap = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;
const clampLat = (lat) => Math.max(-75, Math.min(75, lat));

// The detailed (1:50m) outlines are only needed once a country is opened, so
// they load in their own chunk.
let detailed;
const loadDetailed = () => {
  detailed ??= import("world-atlas/countries-50m.json").then((module) => {
    const topo = module.default ?? module;
    return feature(topo, topo.objects.countries).features;
  });
  return detailed;
};

// The country's own land, without islands and territories far from its focus.
const mainland = (shape, country) => {
  const polygons = shape.geometry.type === "Polygon" ? [shape.geometry.coordinates] : shape.geometry.coordinates;
  const near = polygons.filter((polygon) => {
    const centroid = geoCentroid({ type: "Polygon", coordinates: polygon });
    return (geoDistance(centroid, country.focus) * 180) / Math.PI <= country.keep;
  });
  return { type: "Feature", id: shape.id, properties: shape.properties, geometry: { type: "MultiPolygon", coordinates: near } };
};

// Every country on the globe. A featured country keeps only its own land, so
// picking France does not also light up French Guiana in South America (nor
// Norway, Svalbard), and tapping those territories does not pick the country.
const world = feature(worldTopo, worldTopo.objects.countries).features.map((shape) =>
  featured.has(shape.id) ? mainland(shape, featured.get(shape.id)) : shape,
);

// The card the chosen country is projected onto, above the globe. On a phone
// the globe fills the screen width, so the card spans nearly all of it and
// its text, close button and emblem grow by `ui` to stay readable.
const cardFor = (phone) => (phone
  ? { x: 30, y: 6, w: 940, h: 500, ui: 2 }
  : { x: 270, y: 34, w: 460, h: 330, ui: 1 });

const usePhoneLayout = () => {
  const query = "(max-width: 760px)";
  const [phone, setPhone] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return undefined;
    const update = () => setPhone(list.matches);
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, []);
  return phone;
};

function ProjectedCountry({ country, phone, onEnter, onClose }) {
  const CARD = cardFor(phone);
  const ui = CARD.ui;
  const [shapes, setShapes] = useState(null);

  useEffect(() => {
    let live = true;
    loadDetailed().then((features) => {
      if (!live) return;
      const shape = features.find((item) => item.id === country.topoId);
      setShapes(shape ? mainland(shape, country) : null);
    });
    return () => {
      live = false;
    };
  }, [country]);

  const drawing = useMemo(() => {
    if (!shapes) return null;
    const [lon, lat] = country.focus;
    const parallels = country.id === "canada" ? [49, 77] : [lat - 5, lat + 5];
    const projection = geoConicConformal()
      .rotate([-lon, 0])
      .parallels(parallels)
      .fitExtent([[CARD.x + 34 * ui, CARD.y + 56 * ui], [CARD.x + CARD.w - 34 * ui, CARD.y + CARD.h - 34 * ui]], shapes);
    return { d: geoPath(projection)(shapes), focus: projection(country.focus) };
  }, [shapes, country, CARD.x, CARD.y, CARD.w, CARD.h, ui]);

  const canEnter = Boolean(country.to);

  return (
    <g className="projected-country" key={country.id}>
      <path className="projector-beam" d={`M${CENTER[0]} ${CENTER[1]} L${CARD.x + 40} ${CARD.y + CARD.h} H${CARD.x + CARD.w - 40} Z`} />
      <g className="projected-card">
        <rect className="projected-card-bg" x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={26 * ui} />
        {drawing ? (
          <path className="projected-land" d={drawing.d} />
        ) : (
          <text className="projected-loading" x={CENTER[0]} y={CARD.y + CARD.h / 2} textAnchor="middle" style={{ fontSize: 16 * ui }}>載入地圖中…</text>
        )}
        <g
          className={`projected-emblem ${canEnter ? "can-enter" : ""}`}
          transform={`translate(${drawing ? drawing.focus.join(" ") : `${CENTER[0]} ${CARD.y + CARD.h / 2}`})`}
          data-action="enter"
          role="button"
          tabIndex="0"
          aria-label={canEnter ? `進入${country.name}地圖` : `${country.name}（即將推出）`}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onEnter();
            }
          }}
        >
          <g transform={`scale(${phone ? 1.25 : 1})`}>
            <g className="projected-emblem-pop">
              <circle className="projected-emblem-halo" r="34" />
              <CountryEmblem type={country.id} />
            </g>
          </g>
        </g>
        <text className="projected-name" x={CARD.x + 26 * ui} y={CARD.y + 40 * ui} style={{ fontSize: 30 * ui }}>{country.name}</text>
        <text className="projected-hint" x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h - 16 * ui} textAnchor="middle" style={{ fontSize: 14 * ui }}>
          {canEnter ? "點擊代表物，進入日本雪場地圖" : "地圖準備中，敬請期待"}
        </text>
        <g
          className="projected-close"
          transform={`translate(${CARD.x + CARD.w - 30 * ui} ${CARD.y + 30 * ui}) scale(${ui})`}
          data-action="close"
          role="button"
          tabIndex="0"
          aria-label="關閉"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClose();
            }
          }}
        >
          <circle r="15" />
          <path d="m-5-5 10 10m0-10-10 10" />
        </g>
      </g>
    </g>
  );
}

function GlobeHome() {
  const navigate = useNavigate();
  const phone = usePhoneLayout();
  // [longitude, latitude] at the centre of the globe.
  const [view, setView] = useState(START);
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [notice, setNotice] = useState("");
  const viewRef = useRef(START);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const spinning = useRef(true);
  const tween = useRef(null);

  const setCenter = (next) => {
    viewRef.current = next;
    setView(next);
  };

  const selected = globeCountries.find((country) => country.id === selectedId) ?? null;

  // Turn slowly until the visitor touches the globe or picks a country.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) spinning.current = false;
    let frame;
    let last = performance.now();
    const tick = (now) => {
      const elapsed = now - last;
      last = now;
      if (tween.current) {
        tween.current.start ??= now;
        const { from, to, start, duration } = tween.current;
        const t = Math.min(1, (now - start) / duration);
        const k = easeInOut(t);
        setCenter([wrap(from[0] + (to[0] - from[0]) * k), from[1] + (to[1] - from[1]) * k]);
        if (t === 1) tween.current = null;
      } else if (spinning.current && !drag.current) {
        const [lon, lat] = viewRef.current;
        setCenter([wrap(lon + elapsed * 0.006), lat]);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  const turnTo = ([lon, lat]) => {
    const from = viewRef.current;
    // The short way round.
    const to = [from[0] + wrap(lon - from[0]), clampLat(lat)];
    tween.current = { from, to, start: null, duration: 900 };
  };

  const select = (id) => {
    spinning.current = false;
    if (!id || id === selectedId) {
      setSelectedId(null);
      return;
    }
    const country = globeCountries.find((item) => item.id === id);
    setSelectedId(id);
    turnTo(country.focus);
  };

  const enter = () => {
    if (!selected) return;
    if (selected.to) navigate(selected.to);
    else setNotice(`${selected.name}地圖準備中，敬請期待！`);
  };

  const projection = useMemo(
    () => geoOrthographic().scale(RADIUS).translate(CENTER).rotate([-view[0], -view[1]]).clipAngle(90),
    [view],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  // Pointer position in globe units.
  const toSvg = (event) => {
    const box = svgRef.current.getBoundingClientRect();
    const scale = SIZE / Math.min(box.width, box.height);
    return [
      (event.clientX - box.left - (box.width - SIZE / scale) / 2) * scale,
      (event.clientY - box.top - (box.height - SIZE / scale) / 2) * scale,
    ];
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const target = event.target.closest?.("[data-action], [data-country]");
    drag.current = {
      start: toSvg(event),
      client: [event.clientX, event.clientY],
      view: viewRef.current,
      moved: false,
      action: target?.dataset.action ?? null,
      country: target?.dataset.country ?? null,
      onGlobe: Boolean(event.target.closest?.(".globe")),
    };
    tween.current = null;
    spinning.current = false;
    svgRef.current.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state) return;
    const [x, y] = toSvg(event);
    const dx = x - state.start[0];
    const dy = y - state.start[1];
    // A finger wobbles a little on a tap; only a real move turns the globe.
    if (!state.moved && Math.hypot(event.clientX - state.client[0], event.clientY - state.client[1]) < 8) return;
    if (!state.onGlobe) return;
    state.moved = true;
    setCenter([wrap(state.view[0] - dx * DRAG_SPEED), clampLat(state.view[1] + dy * DRAG_SPEED)]);
  };

  const onPointerUp = (event) => {
    const state = drag.current;
    drag.current = null;
    if (!state || state.moved) return;
    if (state.action === "enter") return enter();
    if (state.action === "close") return select(null);
    if (state.country) return select(state.country);
    if (state.onGlobe) {
      // A click on the globe picks the featured country under it, if any.
      const point = projection.invert(toSvg(event));
      const hit = point && world.find((shape) => featured.has(shape.id) && geoContains(shape, point));
      if (hit) return select(featured.get(hit.id).id);
    }
    if (selected && !event.target.closest?.(".projected-card")) select(null);
  };

  const isVisible = (lonLat) => geoDistance(lonLat, view) < Math.PI / 2 - 0.08;

  return (
    <div className="home-page globe-home">
      <StarrySky />
      <section className="globe-hero" aria-labelledby="globe-title">
        <h1 id="globe-title" className="visually-hidden">旅行地圖：選擇國家</h1>
        <div className="globe-stage">
          <svg
            ref={svgRef}
            className={`globe-map ${selected ? "has-selection" : ""} ${phone ? "is-phone" : ""}`}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="application"
            aria-label="可拖曳旋轉的地球，點選國家"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <defs>
              <radialGradient id="globe-ocean" cx="38%" cy="32%" r="75%">
                <stop offset="0" stopColor="#5f9fc0" />
                <stop offset=".7" stopColor="#3f7fa6" />
                <stop offset="1" stopColor="#2e6589" />
              </radialGradient>
              <radialGradient id="globe-shine" cx="34%" cy="28%" r="60%">
                <stop offset="0" stopColor="#fff" stopOpacity=".22" />
                <stop offset=".55" stopColor="#fff" stopOpacity="0" />
                <stop offset=".85" stopColor="#0b0e17" stopOpacity="0" />
                <stop offset="1" stopColor="#0b0e17" stopOpacity=".22" />
              </radialGradient>
              <radialGradient id="globe-glow">
                <stop offset=".78" stopColor="#8fc4ff" stopOpacity=".28" />
                <stop offset="1" stopColor="#8fc4ff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="projector-beam" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity=".7" />
                <stop offset="1" stopColor="#fff" stopOpacity=".08" />
              </linearGradient>
            </defs>

            <circle className="globe-glow" cx={CENTER[0]} cy={CENTER[1]} r={RADIUS + 46} />
            <PlanetOrbits center={CENTER} />

            <g className="globe">
              <circle className="globe-outline" cx={CENTER[0]} cy={CENTER[1]} r={RADIUS + 5} />
              <path className="globe-ocean" d={path(sphere)} />
              <path className="globe-graticule" d={path(graticule)} />
              {world.map((shape) => {
                const country = featured.get(shape.id);
                const d = path(shape);
                if (!d) return null;
                return (
                  <path
                    key={shape.id ?? shape.properties.name}
                    className={`globe-land ${country ? "is-featured" : ""} ${country && (country.id === selectedId || country.id === hoverId) ? "is-active" : ""}`}
                    d={d}
                    data-country={country?.id}
                    onPointerEnter={(event) => event.pointerType === "mouse" && country && setHoverId(country.id)}
                    onPointerLeave={() => country && setHoverId((id) => (id === country.id ? null : id))}
                  />
                );
              })}
              <path className="globe-coast" d={path(coastline)} />
              <path className="globe-shine" d={path(sphere)} />
              <path className="globe-rim" d={path(sphere)} />
            </g>

            <PlanetOrbits center={CENTER} front />

            <g className="globe-markers">
              {globeCountries.map((country) => {
                if (!isVisible(country.focus)) return null;
                const [x, y] = projection(country.focus);
                // Emblems pull in toward the globe as their country nears the edge.
                const edge = Math.cos(geoDistance(country.focus, view));
                const [ox, oy] = country.offset.map((value) => value * (0.55 + 0.45 * edge));
                const active = country.id === selectedId || country.id === hoverId;
                return (
                  <g
                    key={country.id}
                    className={`globe-marker ${active ? "is-active" : ""} ${selected && !active ? "is-muted" : ""}`}
                    style={{ opacity: Math.min(1, edge * 3) }}
                    data-country={country.id}
                    role="button"
                    tabIndex="0"
                    aria-label={`${country.name}：${country.note}`}
                    aria-pressed={country.id === selectedId}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setHoverId(country.id)}
                    onPointerLeave={() => setHoverId((id) => (id === country.id ? null : id))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        select(country.id);
                      }
                    }}
                  >
                    <line className="marker-leader" x1={x} y1={y} x2={x + ox} y2={y + oy} />
                    <g transform={`translate(${x + ox} ${y + oy})`}>
                      <g className="globe-marker-pop">
                        <circle className="globe-marker-halo" r="27" />
                        <CountryEmblem type={country.id} />
                        <g className="globe-marker-label" transform="translate(0 30)">
                          <rect x={-(country.name.length * 7 + 14)} y="0" width={country.name.length * 14 + 28} height="22" rx="11" />
                          <text x="0" y="15" textAnchor="middle">{country.name}</text>
                        </g>
                      </g>
                    </g>
                  </g>
                );
              })}
            </g>

            {selected && (
              <ProjectedCountry key={selected.id} country={selected} phone={phone} onEnter={enter} onClose={() => select(null)} />
            )}
          </svg>
          {notice && <p className="globe-notice" role="status">{notice}</p>}
        </div>

        <aside className="resort-panel globe-panel" aria-live="polite">
          {selected ? (
            <>
              <div className="panel-topline"><span>{selected.region}</span><span>{selected.en}</span></div>
              <div className="town-heading">
                <div className="town-illustration">
                  <svg viewBox="-24 -24 48 48" width="56" height="56"><CountryEmblem type={selected.id} /></svg>
                </div>
                <div><h2>{selected.name}</h2><p>{selected.note}</p></div>
              </div>
              <button type="button" className={`globe-enter ${selected.to ? "" : "is-soon"}`} onClick={enter}>
                {selected.to ? "進入日本雪場地圖 →" : "即將推出"}
              </button>
            </>
          ) : (
            <>
              <div className="panel-topline"><span>旅行地圖</span><span>WORLD</span></div>
              <div className="town-heading">
                <div><h2>選一個國家</h2><p>拖曳地球旋轉，點選標示的國家。</p></div>
              </div>
              <ul className="resort-list globe-list">
                {globeCountries.map((country, index) => (
                  <li key={country.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => select(country.id)}>{country.name}</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

export default GlobeHome;
