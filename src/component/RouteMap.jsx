import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import girlAvatar from "../assets/route-avatar-girl.webp";
import boyAvatar from "../assets/route-avatar-boy.webp";

// Transitous requires a source link and contact details beside its transit times.
const TRANSIT_ATTRIBUTION =
  '<a href="https://transitous.org/sources/" target="_blank" rel="noreferrer">Transitous</a> | ' +
  '<a href="https://github.com/peijinguo/travel-map" target="_blank" rel="noreferrer">專案聯絡</a>';
// Standard OpenStreetMap raster tiles; no API key needed.
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};
const JAPAN_CENTER = [137.7, 38.2];
const JAPAN_ZOOM = 4;
const ROUTE_SOURCE_ID = "planner-route";

function getOverlappingMarkerOffsets(coordinates) {
  const groups = [];
  const overlapDistance = 0.001;

  coordinates.forEach(([lng, lat], index) => {
    const group = groups.find(({ center }) => {
      const latitudeScale = Math.cos((lat * Math.PI) / 180);
      const latGap = lat - center.lat;
      const lngGap = (lng - center.lng) * latitudeScale;
      return Math.hypot(latGap, lngGap) < overlapDistance;
    });

    if (group) {
      group.items.push({ lat, lng, index });
      const total = group.items.length;
      group.center = group.items.reduce(
        (center, item) => ({
          lat: center.lat + item.lat / total,
          lng: center.lng + item.lng / total,
        }),
        { lat: 0, lng: 0 },
      );
    } else {
      groups.push({ center: { lat, lng }, items: [{ lat, lng, index }] });
    }
  });

  const offsets = coordinates.map(() => [0, 0]);
  groups.forEach(({ items }) => {
    if (items.length < 2) return;
    const radius = 24;
    items.forEach(({ index }, itemIndex) => {
      if (itemIndex === 0) return;
      const angle = (Math.PI * 2 * (itemIndex - 1)) / (items.length - 1);
      offsets[index] = [
        Math.round(Math.cos(angle) * radius),
        Math.round(Math.sin(angle) * radius),
      ];
    });
  });

  return offsets;
}

// Each leg follows its road or rail path when one was found, so the stops
// are joined the way the trip actually goes instead of in straight lines.
const makeRouteLine = (coordinates, paths = []) => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "MultiLineString",
    coordinates: coordinates.slice(0, -1).map((start, index) => {
      const end = coordinates[index + 1];
      const path = paths[index];
      return path?.length > 1 ? [start, ...path, end] : [start, end];
    }),
  },
});

