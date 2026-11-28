import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PlannerDatePicker from "./PlannerDatePicker";
import { saveLodgingPriceCloud, subscribeLodgingPricesCloud } from "../services/firebase";

// The price row on a 機票住宿 lodging card: type the stay's total in yen and
// it shows NT$ a night at the live exchange rate (shown in the card's corner). On a synced trip the prices
// are shared with everyone on it (any phone or computer); without one they are
// kept on this device.
const PRICE_STORAGE_KEY = "yuki-tabi-lodging-prices-v1";
const RATE_STORAGE_KEY = "yuki-tabi-jpy-twd-rate-v1";
const RATE_URL = "https://open.er-api.com/v6/latest/JPY";

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: the value lives for this visit only
  }
};

// Foreign currency → NT$ at the live market rate, shared by every card and menu
// and refreshed every few minutes while the page is open. fxratesapi gives a
// live quote; the daily open.er-api rate is the fallback, and the last rate seen
// is kept for offline. Yen keeps its original storage key.
const RATE_MAX_AGE = 5 * 60 * 1000;
const rateStorageKey = (code) => (code === "JPY" ? RATE_STORAGE_KEY : `yuki-tabi-${code.toLowerCase()}-twd-rate-v1`);
const ratePromises = {};
const fetchRate = async (code) => {
  try {
    const data = await fetch(`https://api.fxratesapi.com/latest?base=${code}&currencies=TWD`).then((response) => response.json());
    const rate = Number(data?.rates?.TWD);
    if (rate > 0) return rate;
  } catch {
    // fall through to the daily rate
  }
  const data = await fetch(RATE_URL.replace(/JPY$/, code)).then((response) => response.json());
  const rate = data?.rates?.TWD;
  if (!(rate > 0)) throw new Error("no rate");
  return rate;
};
function loadRate(code) {
  const key = rateStorageKey(code);
  const cached = readJson(key, null);
  if (cached?.at && Date.now() - cached.at < RATE_MAX_AGE && cached.rate > 0)
    return Promise.resolve(cached);
  ratePromises[code] ??= fetchRate(code)
    .then((rate) => {
      const fresh = { rate, at: Date.now() };
      writeJson(key, fresh);
      return fresh;
    })
    // Offline: an older rate is better than none.
    .catch(() => (cached?.rate > 0 ? cached : null))
    .finally(() => {
      delete ratePromises[code];
    });
  return ratePromises[code];
}

// `code` is an ISO currency code; TWD or nothing gives no rate.
export function useTwdRate(code) {
  const active = Boolean(code) && code !== "TWD";
  const [rate, setRate] = useState(() => (active ? readJson(rateStorageKey(code), null) : null));
  useEffect(() => {
    if (!active) {
      setRate(null);
      return undefined;
    }
    let alive = true;
    setRate(readJson(rateStorageKey(code), null));
    const refresh = () => loadRate(code).then((result) => alive && result && setRate(result));
    refresh();
    const timer = setInterval(refresh, RATE_MAX_AGE);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [code, active]);
  return rate;
}

const useJpyRate = () => useTwdRate("JPY");

const formatRateTime = (at) =>
  new Date(at).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });

const formatNumber = (value) => Math.round(value).toLocaleString("zh-TW");

