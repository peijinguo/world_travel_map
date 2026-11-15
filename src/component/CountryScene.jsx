import SnowScene from "./SnowScene";
import { isSnowyCountry } from "../data/countries";
import taiwan from "../assets/country-bg/taiwan.webp";
import iceland from "../assets/country-bg/iceland.webp";
import norway from "../assets/country-bg/norway.webp";
import finland from "../assets/country-bg/finland.webp";
import netherlands from "../assets/country-bg/netherlands.webp";
import france from "../assets/country-bg/france.webp";
import switzerland from "../assets/country-bg/switzerland.webp";
import newZealand from "../assets/country-bg/newZealand.webp";
import canada from "../assets/country-bg/canada.webp";
import "../assets/pages/_country-scene.scss";

// The faint picture behind 行前準備 and 機票住宿 for every country but Japan
// (which keeps its own snow scenes, PrepScene and HotelScene): one
// hand-drawn panorama per country, shown on both pages across the bottom of
// the screen, with snow falling over it where the country has snow.
const PICTURES = { taiwan, iceland, norway, finland, netherlands, france, switzerland, newZealand, canada };

function CountryScene({ country }) {
  const src = PICTURES[country];
  if (!src) return null;
  return (
    <SnowScene snow={isSnowyCountry(country)}>
      <img className="country-scene-art" src={src} alt="" />
    </SnowScene>
  );
}

export default CountryScene;