// The drawn line keeps one shape at every zoom: the route as it looks with the
// whole trip in view, without the small road bends that zooming in reveals.
// Points closer than this share of the trip's size to the simplified line drop.
const SMOOTH_SHARE = 0.006;
const toMeters = ([lng, lat], latScale) => [lng * latScale * 111320, lat * 110540];
const distanceToSegment = ([x, y], [x1, y1], [x2, y2]) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length)) : 0;
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
};
// Douglas–Peucker on one leg, in meters.
const simplifyLeg = (points, metric, tolerance) => {
  if (points.length < 3) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let farthest = -1;
    let farthestDistance = tolerance;
    for (let i = first + 1; i < last; i += 1) {
      const distance = distanceToSegment(metric[i], metric[first], metric[last]);
      if (distance > farthestDistance) {
        farthest = i;
        farthestDistance = distance;
      }
    }
    if (farthest > 0) {
      keep[farthest] = true;
      stack.push([first, farthest], [farthest, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
};
const smoothRouteLine = (feature) => {
  const legs = feature.geometry.coordinates;
  const all = legs.flat();
  if (all.length < 3) return feature;
  const lats = all.map(([, lat]) => lat);
  const latScale = Math.cos((((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI) / 180);
  const metric = all.map((point) => toMeters(point, latScale));
  const xs = metric.map(([x]) => x);
  const ys = metric.map(([, y]) => y);
  const size = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const tolerance = Math.max(size * SMOOTH_SHARE, 15);
  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: legs.map((leg) => simplifyLeg(leg, leg.map((point) => toMeters(point, latScale)), tolerance)),
    },
  };
};

// The route is drawn as a trail of footprints, left and right steps turned to
// face the way the trip goes, with a darker wave of fresh prints walking
// forward from stop to stop.
const FOOTPRINT_SOURCE_ID = "planner-footprints";
const STEP_METERS = 20;
const MAX_STEPS_PER_LEG = 4000;
// Zoomed out, only every 2^k-th step is drawn so the prints stay evenly
// spaced on screen: k = 0 at zoom 16 and grows by one per zoom level (16
// rather than 17 keeps the trail twice as dense as one print per step width).
const FOOTPRINT_MIN_ZOOM = 13;
const FOOTPRINT_FULL_ZOOM = 16;
const skipLevels = Array.from(
  { length: FOOTPRINT_FULL_ZOOM - FOOTPRINT_MIN_ZOOM + 1 },
  (_, index) => ({ zoom: FOOTPRINT_MIN_ZOOM + index, k: FOOTPRINT_FULL_ZOOM - FOOTPRINT_MIN_ZOOM - index }),
);
// One expression per zoom level, switched by a top-level zoom step.
const byZoom = (makeExpression) => [
  "step",
  ["zoom"],
  makeExpression(skipLevels[0].k),
  ...skipLevels.slice(1).flatMap(({ zoom, k }) => [zoom, makeExpression(k)]),
];
const shownStep = (k) => ["floor", ["/", ["get", "step"], 2 ** k]];
const isLeftFoot = (k) => ["==", ["%", shownStep(k), 2], 0];
const STEP_TRAIL = 8; // prints behind the walker still showing (two pairs, then two fading)
const STEP_PAUSE = 1; // ticks the walker waits at the last stop before starting over
const STEP_TICK_MS = 340;

const metersBetween = ([lng1, lat1], [lng2, lat2]) => {
  const latScale = Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const dx = (lng2 - lng1) * latScale * 111320;
  const dy = (lat2 - lat1) * 110540;
  return Math.hypot(dx, dy);
};
const bearingBetween = ([lng1, lat1], [lng2, lat2]) => {
  const latScale = Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  return (Math.atan2((lng2 - lng1) * latScale, lat2 - lat1) * 180) / Math.PI;
};

const makeFootprints = (routeLine) => {
  const features = [];
  let step = 0;
  routeLine.geometry.coordinates.forEach((leg) => {
    const lengths = leg.slice(1).map((point, index) => metersBetween(leg[index], point));
    const total = lengths.reduce((sum, length) => sum + length, 0);
    if (!total) return;
    const spacing = Math.max(STEP_METERS, total / MAX_STEPS_PER_LEG);
    let segment = 0;
    let walked = 0;
    for (let at = spacing / 2; at < total; at += spacing) {
      while (segment < lengths.length - 1 && walked + lengths[segment] < at) {
        walked += lengths[segment];
        segment += 1;
      }
      const [start, end] = [leg[segment], leg[segment + 1]];
      const ratio = lengths[segment] ? (at - walked) / lengths[segment] : 0;
      features.push({
        type: "Feature",
        properties: {
          step,
          // How many times 2 divides the step: a step with rank r is still drawn
          // when every 2^r-th step is.
          rank: step ? Math.min(Math.log2(step & -step), 12) : 12,
          bearing: bearingBetween(start, end),
        },
        geometry: {
          type: "Point",
          coordinates: [
            start[0] + (end[0] - start[0]) * ratio,
            start[1] + (end[1] - start[1]) * ratio,
          ],
        },
      });
      step += 1;
    }
  });
  return { type: "FeatureCollection", features };
};

// A small ink footprint pointing up: the ball of the foot, then the heel.
function makeFootprintImage(mirrored) {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = 14 * scale;
  canvas.height = 24 * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  if (mirrored) {
    context.translate(14, 0);
    context.scale(-1, 1);
  }
  // A white rim keeps the dark print readable on red and orange roads.
  const drawFoot = () => {
    context.beginPath();
    context.ellipse(7.6, 8.2, 4.4, 6.6, 0.16, 0, Math.PI * 2);
    context.moveTo(9.5, 19.2);
    context.ellipse(6.4, 19.2, 3.1, 3.6, 0.08, 0, Math.PI * 2);
  };
  drawFoot();
  context.lineWidth = 2.4;
  context.strokeStyle = "rgba(255, 255, 255, 0.95)";
  context.stroke();
  context.fillStyle = "#4f5a60"; // a dark grey, a shade lighter than the stop pins
  context.fill();
  return { image: context.getImageData(0, 0, canvas.width, canvas.height), pixelRatio: scale };
}

// The walker's head is a drawn-step number at the current zoom; only the
// prints just behind it show.
const footprintOpacity = (head) =>
  byZoom((k) => [
    "let",
    "behind",
    ["-", head, shownStep(k)],
    // Only the walker's own prints show: the newest two pairs (four steps)
    // fully, the two pairs before them fading out; every other print is hidden.
    ["case",
      ["<", ["var", "behind"], 0], 0,
      ["<", ["var", "behind"], 4], 1,
      ["<", ["var", "behind"], 8],
      ["-", 1, ["/", ["-", ["var", "behind"], 3], 5]],
      0],
  ]);

// Which drawn steps are on screen, in walking order, so the walker only
// walks the part of the route the traveller is looking at.
const visibleShownSteps = (map, features) => {
  const zoom = Math.floor(map.getZoom());
  if (zoom < FOOTPRINT_MIN_ZOOM) return [];
  const k = Math.max(FOOTPRINT_FULL_ZOOM - Math.min(zoom, FOOTPRINT_FULL_ZOOM), 0);
  const bounds = map.getBounds();
  const shown = new Set();
  features.forEach(({ properties, geometry }) => {
    if (properties.rank >= k && bounds.contains(geometry.coordinates)) {
      shown.add(Math.floor(properties.step / 2 ** k));
    }
  });
  return [...shown].sort((first, second) => first - second);
};

// Pins this close on screen overlap; a clicked pin zooms in until its nearest
// neighbour is at least this far away.
const PIN_SPREAD_PX = 56;
const MAX_FOCUS_ZOOM = 18;
// A clicked STOP tag lands at street level, close enough to read the blocks around it.
const STOP_FOCUS_ZOOM = 16;
// A card opened by the travellers' arrival sits this far above the stop,
// clear of their heads and clock (or just under the stop near the map's top).
const ARRIVAL_CARD_RISE = 128;
// Cards keep at least this far inside the map's edges.
const CARD_MARGIN = 8;

function zoomToSpreadPins(map, coordinate, allCoordinates, minZoom = 0, duration = 700) {
  const here = map.project(coordinate);
  const nearest = allCoordinates.reduce((closest, other) => {
    if (other === coordinate) return closest;
    const point = map.project(other);
    const distance = Math.hypot(point.x - here.x, point.y - here.y);
    // Stops at the same spot are already fanned out by their offsets.
    return distance > 0.5 ? Math.min(closest, distance) : closest;
  }, Infinity);
  const zoom = map.getZoom();
  // Distances grow 2x per zoom level, so solve for the level that spreads them.
  const extraZoom =
    nearest < PIN_SPREAD_PX ? Math.log2(PIN_SPREAD_PX / nearest) + 0.3 : 0;
  map.flyTo({
    center: coordinate,
    zoom: Math.min(Math.max(zoom + extraZoom, zoom, minZoom), MAX_FOCUS_ZOOM),
    duration,
  });
}

// The card each map has open from a click on its pin (to close it).
const openCards = new WeakMap();

// `onPick(index)` hears a click on the pin (the travellers go there).
function makeStopMarker(map, stop, index, coordinate, offset, allCoordinates = [], onPick) {
  const marker = document.createElement("div");
  marker.className = "planner-route-marker";
  const pin = document.createElement("div");
  pin.className = "planner-route-pin";
  // Number pins by their STOP, not their place among the located stops, so a
  // stop without a location never shifts the numbers after it.
  const stopOrder = stop.order ?? index + 1;
  pin.textContent = String(stopOrder);
  marker.append(pin);

  const content = document.createElement("div");
  const stopNumber = document.createElement("strong");
  const stopName = document.createElement("span");
  content.className = "planner-route-popup";
  stopNumber.textContent = String(stopOrder).padStart(2, "0");
  stopName.textContent = stop.town.name;
  content.append(stopNumber, stopName);

  // Hovering shows the stop's card; a click keeps it open until it is closed.
  const popup = new maplibregl.Popup({ offset: 35, anchor: "bottom", focusAfterOpen: false })
    .setLngLat(coordinate)
    .setDOMContent(content);
  let pinned = false;
  // Opened by the travellers' arrival it sits above them and their clock
  // (`rise` px over the point instead of just over the pin).
  let rise = 35;
  // The card always stays inside the map: above the point when there is room,
  // otherwise below it, and slid sideways or up off the edges. Kept so while
  // the map moves under it.
  const fit = () => {
    const element = popup.getElement();
    if (!element) return;
    const { clientWidth: width, clientHeight: height } = map.getContainer();
    const point = map.project(coordinate);
    const cardWidth = element.offsetWidth;
    const cardHeight = element.offsetHeight;
    const above = point.y - rise - cardHeight >= CARD_MARGIN;
    let dy = above ? -rise : 10;
    if (!above) dy -= Math.max(point.y + dy + cardHeight - (height - CARD_MARGIN), 0);
    const left = point.x - cardWidth / 2;
    let dx =
      Math.max(CARD_MARGIN - left, 0) - Math.max(left + cardWidth - (width - CARD_MARGIN), 0);
    // Nor under the zoom / full-screen / play buttons in the top-right
    // corner: a card reaching up beside them slides left of them.
    const controls = map.getContainer().querySelector(".maplibregl-ctrl-top-right");
    if (controls) {
      const box = controls.getBoundingClientRect();
      const frame = map.getContainer().getBoundingClientRect();
      const controlsLeft = box.left - frame.left - CARD_MARGIN;
      const controlsBottom = box.bottom - frame.top + CARD_MARGIN;
      const cardTop = point.y + dy - (above ? cardHeight : 0);
      if (cardTop < controlsBottom && left + dx + cardWidth > controlsLeft) {
        dx = Math.max(controlsLeft - cardWidth - left, CARD_MARGIN - left);
      }
    }
    popup.options.anchor = above ? "bottom" : "top";
    // The little tip points at the stop only while the card is not slid aside.
    element.classList.toggle("is-slid", Math.abs(dx) > 1);
    // A stop off the map shows no card.
    element.style.visibility =
      point.x < 0 || point.x > width || point.y < 0 || point.y > height ? "hidden" : "";
    const [oldX, oldY] = Array.isArray(popup.options.offset) ? popup.options.offset : [0, 0];
    if (Math.abs(oldX - dx) > 0.5 || Math.abs(oldY - dy) > 0.5 || element.dataset.anchor !== popup.options.anchor) {
      element.dataset.anchor = popup.options.anchor;
      popup.setOffset([dx, dy]);
    }
  };
  const show = (above = false) => {
    if (popup.isOpen()) return;
    rise = above ? ARRIVAL_CARD_RISE : 35;
    popup.setMaxWidth(`${Math.max(map.getContainer().clientWidth - CARD_MARGIN * 2, 140)}px`);
    popup.setOffset([0, -rise]);
    popup.addTo(map);
    fit();
    map.on("move", fit);
  };
  const closeThis = () => {
    pinned = false;
    marker.classList.remove("is-picked");
    popup.remove();
  };
  popup.on("close", () => {
    pinned = false;
    marker.classList.remove("is-picked");
    map.off("move", fit);
    if (openCards.get(map) === closeThis) openCards.delete(map);
  });
  marker.addEventListener("mouseenter", () => show());
  marker.addEventListener("mouseleave", () => {
    if (!pinned) popup.remove();
  });
  marker.addEventListener("click", (event) => {
    event.stopPropagation();
    // Every tap sends the travellers here, even one that closes the card;
    // the map then follows them on from this stop.
    const followed = onPick?.(index);
    pinned = !pinned;
    if (pinned) {
      // One clicked card at a time: the one clicked before closes.
      const closeOther = openCards.get(map);
      if (closeOther && closeOther !== closeThis) closeOther();
      openCards.set(map, closeThis);
      marker.classList.add("is-picked");
      show();
      // Crowded pins: zoom into the area so the neighbours pull apart.
      if (!followed) zoomToSpreadPins(map, coordinate, allCoordinates);
    } else popup.remove();
  });

  const stopMarker = new maplibregl.Marker({ element: marker, anchor: "bottom", offset }).setLngLat(coordinate);
  // The travellers show the card when they arrive and close it when they
  // leave, even one clicked open.
  stopMarker.showCard = () => show(true);
  stopMarker.hideCard = closeThis;
  return stopMarker;
}

// The two travellers on the map, following the day's plan by the times
// written in each stop (「9:00-15:30」, 「16:40 開車去吃晚餐」): they stay at a
// stop from its first to its last time and travel the route to the next.
const AVATARS = [
  // The girl's picture is drawn smaller inside its frame, so it is shown
  // larger to make the two faces the same size. The boy stands in front, so
  // her hair falls behind him, and on the road she keeps a step behind.
  { src: boyAvatar, name: "男生", size: 50, offset: [-18, 0], lag: 0, front: true },
  { src: girlAvatar, name: "女生", size: 62, offset: [21, 0], lag: 4 },
];
// On the trip day they follow the clock; on any other day the day plays
// through quickly, over and over: an hour of the plan in this many ms.
const REPLAY_HOUR_MS = 3000;
// The sideways steps (px) the pair tries, in order, to stand clear of pins.
const AVATAR_SHIFTS = [0, 30, -30, 55, -60, 70, -80, 95, -105, 125, -135, 160, -170];
const REPLAY_REST_MS = 2000;
// In the replay every leg takes at least this long to watch.
const LEG_PLAY_MS = 3000;
// Every stop holds them at least this long, even one passed straight
// through, so its card can be read (and the map can frame the next leg).
const STOP_PAUSE_MS = 1600;
// Plus this much for every tenfold of the leg's km (a 2,000 km flight ≈ 4.3 s).
const LEG_PLAY_PER_DECADE_MS = 400;
// Speeds to guess how long a leg takes inside the times written.
const TRAVEL_KMH = 40;
const WALKING_KMH = 4.5;
const FLIGHT_KMH = 750;
const MIN_LEG_MINUTES = 5;
const SHORT_GAP_MINUTES = 30;
const TIME_PATTERN = /(\d{1,2})\s*[:：]\s*(\d{2})/g;

const stopTimes = (text = "") =>
  [...text.matchAll(TIME_PATTERN)]
    .filter(([, hours, minutes]) => Number(hours) < 30 && Number(minutes) < 60)
    .map(([, hours, minutes]) => Number(hours) * 60 + Number(minutes));

const legLength = (points) => {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [lng1, lat1] = points[index - 1];
    const [lng2, lat2] = points[index];
    const latScale = Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
    total += Math.hypot((lng2 - lng1) * latScale * 111.32, (lat2 - lat1) * 110.54);
  }
  return total;
};

// The point a share of the way along a leg, measured by distance.
const pointAlong = (points, share) => {
  const target = legLength(points) * share;
  let walked = 0;
  for (let index = 1; index < points.length; index += 1) {
    const piece = legLength([points[index - 1], points[index]]);
    if (piece > 0 && walked + piece >= target) {
      const t = (target - walked) / piece;
      const [lng1, lat1] = points[index - 1];
      const [lng2, lat2] = points[index];
      return [lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t];
    }
    walked += piece;
  }
  return points.at(-1);
};

// The day as stays and legs in minutes after midnight, or null when no stop
// has a time. A stop without a time takes its place evenly between the timed
// stops around it.
// A flight stop's 「12:00-16:30」 is the flight itself: they leave the airport
// at the first time and land at the next stop at the last.
function makeSchedule(stops, paths) {
  const times = stops.map(({ item }) => stopTimes(item.text));
  const flights = new Set();
  stops.forEach(({ flight }, index) => {
    if (!flight || times[index].length < 2 || index === stops.length - 1) return;
    const landing = times[index].at(-1);
    times[index] = [times[index][0]];
    times[index + 1] = [landing, ...times[index + 1]];
    flights.add(index);
  });
  const timed = times.flatMap((list, index) => (list.length ? [index] : []));
  if (!timed.length) return null;
  const coordinates = stops.map(({ town }) => [town.longitude, town.latitude]);
  const stays = times.map((list) => (list.length ? [list[0], list.at(-1)] : null));
  stays.forEach((stay, index) => {
    if (stay) return;
    const before = timed.filter((other) => other < index).at(-1);
    const after = timed.find((other) => other > index);
    if (before === undefined) stays[index] = [stays[after][0], stays[after][0]];
    else if (after === undefined) stays[index] = [stays[before][1], stays[before][1]];
    else {
      const from = stays[before][1];
      const to = stays[after][0];
      const minute = from + ((to - from) * (index - before)) / (after - before);
      stays[index] = [minute, minute];
    }
  });
  // Times run on through the night: a time earlier than the one before it
  // is the next day.
  // A stop whose times reach back into the stop before (a car park's
  // 「9:20-13:00」 written again on return) starts when they get there; one
  // a little earlier is read as right after.
  let shift = 0;
  stays.forEach((stay, index) => {
    if (stay[1] < stay[0]) stay[1] += 24 * 60;
    stay[0] += shift;
    stay[1] += shift;
    const previous = index ? stays[index - 1][1] : -Infinity;
    if (stay[0] >= previous) return;
    if (stay[1] >= previous) stay[0] = previous;
    else if (previous - stay[0] > 12 * 60) {
      shift += 24 * 60;
      stay[0] += 24 * 60;
      stay[1] += 24 * 60;
    } else {
      stay[0] = previous;
      stay[1] = previous;
    }
  });
  // `cursor` is when they last arrived: no leg starts before it, and every
  // leg takes at least as long as the road (MIN_LEG_MINUTES at the least),
  // so they never jump between stops even when the times written leave no
  // room for the trip; the rest of the day then runs that much later.
  let cursor = -Infinity;
  const legs = coordinates.slice(0, -1).map((start, index) => {
    const end = coordinates[index + 1];
    const path = paths[index];
    const points = path?.length > 1 ? [start, ...path, end] : [start, end];
    let arrive = stays[index + 1][0];
    let leave = stays[index][1];
    const speed = stops[index].flight ? FLIGHT_KMH : stops[index].walking ? WALKING_KMH : TRAVEL_KMH;
    const travel = Math.max((legLength(points) / speed) * 60, MIN_LEG_MINUTES);
    // The written times come first: up to half an hour between two stops is
    // all spent on the way. In a longer gap a stop with an end time
    // (「15:30-16:00」) sets off then and waits at the next stop, and one with
    // only one time stays and sets off just in time to reach the next one. A
    // next stop with no time is reached at the road's pace.
    if (flights.has(index)) {
      // The flight keeps its own times.
    } else if (!times[index + 1].length) arrive = leave + travel;
    else if (arrive - leave <= SHORT_GAP_MINUTES) {
      // Leave and arrive as written.
    }
    else if (times[index].length >= 2) arrive = Math.min(arrive, leave + travel);
    else leave = Math.max(leave, arrive - travel);
    leave = Math.max(leave, cursor);
    // Never less than a few minutes on the road, so they are seen to go.
    arrive = Math.max(arrive, leave + MIN_LEG_MINUTES);
    cursor = arrive;
    return { points, leave, arrive };
  });
  return { coordinates, legs, start: stays[0][0], end: Math.max(stays.at(-1)[1], cursor) };
}

// Where the travellers are at a minute of the day, and whether on the road.
function placeAt(schedule, minute) {
  const { coordinates, legs } = schedule;
  for (let index = 0; index < legs.length; index += 1) {
    const { points, leave, arrive } = legs[index];
    if (minute <= leave) return { at: coordinates[index], moving: false, leg: index };
    if (minute < arrive) {
      return { at: pointAlong(points, (minute - leave) / Math.max(arrive - leave, 1)), moving: true, leg: index };
    }
  }
  return { at: coordinates.at(-1), moving: false, leg: legs.length };
}

// Pins rise above their point, so the top of a fitted view keeps extra room.
const FIT_PADDING = { top: 72, right: 48, bottom: 40, left: 48 };
// While the travellers are on the road the map follows the leg they are on:
// a short hop fills the map close up, a long drive or flight zooms out to
// show all of it. Never closer than this.
const LEG_MAX_ZOOM = 15.5;
const FOLLOW_MS = 900;
// The day's first stop is shown this close while they are still there...
const STOP_CLOSE_ZOOM = 15.5;
// ...until this many plan minutes before they set off (in the replay about
// 1.5 s, time for the map to pull back and frame the first leg).
const LEAD_MINUTES = 30;
// After the traveller pans, zooms or clicks a pin, the map stays where they
// put it for this long before following again.
const USER_CAMERA_MS = 12000;

function fitPoints(map, points, maxZoom, duration = 0) {
  const bounds = new maplibregl.LngLatBounds();
  points.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom, duration, animate: duration > 0 });
}

