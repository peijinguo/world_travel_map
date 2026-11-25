import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { savePrepCloud, subscribePrepCloud } from "../../services/firebase";
import "../../assets/pages/_prep.scss";
import CountryScene from "../../component/CountryScene";
import { prepStarterFor } from "../../data/prepStarters";
import usePrepSnowfall from "../../component/PrepSnowfall";
import { storageKeyFor } from "../../services/syncCode";

// 行前準備: a hand-drawn notebook checklist. Tapping an item ticks its box and
// strikes it through; items can be added and removed. It syncs with the
// chosen trip, or stays on this device when no trip is chosen.
const LOCAL_KEY = "yuki-tabi-prep-items";

const makeId = () => `prep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
// A new trip starts from its country's own list (src/data/prepStarters.js).
const starterList = (country) =>
  prepStarterFor(country).map((text, index) => ({ id: `starter-${index + 1}`, text, done: false }));

// Each country keeps its own copy on this device (Japan the original one).
const loadLocal = (country) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeyFor(LOCAL_KEY, country)));
    return Array.isArray(saved) && !isUntouchedJapanList(saved, country) ? saved : starterList(country);
  } catch {
    return starterList(country);
  }
};

// Before each country had its own list, every trip started from Japan's. A
// list still exactly that, untouched, in another country gets that country's.
const isUntouchedJapanList = (list, country) => {
  if (country === "japan" || !Array.isArray(list) || !list.length) return false;
  const japan = prepStarterFor("japan");
  return list.length === japan.length &&
    list.every((item, index) => item.id === `starter-${index + 1}` && item.text === japan[index] && !item.done);
};

// A slightly wobbly square, drawn like a pen box; a tick appears when done.
function HandBox({ done }) {
  return (
    <svg className="prep-box" viewBox="0 0 28 28" aria-hidden="true">
      <path className="prep-box-frame" d="M4.6 5.2c6.2-.9 12.7-.6 18.6-.3.6 6 .4 12.3.1 18.4-6.3.6-12.4.4-18.5.1-.5-6-.6-12.1-.2-18.2z" />
      {done && <path className="prep-box-tick" d="M7.5 14.6c2 1.6 3.4 3.4 4.6 5.4 3-6.2 7-11.2 12.6-15.6" />}
    </svg>
  );
}

function Prep() {
  const { user, syncSpaceId, country } = useAuth();
  const cloudKey = user && syncSpaceId ? syncSpaceId : null;
  const [items, setItems] = useState(() => loadLocal(country));
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const cloudReadyRef = useRef(false);
  const sheetRef = useRef(null);
  // Snow piles up on the notebook only for Japan (the ski trip); other
  // countries' notebooks stay clear.
  const snow = usePrepSnowfall(sheetRef, country === "japan");

  // Follow the trip's list; a trip with no list yet starts from this device's.
  useEffect(() => {
    cloudReadyRef.current = false;
    if (!cloudKey) return undefined;
    return subscribePrepCloud(
      cloudKey,
      (cloudItems) => {
        if (Array.isArray(cloudItems) && !isUntouchedJapanList(cloudItems, country)) {
          setItems(cloudItems);
        } else if (!cloudReadyRef.current) {
          const starter = Array.isArray(cloudItems) ? starterList(country) : loadLocal(country);
          setItems(starter);
          savePrepCloud(cloudKey, starter).catch((error) =>
            console.error("無法建立行前準備清單", error),
          );
        }
        cloudReadyRef.current = true;
      },
      (error) => console.error("無法即時接收行前準備清單", error),
    );
  }, [cloudKey, country]);

  // Each change builds on the latest list, so quick taps never undo each other.
  const latestRef = useRef(items);
  latestRef.current = items;
  const commit = (change) => {
    const nextItems = change(latestRef.current);
    latestRef.current = nextItems;
    setItems(nextItems);
    try {
      localStorage.setItem(storageKeyFor(LOCAL_KEY, country), JSON.stringify(nextItems));
    } catch {
      // Storage full or blocked: the list still syncs to the trip.
    }
    if (cloudKey) {
      savePrepCloud(cloudKey, nextItems)
        .then(() => setStatus(""))
        .catch((error) => {
          console.error("無法同步行前準備清單", error);
          setStatus("已存在此裝置，雲端同步失敗");
        });
    }
  };

  const toggle = (id) =>
    commit((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  const remove = (id) => commit((list) => list.filter((item) => item.id !== id));
  const add = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    commit((list) => [...list, { id: makeId(), text, done: false }]);
    setDraft("");
  };

  const doneCount = items.filter((item) => item.done).length;

  return (
    <section className="prep-page">
      {/* Each country shows its own picture; Japan's also has snow falling. */}
      <CountryScene country={country} page="prep" />
      <div className="prep-notebook" {...snow.swipeHandlers}>
        {snow.cap}
        <div className="prep-sheet" ref={sheetRef}>
        {snow.fallen}
        <header className="prep-heading">
          <h1><span className="brush-title">行前準備</span></h1>
          <p>
            {items.length ? (
              <span
                className="prep-progress"
                role="progressbar"
                aria-label="準備進度"
                aria-valuemin={0}
                aria-valuemax={items.length}
                aria-valuenow={doneCount}
              >
                <span>{doneCount} / {items.length}</span>
                <span className="prep-progress-bar">
                  <i style={{ width: `${(doneCount / items.length) * 100}%` }} />
                </span>
              </span>
            ) : (
              "清單是空的，在下面寫上要準備的東西"
            )}
            {status && <span className="prep-status"> · {status}</span>}
          </p>
        </header>
        <ul className="prep-list">
          {items.map((item) => (
            <li key={item.id} className={item.done ? "is-done" : undefined}>
              <button
                type="button"
                className="prep-check"
                aria-pressed={item.done}
                onClick={() => toggle(item.id)}
              >
                <HandBox done={item.done} />
                <span className="prep-text">{item.text}</span>
              </button>
              <button
                type="button"
                className="prep-remove"
                aria-label={`刪除「${item.text}」`}
                onClick={() => remove(item.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <form className="prep-add" onSubmit={add}>
          <HandBox done={false} />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="再寫一項…"
            maxLength={80}
          />
          <button type="submit" aria-label="加入" data-tooltip="加入">
            {/* Three list lines with a plus: add to the list. */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 6h12M3.5 11.5h12M3.5 17h6M17.5 13v8M13.5 17h8" />
            </svg>
          </button>
        </form>
        </div>
      </div>
    </section>
  );
}

// A fresh list for each country, so moving between countries never shows
// another country's list.
function PrepRoute() {
  const { country } = useAuth();
  return <Prep key={country} />;
}

export default PrepRoute;
