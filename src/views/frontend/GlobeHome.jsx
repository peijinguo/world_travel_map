import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { geoConicConformal, geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import CountryEmblem from "../../component/CountryEmblem";
import { countryHomePath, globeCountries, loadDetailed, mainland } from "../../data/countries";
import { PlanetOrbits, StarrySky } from "../../component/SpaceBackdrop";

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

// Every country on the globe. A featured country keeps only its own land, so
// picking France does not also light up French Guiana in South America (nor
// Norway, Svalbard), and tapping those territories does not pick the country.
const world = feature(worldTopo, worldTopo.objects.countries).features.map((shape) =>
  featured.has(shape.id) ? mainland(shape, featured.get(shape.id)) : shape,
);

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

// How big the country emblems on the globe are drawn.
const MARKER_SCALE = 1.6;

// The chosen country's outline, drawn in the side panel above the button
// that enters its map, with its emblem where the globe's marker points.
const PANEL_MAP = { w: 400, h: 230, pad: 14 };
function CountryOutline({ country }) {
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
    const { w, h, pad } = PANEL_MAP;
    const projection = geoConicConformal()
      .rotate([-lon, 0])
      .parallels(parallels)
      .fitExtent([[pad, pad], [w - pad, h - pad]], shapes);
    return { d: geoPath(projection)(shapes), focus: projection(country.focus) };
  }, [shapes, country]);

  return (
    <svg className="globe-panel-map" viewBox={`0 0 ${PANEL_MAP.w} ${PANEL_MAP.h}`} aria-hidden="true">
      {drawing ? (
        <>
          <path className="projected-land" d={drawing.d} />
          <g transform={`translate(${drawing.focus.join(" ")})`}>
            <g className="projected-emblem-pop">
              <circle className="projected-emblem-halo" r="30" />
              <CountryEmblem type={country.id} />
            </g>
          </g>
        </>
      ) : (
        <text className="projected-loading" x={PANEL_MAP.w / 2} y={PANEL_MAP.h / 2} textAnchor="middle">載入地圖中…</text>
      )}
    </svg>
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
    // flushSync: the globe re-renders every frame, which would keep
    // interrupting the router's deferred (transition) page change.
    navigate(countryHomePath(selected.id), { flushSync: true });
    // The button sits below the globe; open the country's map at its top.
    window.scrollTo({ top: 0, behavior: "instant" });
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
    const target = event.target.closest?.("[data-country]");
    drag.current = {
      start: toSvg(event),
      client: [event.clientX, event.clientY],
      view: viewRef.current,
      moved: false,
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
    if (state.country) return select(state.country);
    if (state.onGlobe) {
      // A click on the globe picks the featured country under it, if any.
      const point = projection.invert(toSvg(event));
      const hit = point && world.find((shape) => featured.has(shape.id) && geoContains(shape, point));
      if (hit) return select(featured.get(hit.id).id);
    }
    if (selected) select(null);
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
                <stop offset="0" stopColor="#76b1cf" />
                <stop offset=".7" stopColor="#5593b7" />
                <stop offset="1" stopColor="#427b9f" />
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
                    <g transform={`translate(${x + ox} ${y + oy}) scale(${MARKER_SCALE})`}>
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

          </svg>
          {notice && <p className="globe-notice" role="status">{notice}</p>}
        </div>

        <aside className="resort-panel globe-panel" aria-live="polite">
          {selected ? (
            <>
              <div className="panel-topline"><span>{selected.region}</span><span>{selected.en}</span></div>
              <div className="town-heading">
                <div><h2>{selected.name}</h2><p>{selected.note}</p></div>
              </div>
              <CountryOutline key={selected.id} country={selected} />
              <button type="button" className="globe-enter" onClick={enter}>
                {selected.id === "japan" ? "進入日本雪場地圖 →" : `進入${selected.name}地圖 →`}
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
