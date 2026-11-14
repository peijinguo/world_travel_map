// Weather pieces shared by the resort pages (ResortDetail.jsx) and the sight
// pages (SpotDetail.jsx): WMO weather code labels, the small drawn weather
// pictures, and the weekday label for a forecast day.
/* eslint-disable react-refresh/only-export-components */

export const weatherLabels = {
  0: "晴朗",
  1: "大致晴朗",
  2: "局部多雲",
  3: "陰天",
  45: "有霧",
  48: "霧凇",
  51: "毛毛雨",
  53: "毛毛雨",
  55: "較強毛毛雨",
  61: "小雨",
  63: "降雨",
  65: "大雨",
  71: "小雪",
  73: "降雪",
  75: "大雪",
  77: "雪粒",
  80: "陣雨",
  81: "陣雨",
  82: "強陣雨",
  85: "陣雪",
  86: "強陣雪",
  95: "雷雨",
  96: "雷雨伴冰雹",
  99: "強雷雨伴冰雹",
};


export const weatherKind = (code) => {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([0, 1].includes(code)) return "sun";
  if ([2, 3, 45, 48].includes(code)) return "cloud";
  return "mixed";
};

// Small drawn weather pictures in place of the 晴 / 雲 / 雨 characters.
const WEATHER_ICON_LABELS = { sun: "晴", cloud: "多雲", rain: "雨", snow: "雪", sleet: "雨夾雪", mixed: "晴時多雲" };
const cloudPath = "M9 25h17a6 6 0 0 0 0-12 8 8 0 0 0-15-2 6 6 0 0 0-2 14z";
export function WeatherIcon({ kind }) {
  const sunny = kind === "sun" || kind === "mixed";
  const cloudShift = kind === "mixed" ? [3, 5] : kind === "cloud" ? [0, 2] : [0, 0];
  return (
    <svg className={`weather-icon weather-icon-${kind}`} viewBox="0 0 36 36" role="img" aria-label={WEATHER_ICON_LABELS[kind]}>
      {sunny && (
        <g className="weather-icon-sun" transform={kind === "mixed" ? "translate(-5 -5) scale(.8)" : undefined}>
          <path d="M18 3v4M18 29v4M3 18h4M29 18h4M7.4 7.4l2.8 2.8M25.8 25.8l2.8 2.8M7.4 28.6l2.8-2.8M25.8 10.2l2.8-2.8" />
          <circle cx="18" cy="18" r="8" />
        </g>
      )}
      {kind !== "sun" && (
        <path className="weather-icon-cloud" d={cloudPath} transform={`translate(${cloudShift[0]} ${cloudShift[1]})`} />
      )}
      {kind === "rain" && <path className="weather-icon-rain" d="M12 29l-1.5 3M18 29l-1.5 3M24 29l-1.5 3" />}
      {kind === "snow" && <path className="weather-icon-snow" d="M12 29.5v3M10.7 31h2.6M18 29.5v3M16.7 31h2.6M24 29.5v3M22.7 31h2.6" />}
      {kind === "sleet" && (
        <>
          <path className="weather-icon-rain" d="M12 29l-1.5 3M24 29l-1.5 3" />
          <path className="weather-icon-snow" d="M18 29.5v3M16.7 31h2.6" />
        </>
      )}
    </svg>
  );
}

export const forecastDayLabel = (date, locale = "zh-TW") => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (date === today) return locale === "en" ? "Today" : "今天";
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(`${date}T12:00:00`));
};