const clockLabel = (minute) => {
  const whole = ((Math.floor(minute) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

const localToday = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

function makeAvatarMarker({ src, name, size, offset, front }) {
  const element = document.createElement("div");
  element.className = front ? "planner-route-avatar is-front" : "planner-route-avatar";
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  const image = document.createElement("img");
  image.src = src;
  image.alt = name;
  image.draggable = false;
  element.append(image);
  return new maplibregl.Marker({ element, anchor: "bottom", offset });
}

// `home` is where the map starts before any stop is placed: the country of
// the open planner (Japan unless told otherwise).
const JAPAN_HOME = { center: JAPAN_CENTER, zoom: JAPAN_ZOOM };

// `onTravel(itemId)` hears which stop the travellers are at, or heading to
// while on the road (null when they are gone), so the itinerary can follow.
function RouteMap({ stops, paths = [], label = "行程路線地圖", focus = null, home = JAPAN_HOME, date = "", onTravel }) {
  const canvasRef = useRef(null);
  const onTravelRef = useRef(onTravel);
  onTravelRef.current = onTravel;
  // Whether the replay of the day is playing (the play / pause button).
  // With reduced motion it waits for the button.
  const playingRef = useRef(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const playButtonRef = useRef(null);
  // Sends the replay's travellers to a stop (set while a replay runs).
  const seekRef = useRef(null);
  const drawPlayButton = () => {
    const button = playButtonRef.current;
    if (!button) return;
    const playing = playingRef.current;
    button.setAttribute("aria-label", playing ? "暫停播放" : "播放");
    button.title = playing ? "暫停" : "播放";
    button.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z"/></svg>';
  };
  const homeRef = useRef(home);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const stopsRef = useRef(stops);
  const pathsRef = useRef(paths);
  const footprintsRef = useRef([]);
  const visibleStepsRef = useRef([]);
  const tickRef = useRef(0);
  // Until when the traveller holds the camera (see USER_CAMERA_MS).
  const userCameraRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  const [webglSupported] = useState(() =>
    Boolean(document.createElement("canvas").getContext("webgl2")),
  );
  const stopsKey = stops
    .map(({ item, town, order }) =>
      [item.id, order, town.id, town.latitude, town.longitude, town.name].join(":"),
    )
    .join("|");
  const timesKey = stops
    .map(({ item, flight, walking }) => `${flight ? "✈" : walking ? "w" : ""}${stopTimes(item.text).join(",")}`)
    .join("|");
  const pathsKey = paths
    .map((path) => (path ? `${path.length}:${path[0]}:${path.at(-1)}` : "-"))
    .join("|");

  useEffect(() => {
    stopsRef.current = stops;
    pathsRef.current = paths;
  }, [stops, paths]);

  // Another country's planner: show that country while there are no stops.
  useEffect(() => {
    homeRef.current = home;
    if (mapReady && !stopsRef.current.length) mapRef.current?.jumpTo(home);
  }, [home, mapReady]);

  useEffect(() => {
    if (!webglSupported || !canvasRef.current) return undefined;
    const map = new maplibregl.Map({
      container: canvasRef.current,
      style: MAP_STYLE,
      center: homeRef.current.center,
      zoom: homeRef.current.zoom,
      minZoom: 1.5,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    // Play / pause for the replay of the day (hidden on the trip day itself,
    // when the travellers follow the clock).
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "planner-route-play";
    playButton.hidden = true;
    playButton.addEventListener("click", () => {
      playingRef.current = !playingRef.current;
      drawPlayButton();
    });
    playButtonRef.current = playButton;
    drawPlayButton();
    map.addControl(
      {
        onAdd() {
          const group = document.createElement("div");
          group.className = "maplibregl-ctrl maplibregl-ctrl-group";
          group.append(playButton);
          return group;
        },
        onRemove() {
          playButton.parentElement?.remove();
        },
      },
      "top-right",
    );
    // The data licences require attribution, so keep it behind an info button.
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: TRANSIT_ATTRIBUTION,
      }),
    );
    // "load" waits for every visible tile, which takes seconds on the free
    // tile server; the style is enough to draw the stops and the route.
    map.once("style.load", () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: makeRouteLine([]),
        // The line arrives already smoothed (smoothRouteLine); this only trims
        // what is too small to see when zoomed far out.
        tolerance: 1.2,
      });
      // A soft white band under the route, so the dashes stand out from the
      // busy roads and green of the map.
      map.addLayer({
        id: `${ROUTE_SOURCE_ID}-casing`,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 6,
          "line-opacity": 0.75,
          "line-blur": 1,
        },
      });
      // The route itself: even, rounded dashes in the app's dark ink.
      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1f2629",
          "line-width": 2.5,
          "line-opacity": 1,
          // In line widths; round caps add one width to each dash.
          "line-dasharray": [2, 2.5],
        },
      });
      map.addImage("footprint-left", makeFootprintImage(false).image, { pixelRatio: 2 });
      map.addImage("footprint-right", makeFootprintImage(true).image, { pixelRatio: 2 });
      map.addSource(FOOTPRINT_SOURCE_ID, {
        type: "geojson",
        data: makeFootprints(makeRouteLine([])),
      });
      map.addLayer({
        id: FOOTPRINT_SOURCE_ID,
        type: "symbol",
        source: FOOTPRINT_SOURCE_ID,
        // Below zoom 13 (town and wider) only the dashed line is drawn.
        minzoom: FOOTPRINT_MIN_ZOOM,
        filter: byZoom((k) => [">=", ["get", "rank"], k]),
        layout: {
          "icon-image": byZoom((k) => ["case", isLeftFoot(k), "footprint-left", "footprint-right"]),
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-offset": byZoom((k) => ["case", isLeftFoot(k), ["literal", [-4, 0]], ["literal", [4, 0]]]),
          // Small prints, so they read as a trail beside the pins, not over them.
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-padding": 0,
          // Hidden: at every zoom the route is only the plain line.
          visibility: "none",
        },
        paint: { "icon-opacity": footprintOpacity(-1) },
      });
      setMapReady(true);
    });
    map.once("load", () => {
      map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
    });
    return () => {
      markersRef.current = [];
      mapRef.current = null;
      map.remove();
    };
  }, [webglSupported]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const currentStops = stopsRef.current;
    const coordinates = currentStops.map(({ town }) => [town.longitude, town.latitude]);
    const markerOffsets = getOverlappingMarkerOffsets(coordinates);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = currentStops.map((stop, index) =>
      makeStopMarker(map, stop, index, coordinates[index], markerOffsets[index], coordinates, (picked) =>
        Boolean(seekRef.current?.(picked)),
      ).addTo(map),
    );

    if (!coordinates.length) {
      map.jumpTo(homeRef.current);
    } else if (coordinates.length === 1) {
      map.jumpTo({ center: coordinates[0], zoom: 12 });
    } else {
      // Zoom in as far as street level so stops a short walk apart are
      // spread out instead of piled up.
      fitPoints(map, coordinates, 17);
    }
  }, [stopsKey, mapReady]);

  // Routes arrive after the stops, so the line is redrawn on its own without
  // moving the view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const coordinates = stopsRef.current.map(({ town }) => [town.longitude, town.latitude]);
    const routeLine = makeRouteLine(coordinates, pathsRef.current);
    map.getSource(ROUTE_SOURCE_ID)?.setData(smoothRouteLine(routeLine));
    const footprints = makeFootprints(routeLine);
    map.getSource(FOOTPRINT_SOURCE_ID)?.setData(footprints);
    // A changed route starts the walk over from the first stop on screen.
    footprintsRef.current = footprints.features;
    visibleStepsRef.current = visibleShownSteps(map, footprints.features);
    tickRef.current = 0;
  }, [stopsKey, pathsKey, mapReady]);

  // The two travellers follow the day's times: on the trip day by the clock,
  // on other days by a quick replay of the whole day, with the plan's time
  // shown above them. With no times written they wait at the first stop.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;
    const currentStops = stopsRef.current;
    if (!currentStops.length) return undefined;
    const schedule = makeSchedule(currentStops, pathsRef.current);
    const first = [currentStops[0].town.longitude, currentStops[0].town.latitude];
    const avatars = AVATARS.map((avatar) => ({
      ...avatar,
      marker: makeAvatarMarker(avatar).setLngLat(first).addTo(map),
    }));
    const clock = document.createElement("div");
    clock.className = "planner-route-clock";
    const clockMarker = new maplibregl.Marker({ element: clock, anchor: "bottom", offset: [0, -60] })
      .setLngLat(first);
    if (schedule) clockMarker.addTo(map);

    // The camera: on the road it fits the leg being travelled; before the
    // day starts and after it ends it shows every stop. Panning, zooming or
    // clicking a pin hands the map to the traveller for a while.
    const follow = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let cameraKey = "";
    const handOver = (event) => {
      // The play button and the pins (which send the travellers) keep the
      // map following them.
      if (event?.type === "click" && event.target.closest?.(".planner-route-play, .planner-route-marker")) return;
      if (event?.originalEvent || event?.type === "click") userCameraRef.current = Date.now() + USER_CAMERA_MS;
    };
    const container = map.getContainer();
    map.on("movestart", handOver);
    container.addEventListener("click", handOver, true);
    let travelId = null;
    let shownCard = -1;
    // `soon` says whether they set off from where they wait shortly.
    const aim = (spot, soon) => {
      if (!follow || Date.now() < userCameraRef.current || !schedule) return;
      // At the day's first stop the map starts close up on it; a little
      // before they set off it frames the leg ahead, as it does at every
      // other stop, so it is zoomed in before they go and the whole leg is
      // seen.
      const { leg, moving } = spot;
      const key =
        leg === 0 && !moving && !soon ? "start" : leg < schedule.legs.length ? `leg${leg}` : "all";
      if (key === cameraKey) return;
      cameraKey = key;
      if (key === "start") map.easeTo({ center: schedule.coordinates[0], zoom: STOP_CLOSE_ZOOM, duration: FOLLOW_MS });
      else if (key === "all") fitPoints(map, schedule.coordinates, 17, FOLLOW_MS);
      else fitPoints(map, schedule.legs[leg].points, LEG_MAX_ZOOM, FOLLOW_MS);
    };

    // minuteOf(lag) is the plan's minute for a traveller that many minutes
    // behind the first one.
    // The pair stands beside the pins, never on one: they step sideways
    // (right first, then left, a little further each try) to the nearest
    // place where neither head covers a pin, and glide there.
    const pinBoxes = () =>
      markersRef.current.map((pin) => {
        const { x, y } = map.project(pin.getLngLat()).add(pin.getOffset());
        return { left: x - 15, right: x + 15, top: y - 36, bottom: y };
      });
    const pairBoxes = ({ x, y }, shift) =>
      AVATARS.map(({ size, offset }) => {
        // The faces, a little inside each picture's frame.
        const middle = x + offset[0] + shift;
        const half = size * 0.38;
        return { left: middle - half, right: middle + half, top: y - size * 0.9, bottom: y };
      });
    const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const clearShift = (at) => {
      const here = map.project(at);
      const pins = pinBoxes();
      for (const shift of AVATAR_SHIFTS) {
        if (!pairBoxes(here, shift).some((face) => pins.some((pin) => overlaps(face, pin)))) return shift;
      }
      return AVATAR_SHIFTS.at(-1);
    };
    let aside = 0;
    const place = (minuteOf, live) => {
      const lead = placeAt(schedule, minuteOf(0));
      const target = clearShift(lead.at);
      aside = Math.abs(target - aside) < 0.5 ? target : aside + (target - aside) * 0.25;
      clockMarker.setOffset([aside, -60]);
      avatars.forEach(({ marker, lag, offset }) => {
        const spot = placeAt(schedule, minuteOf(live ? 0 : lag));
        marker.setLngLat(spot.at);
        marker.setOffset([offset[0] + aside, offset[1]]);
        marker.getElement().classList.toggle("is-walking", spot.moving);
        if (!lag || live) {
          aim(spot, minuteOf(0) >= schedule.legs[0]?.leave - (live ? 30 : LEAD_MINUTES));
          const stop = currentStops[Math.min(spot.moving ? spot.leg + 1 : spot.leg, currentStops.length - 1)];
          if (stop && stop.item.id !== travelId) {
            travelId = stop.item.id;
            onTravelRef.current?.(travelId);
          }
          // At a stop, its pin's card (number and name) is shown.
          const cardIndex = spot.moving ? -1 : Math.min(spot.leg, currentStops.length - 1);
          if (cardIndex !== shownCard) {
            markersRef.current[shownCard]?.hideCard?.();
            shownCard = cardIndex;
            markersRef.current[shownCard]?.showCard?.();
          }
        }
      });
      clockMarker.setLngLat(avatars[0].marker.getLngLat());
      const minute = minuteOf(0);
      clock.textContent = live ? `現在 ${clockLabel(minute)}` : clockLabel(minute);
    };

    let frame = 0;
    let timer = 0;
    if (schedule && date === localToday()) {
      // The trip day: where the plan says they are right now.
      const tick = () => {
        const now = new Date();
        const minute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
        place(() => minute, true);
      };
      tick();
      timer = window.setInterval(tick, 20000);
    } else if (schedule) {
      const from = schedule.start - 15;
      const to = schedule.end + 15;
      // The replay in pieces: the time at stops runs at the usual pace, and
      // each leg on the road plays for its own time (legMs).
      const pace = (minutes) => (minutes / 60) * REPLAY_HOUR_MS;
      const lengths = schedule.legs.map(({ points }) => legLength(points));
      // The map frames each leg, so on screen every leg is about the same
      // size: each plays for about the same time, a long one only a little
      // longer, so a short hop is never a blink.
      const legMs = (index) => LEG_PLAY_MS + LEG_PLAY_PER_DECADE_MS * Math.log10(1 + lengths[index]);
      const pieces = [];
      let cursor = from;
      let playMs = 0;
      // `hold` keeps even a stop with no time between arriving and leaving,
      // so the replay pauses there and its card can be read.
      const addPiece = (until, ms, hold = false) => {
        if (until < cursor || (until === cursor && !hold)) return;
        pieces.push({ from: cursor, to: until, startMs: playMs, ms });
        playMs += ms;
        cursor = until;
      };
      // When in the replay they reach each stop (the first: from the start).
      const arrivalMs = [0];
      schedule.legs.forEach(({ leave, arrive }, index) => {
        // Time for the map to settle on the leg before they set off.
        addPiece(leave, Math.max(pace(leave - cursor), STOP_PAUSE_MS), true);
        addPiece(arrive, legMs(index));
        arrivalMs.push(playMs);
      });
      addPiece(to, pace(to - cursor));
      const minuteAt = (ms) => {
        if (ms <= 0) return from;
        const piece = pieces.find((each) => ms < each.startMs + each.ms);
        if (!piece) return to;
        return piece.from + ((ms - piece.startMs) / piece.ms) * (piece.to - piece.from);
      };
      // The replay's own clock only runs while it is playing, so pause holds
      // them where they are and play carries on from there.
      let played = 0;
      let lastNow = 0;
      const step = (now) => {
        // A frame long after the last (the tab was in the background) does
        // not jump ahead; a slow device still plays at the right pace.
        if (lastNow && playingRef.current) played += Math.min(now - lastNow, 1000);
        lastNow = now;
        const elapsed = Math.min(played % (playMs + REPLAY_REST_MS), playMs);
        place((lag) => minuteAt(elapsed - pace(lag)), false);
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      if (playButtonRef.current) playButtonRef.current.hidden = false;
      // A clicked pin: both travellers are there (the second one a moment
      // behind has arrived too), and the replay plays on from there, even
      // if it was paused.
      seekRef.current = (index) => {
        if (arrivalMs[index] === undefined) return false;
        played = arrivalMs[index] + pace(Math.max(...AVATARS.map(({ lag }) => lag))) + 50;
        playingRef.current = true;
        drawPlayButton();
        // The camera picks them up here at once.
        userCameraRef.current = 0;
        cameraKey = "";
        return true;
      };
    }
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
      if (playButtonRef.current) playButtonRef.current.hidden = true;
      seekRef.current = null;
      map.off("movestart", handOver);
      container.removeEventListener("click", handOver, true);
      onTravelRef.current?.(null);
      markersRef.current[shownCard]?.hideCard?.();
      avatars.forEach(({ marker }) => marker.remove());
      clockMarker.remove();
    };
  }, [stopsKey, pathsKey, timesKey, date, mapReady]);

  // Walk the footprints forward through the stretch on screen, in stop order,
  // then start that stretch again; panning or zooming picks the new stretch.
  // Still for people who ask for less motion.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      map.setPaintProperty(FOOTPRINT_SOURCE_ID, "icon-opacity", 0.8);
      return undefined;
    }
    const refreshVisible = () => {
      visibleStepsRef.current = visibleShownSteps(map, footprintsRef.current);
      tickRef.current = 0;
    };
    map.on("moveend", refreshVisible);
    const timer = window.setInterval(() => {
      if (mapRef.current !== map) return;
      const steps = visibleStepsRef.current;
      const lap = steps.length + STEP_TRAIL + STEP_PAUSE;
      const position = tickRef.current % Math.max(lap, 1);
      tickRef.current += 1;
      const head = steps.length ? steps[Math.min(position, steps.length - 1)] + Math.max(position - steps.length + 1, 0) : -1;
      map.setPaintProperty(FOOTPRINT_SOURCE_ID, "icon-opacity", footprintOpacity(head));
    }, STEP_TICK_MS);
    return () => {
      window.clearInterval(timer);
      map.off("moveend", refreshVisible);
    };
  }, [mapReady]);

  // A clicked STOP tag flies the map to its pin, zoomed in until the pins
  // around it separate, and makes the pin bounce.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !focus) return;
    const index = stopsRef.current.findIndex(({ item }) => item.id === focus.itemId);
    const marker = markersRef.current[index];
    if (!marker) return;
    const container = map.getContainer();
    const { top, bottom } = container.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight) {
      container.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Zoom into the area too, so pins crowded around this one pull apart.
    const coordinates = stopsRef.current.map(({ town }) => [town.longitude, town.latitude]);
    userCameraRef.current = Date.now() + USER_CAMERA_MS;
    zoomToSpreadPins(map, coordinates[index], coordinates, STOP_FOCUS_ZOOM, 900);
    const pin = marker.getElement().querySelector(".planner-route-pin");
    pin.classList.remove("is-bouncing");
    void pin.offsetWidth; // restart the animation on repeated clicks
    pin.classList.add("is-bouncing");
    pin.addEventListener("animationend", () => pin.classList.remove("is-bouncing"), { once: true });
  }, [focus, mapReady]);

  if (!webglSupported)
    return (
      <div className="planner-route-status">
        <strong>地圖無法顯示</strong>
        <span>這個瀏覽器不支援 WebGL，請更新瀏覽器或改用其他裝置。</span>
      </div>
    );
  return (
    <div ref={canvasRef} className="planner-route-map" aria-label={label} />
  );
}

export default RouteMap;
