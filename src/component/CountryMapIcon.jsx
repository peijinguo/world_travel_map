import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import { mainland } from "../data/countries";
import JapanMapIcon from "./JapanMapIcon";

// A small map of a country for the header, drawn like JapanMapIcon: green
// land with an ink outline (no sun; only Japan's icon has one). The outline
// comes from the same 1:110m coastlines as the globe.
const INK = "#1f3a5a";
const shapes = new Map(
  feature(worldTopo, worldTopo.objects.countries).features.map((shape) => [shape.id, shape]),
);

function CountryMapIcon({ country }) {
  const d = useMemo(() => {
    const shape = country && shapes.get(country.topoId);
    if (!shape) return "";
    const land = mainland(shape, country);
    const projection = geoMercator().rotate([-country.focus[0], 0]).fitExtent([[5, 4], [43, 44]], land);
    return geoPath(projection).digits(1)(land);
  }, [country]);

  if (country?.id === "japan") return <JapanMapIcon />;
  return (
    <svg className="japan-map-icon country-map-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path className="japan-map-icon-land" d={d} fill="#93c07f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default CountryMapIcon;
