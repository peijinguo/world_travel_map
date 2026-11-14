import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PlaceMotif from "../../component/PlaceMotif";
import { WeatherIcon, forecastDayLabel, weatherKind, weatherLabels } from "../../component/WeatherIcon";
import { countryById } from "../../data/countries";
import { countryPlaces, loadRegions } from "../../data/places";
import { fetchPlaceForecast } from "../../services/weatherForecast";
import "../../assets/pages/_resort-detail.scss";

// Each country's time zone, for grouping a forecast into days; Canada spans
// several, picked by longitude.
const TIME_ZONES = {
  taiwan: "Asia/Taipei",
  iceland: "Atlantic/Reykjavik",
  norway: "Europe/Oslo",
  finland: "Europe/Helsinki",
  netherlands: "Europe/Amsterdam",
  france: "Europe/Paris",
  switzerland: "Europe/Zurich",
  newZealand: "Pacific/Auckland",
};
const timeZoneFor = (country, longitude) => {
  if (country !== "canada") return TIME_ZONES[country] ?? "UTC";
  if (longitude < -120) return "America/Vancouver";
  if (longitude < -102) return "America/Edmonton";
  if (longitude < -90) return "America/Winnipeg";
  if (longitude < -68) return "America/Toronto";
  return "America/Halifax";
};

