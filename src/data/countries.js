import { geoCentroid, geoDistance } from "d3-geo";
import { feature } from "topojson-client";

// The countries on the globe. `focus` is a real [longitude, latitude] on the
// country's land: the globe turns to it, and its emblem and the projected
// map's emblem sit there. `offset` places the emblem away from the point (in
// globe units) with a dotted leader, as on the Japan map, so the European
// emblems do not pile up. `keep` is how far (in degrees) from the focus an
// island or territory may lie and still be drawn on the projected map, which
// drops far-off overseas territories such as French Guiana or Svalbard.
export const globeCountries = [
  { id: "taiwan", topoId: "158", name: "台灣", en: "TAIWAN", region: "亞洲", focus: [121, 23.7], offset: [108, 46], keep: 3, note: "台北 101 與山海小島", accent: "#e9776b" },
  { id: "japan", topoId: "392", name: "日本", en: "JAPAN", region: "亞洲", focus: [138.5, 36.4], offset: [118, -74], keep: 11, note: "北海道到長野的雪鄉", to: "/japan", accent: "#e9776b" },
  { id: "iceland", topoId: "352", name: "冰島", en: "ICELAND", region: "歐洲", focus: [-18.6, 64.9], offset: [-118, -84], keep: 6, note: "極光、火山與冰河", accent: "#6fd3a6" },
  { id: "norway", topoId: "578", name: "挪威", en: "NORWAY", region: "歐洲", focus: [9, 61.5], offset: [-26, -150], keep: 12, note: "峽灣與維京船", accent: "#e95459" },
  { id: "finland", topoId: "246", name: "芬蘭", en: "FINLAND", region: "歐洲", focus: [26, 63], offset: [112, -108], keep: 8, note: "馴鹿與北極圈的森林湖泊", accent: "#9cc7df" },
  { id: "netherlands", topoId: "528", name: "荷蘭", en: "NETHERLANDS", region: "歐洲", focus: [5.4, 52.2], offset: [-150, 4], keep: 4, note: "風車與鬱金香花田", accent: "#f19a5c" },
  { id: "france", topoId: "250", name: "法國", en: "FRANCE", region: "歐洲", focus: [2.4, 46.6], offset: [-132, 108], keep: 9, note: "艾菲爾鐵塔與阿爾卑斯雪場", accent: "#9cc7df" },
  { id: "switzerland", topoId: "756", name: "瑞士", en: "SWITZERLAND", region: "歐洲", focus: [8.2, 46.8], offset: [62, 128], keep: 4, note: "馬特洪峰與阿爾卑斯山", accent: "#e95459" },
  { id: "newZealand", topoId: "554", name: "紐西蘭", en: "NEW ZEALAND", region: "大洋洲", focus: [172.5, -41.5], offset: [116, 36], keep: 9, note: "南阿爾卑斯山與奇異鳥", accent: "#efc24f" },
  { id: "canada", topoId: "124", name: "加拿大", en: "CANADA", region: "北美洲", focus: [-100, 56], offset: [-64, -122], keep: 40, note: "洛磯山脈與楓葉", accent: "#e95459" },
];

// `accent` colours the little sun on the country's header map icon.

export const countryById = (id) => globeCountries.find((country) => country.id === id) ?? null;

// Where a country's pages live: Japan keeps its original routes, the others
// sit under /c/<id>. `base` is prefixed to the page paths (/prep, /planner…).
export const countryBase = (id) => (id === "japan" ? "" : `/c/${id}`);
export const countryHomePath = (id) => (id === "japan" ? "/japan" : `/c/${id}`);

// The detailed (1:50m) outlines are only needed once a country is opened, so
// they load in their own chunk.
let detailed;
export const loadDetailed = () => {
  detailed ??= import("world-atlas/countries-50m.json").then((module) => {
    const topo = module.default ?? module;
    return feature(topo, topo.objects.countries).features;
  });
  return detailed;
};

// The country's own land, without islands and territories far from its focus.
export const mainland = (shape, country) => {
  const polygons = shape.geometry.type === "Polygon" ? [shape.geometry.coordinates] : shape.geometry.coordinates;
  const near = polygons.filter((polygon) => {
    const centroid = geoCentroid({ type: "Polygon", coordinates: polygon });
    return (geoDistance(centroid, country.focus) * 180) / Math.PI <= country.keep;
  });
  return { type: "Feature", id: shape.id, properties: shape.properties, geometry: { type: "MultiPolygon", coordinates: near } };
};