// Cloud field names cannot hold dots or slashes.
const cloudField = (key) => key.replace(/[./\[\]*~`]/gu, "_");

// One value of a stay shared on the trip (or kept on this device without one):
// the yen total, or the free-cancellation date.
function useLodgingValue(key) {
  const { user, syncSpaceId } = useAuth();
  const cloudKey = user && syncSpaceId ? syncSpaceId : null;
  const [value, setValue] = useState(() => readJson(PRICE_STORAGE_KEY, {})[key] ?? "");

  // The trip's shared value for this stay, kept up to date as others type.
  useEffect(() => {
    if (!cloudKey) return undefined;
    return subscribeLodgingPricesCloud(
      cloudKey,
      (prices) => {
        const shared = prices[cloudField(key)];
        const local = readJson(PRICE_STORAGE_KEY, {})[key];
        // A value typed on this device before it was shared: share it.
        if (!shared && local) {
          saveLodgingPriceCloud(cloudKey, cloudField(key), local).catch(() => {});
          const rest = readJson(PRICE_STORAGE_KEY, {});
          delete rest[key];
          writeJson(PRICE_STORAGE_KEY, rest);
        }
        setValue(shared ?? local ?? "");
      },
      (error) => console.error("無法同步住宿資料", error),
    );
  }, [cloudKey, key]);

  const save = (next) => {
    setValue(next);
    if (cloudKey) {
      saveLodgingPriceCloud(cloudKey, cloudField(key), next).catch((error) =>
        console.error("無法儲存住宿資料", error),
      );
      return;
    }
    const prices = readJson(PRICE_STORAGE_KEY, {});
    if (next) prices[key] = next;
    else delete prices[key];
    writeJson(PRICE_STORAGE_KEY, prices);
  };
  return [value, save];
}

// 早餐 / 晚餐 boxes for one night of a stay: tick whether the booking includes
// the meal. Kept with the stay's price, so a synced trip shares them too.
const MEALS = [
  ["breakfast", "早餐"],
  ["dinner", "晚餐"],
];
function MealCheck({ valueKey, label }) {
  const [value, save] = useLodgingValue(valueKey);
  const checked = value === "1";
  return (
    <button
      type="button"
      className={`lodging-meal ${checked ? "is-checked" : ""}`}
      aria-pressed={checked}
      onClick={() => save(checked ? "" : "1")}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {checked ? <path d="M3.5 8.4 6.6 11.4 12.6 4.8" /> : <path d="M8 3.5v9M3.5 8h9" />}
      </svg>
      {label}
    </button>
  );
}

export function LodgingMeals({ stayKey }) {
  return (
    <span className="lodging-meals">
      {MEALS.map(([meal, label]) => (
        <MealCheck key={meal} valueKey={`${stayKey}|${meal}`} label={label} />
      ))}
    </span>
  );
}

function LodgingPrice({ priceKey, nights }) {
  const rate = useJpyRate();
  const [total, saveTotal] = useLodgingValue(priceKey);
  const [cancelBy, saveCancelBy] = useLodgingValue(`${priceKey}|cancel`);
  const update = (value) => saveTotal(value.replace(/[^\d]/g, ""));

  const yen = Number(total);
  const perNight = yen && nights && rate?.rate ? (yen * rate.rate) / nights : null;

  return (
    <div className="lodging-price">
      {rate?.rate > 0 && (
        <p className="lodging-rate" title={rate.at ? `更新於 ${formatRateTime(rate.at)}` : undefined}>
          匯率 {rate.rate.toFixed(4)}
        </p>
      )}
      <label>
        <span>{nights} 晚總價</span>
        <span className="lodging-price-input">
          <i aria-hidden="true">¥</i>
          <input
            inputMode="numeric"
            placeholder="總價"
            value={total ? Number(total).toLocaleString("en-US") : ""}
            onChange={(event) => update(event.target.value)}
            aria-label="住宿總價（日圓）"
          />
        </span>
      </label>
      <div className="lodging-cancel">
        <PlannerDatePicker className="lodging-cancel-calendar" value={cancelBy} onChange={saveCancelBy} placeholder="選擇日期" />
        <span>前免費取消</span>
      </div>
      <p className="lodging-price-result">
        {perNight ? (
          <>
            <b>NT${formatNumber(perNight)}</b> / 晚
          </>
        ) : (
          <small>{yen && !rate ? "匯率讀取中…" : "輸入總價換算台幣/晚"}</small>
        )}
      </p>
    </div>
  );
}

export default LodgingPrice;