// A sight on a country map (CountryHome.jsx), laid out like a Japan resort
// page (ResortDetail.jsx): the sight's information, the weather now, and the
// next six days. The weather is for the town the sight belongs to.
function SpotDetail() {
  const { country: countryId, place: placeId, spot: spotIndex } = useParams();
  const country = countryById(countryId);
  const place = countryPlaces[countryId]?.find((item) => item.id === placeId);
  const spot = place?.spots?.[Number(spotIndex)];
  const [regionName, setRegionName] = useState("");
  const [forecast, setForecast] = useState(null);
  const [weatherState, setWeatherState] = useState("loading");
  const [info, setInfo] = useState(null);
  // Once the big heading scrolls away, a compact one stays under the header,
  // as on a Japan resort page.
  const heroRef = useRef(null);
  const [isHeroCompact, setIsHeroCompact] = useState(false);

  useEffect(() => {
    const updateCompactHero = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? Infinity;
      setIsHeroCompact(heroBottom <= 88);
    };
    updateCompactHero();
    window.addEventListener("scroll", updateCompactHero, { passive: true });
    return () => window.removeEventListener("scroll", updateCompactHero);
  }, []);

  // The sight's introduction (src/data/spotInfo/<country>.js), loaded with
  // the page so the map does not carry every country's text.
  useEffect(() => {
    if (!spot) return undefined;
    let live = true;
    import(`../../data/spotInfo/${countryId}.js`).then((module) => {
      if (live) setInfo(module.default[spot.en] ?? null);
    });
    return () => {
      live = false;
    };
  }, [countryId, spot]);

  useEffect(() => {
    if (!place) return undefined;
    let live = true;
    loadRegions(countryId).then((data) => {
      const region = data?.features.find((feature) => feature.id === place.region);
      if (live && region) setRegionName(region.properties.name);
    });
    return () => {
      live = false;
    };
  }, [countryId, place]);

  useEffect(() => {
    if (!place) return undefined;
    const controller = new AbortController();
    const [longitude, latitude] = place.lonLat;
    fetchPlaceForecast(latitude, longitude, controller.signal, timeZoneFor(countryId, longitude))
      .then((data) => {
        setForecast(data);
        setWeatherState("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setWeatherState("error");
      });
    return () => controller.abort();
  }, [place, countryId]);

  if (!country || !place || !spot) return <Navigate to={country ? `/c/${countryId}` : "/"} replace />;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.en}, ${country.en}`)}`;
  // Today is the current weather; the six days after it are the forecast.
  const days = forecast?.daily?.time?.slice(1, 7).map((date, offset) => {
    const index = offset + 1;
    return {
      date,
      code: forecast.daily.weather_code[index],
      max: forecast.daily.temperature_2m_max[index],
      min: forecast.daily.temperature_2m_min[index],
      rain: forecast.daily.precipitation_probability_max?.[index],
      wind: forecast.daily.wind_speed_10m_max?.[index] ?? 0,
    };
  }) ?? [];
  const current = forecast?.current;

  return (
    <div className="resort-detail-page spot-detail-page">
      <section className="resort-detail-hero" ref={heroRef}>
        <div>
          <Link className="back-to-map" to={`/c/${countryId}`}>← 返回{country.name}地圖</Link>
          <p className="resort-location">{regionName || country.name} · {place.name}</p>
          <h1><span className="brush-title">{spot.name}</span></h1>
        </div>
        <div className="resort-hero-motif" aria-hidden="true">
          <svg className="spot-hero-motif" viewBox="-24 -24 48 48"><PlaceMotif type={place.motif} /></svg>
        </div>
      </section>
      {isHeroCompact && (
        <section className="compact-resort-hero" aria-label={`${spot.name} heading`}>
          <div>
            <p className="resort-location">{regionName || country.name} · {place.name}</p>
            <h1><span className="brush-title">{spot.name}</span></h1>
          </div>
          <div className="resort-hero-motif" aria-hidden="true">
            <svg className="spot-hero-motif" viewBox="-24 -24 48 48"><PlaceMotif type={place.motif} /></svg>
          </div>
        </section>
      )}

      <section className="resort-info-grid" aria-label={`${spot.name}資訊`}>
        <article className="resort-info-card spot-info-card">
          <h2><span className="brush-title">景點資訊</span></h2>
          {info ? (
            <>
              <p className="spot-intro">{info.intro}</p>
              <ul className="spot-highlights">
                {info.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <dl className="spot-facts">
                <div><dt>建議停留</dt><dd>{info.stay}</dd></div>
                <div><dt>最佳季節</dt><dd>{info.season}</dd></div>
                <div><dt>交通</dt><dd>{info.access}</dd></div>
                <div><dt>小提醒</dt><dd>{info.tip}</dd></div>
              </dl>
            </>
          ) : (
            <p className="weather-message">正在載入景點介紹…</p>
          )}
          <div className="spot-links">
            <a href={mapsUrl} target="_blank" rel="noreferrer">在 Google 地圖查看 ↗</a>
          </div>
        </article>

        <div className="resort-weather-column">
          <article className="current-weather-card resort-info-card">
            <h2><span className="brush-title">目前天氣</span></h2>
            {weatherState === "loading" && <p className="weather-message">正在取得最新天氣…</p>}
            {weatherState === "error" && <p className="weather-message">暫時無法取得天氣資料，請稍後再試。</p>}
            {weatherState === "ready" && current && (
              <>
                <div className="current-weather-main">
                  <span><WeatherIcon kind={weatherKind(current.weather_code)} /></span>
                  <strong>{Math.round(current.temperature_2m)}°</strong>
                  <p>{weatherLabels[current.weather_code] ?? "天氣變化"}</p>
                </div>
                <dl className="weather-metrics">
                  <div><dt>體感</dt><dd>{Math.round(current.apparent_temperature)}°C</dd></div>
                  <div><dt>風速</dt><dd>{Math.round(current.wind_speed_10m)} km/h</dd></div>
                  <div><dt>濕度</dt><dd>{Number.isFinite(current.relative_humidity_2m) ? `${Math.round(current.relative_humidity_2m)}%` : "—"}</dd></div>
                </dl>
              </>
            )}
            <details className="weather-source">
              <summary aria-label="資料來源">i</summary>
              <p>{place.name}的天氣，由 Open-Meteo 或 MET Norway 提供。</p>
            </details>
          </article>

          <section className="snow-forecast-card spot-forecast-card">
            <div className="forecast-heading">
              <div><h2><span className="brush-title">未來 6 天天氣</span></h2></div>
              <small>最高 / 最低溫</small>
            </div>
            {weatherState === "loading" && <p className="weather-message">正在載入天氣預報…</p>}
            {weatherState === "error" && <p className="weather-message">天氣預報暫時無法顯示。</p>}
            {weatherState === "ready" && (
              <div className="moiwa-forecast-grid spot-forecast-grid">
                {days.map((day) => (
                  <div className="moiwa-forecast-day" key={day.date}>
                    <strong>{forecastDayLabel(day.date)}</strong>
                    <span className="moiwa-weather-icon"><WeatherIcon kind={weatherKind(day.code)} /></span>
                    <p><b>{Math.round(day.max)}°</b> <i>{Math.round(day.min)}°</i></p>
                    <small>{weatherLabels[day.code] ?? "天氣變化"}</small>
                    {Number.isFinite(day.rain) && <em>降雨 {day.rain}%</em>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

// A fresh page for each sight, so its weather never shows another's.
function SpotDetailRoute() {
  const { country, place, spot } = useParams();
  return <SpotDetail key={`${country}/${place}/${spot}`} />;
}

export default SpotDetailRoute;
