import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured, loadPlannerCloud, savePastTrip, subscribePastTrips } from "../services/firebase";
import { hashSyncCode } from "../services/syncCode";
import PlannerDatePicker from "./PlannerDatePicker";

// The planner keeps the current trip's days here when there is no cloud.
const LOCAL_DAYS_KEY = "yuki-tabi-planner-days-v2";

const todayKey = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / DAY_MS);
const formatDate = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return `${year}/${month}/${day}`;
};

// The first and last dated day of a trip's plan.
const summarise = (days) => {
  const dates = (Array.isArray(days) ? days : [])
    .map((day) => day?.date)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date ?? ""))
    .sort();
  return { start: dates[0] ?? null, end: dates.at(-1) ?? null, dayCount: Array.isArray(days) ? days.length : 0 };
};

const readLocalDays = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_DAYS_KEY) ?? "[]");
  } catch {
    return [];
  }
};

// Every saved trip with its dates: from the cloud when connected, otherwise
// only the current trip, whose plan is the one kept on this device.
function useTripSummaries() {
  const { user, syncCode, syncCodes, tripNames } = useAuth();
  const [summaries, setSummaries] = useState(null);
  const cloud = Boolean(user && isFirebaseConfigured);
  const codesKey = (cloud ? syncCodes : [syncCode]).join(",");

  useEffect(() => {
    let live = true;
    const codes = codesKey ? codesKey.split(",") : [];
    const load = cloud
      ? Promise.all(
          codes.map(async (code) => {
            try {
              const data = await loadPlannerCloud(await hashSyncCode(code));
              return { code, ...summarise(data?.days) };
            } catch {
              return { code, ...summarise([]), failed: true };
            }
          }),
        )
      : Promise.resolve(codes.map((code) => ({ code, ...summarise(readLocalDays()) })));
    load.then((result) => {
      if (live) setSummaries(result);
    });
    return () => {
      live = false;
    };
  }, [cloud, codesKey]);

  return summaries?.map((trip) => ({ ...trip, name: tripNames[trip.code] || trip.code }));
}

const PAST_TRIPS_KEY = "travel-map-past-trips";

const readLocalPastTrips = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PAST_TRIPS_KEY) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

// Trips added by hand to 已完成行程: shared through the cloud when connected,
// otherwise kept on this device.
function usePastTrips() {
  const { user, tripDirectoryId } = useAuth();
  const cloud = Boolean(user && tripDirectoryId);
  const [cloudTrips, setCloudTrips] = useState(null);
  const [localTrips, setLocalTrips] = useState(readLocalPastTrips);

  useEffect(() => {
    if (!cloud) return undefined;
    return subscribePastTrips(tripDirectoryId, setCloudTrips, (error) => {
      console.error("無法讀取已完成行程", error);
      setCloudTrips({});
    });
  }, [cloud, tripDirectoryId]);

  const trips = cloud ? cloudTrips : localTrips;
  const save = (id, trip) => {
    if (cloud) return savePastTrip(tripDirectoryId, id, trip);
    const next = { ...readLocalPastTrips() };
    if (trip) next[id] = trip;
    else delete next[id];
    localStorage.setItem(PAST_TRIPS_KEY, JSON.stringify(next));
    setLocalTrips(next);
    return Promise.resolve();
  };

  const list = trips
    ? Object.entries(trips).map(([id, trip]) => ({
        id,
        manual: true,
        name: trip.name,
        start: trip.start,
        end: trip.end || trip.start,
        dayCount: daysBetween(trip.start, trip.end || trip.start) + 1,
      }))
    : null;
  return { trips: list, save };
}

function TripRow({ trip, today, kind, onPick, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  let badge;
  if (!trip.start) badge = "尚未排定日期";
  else if (kind === "done") badge = `${daysBetween(trip.end, today)} 天前結束`;
  else if (trip.start <= today) badge = "旅行中";
  else badge = `還有 ${daysBetween(today, trip.start)} 天`;

  const body = (
    <>
      <span className="trip-card-name">{trip.name}</span>
      {trip.start && (
        <span className="trip-card-dates">
          {`${formatDate(trip.start)}${trip.end !== trip.start ? ` – ${formatDate(trip.end)}` : ""}`}
        </span>
      )}
      <span className={`trip-card-badge is-${kind}${trip.start && trip.start <= today && kind === "upcoming" ? " is-now" : ""}`}>{badge}</span>
    </>
  );

  // A hand-added trip has no plan to open; it can be removed instead.
  if (trip.manual) {
    return (
      <li className="is-manual">
        <div className="trip-card-row">{body}</div>
        <button
          type="button"
          className={`trip-card-remove${confirming ? " is-confirming" : ""}`}
          aria-label={confirming ? `確定刪除${trip.name}` : `刪除${trip.name}`}
          onClick={() => (confirming ? onRemove(trip.id) : setConfirming(true))}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? "刪除" : "×"}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button type="button" className="trip-card-row" onClick={() => onPick(trip.code)}>
        {body}
      </button>
    </li>
  );
}

function PastTripForm({ today, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("請輸入行程名稱");
    if (!start) return setError("請選擇出發日期");
    if (end && end < start) return setError("回程日期不能早於出發日期");
    if ((end || start) >= today) return setError("已完成的行程要在今天以前結束");
    setSaving(true);
    try {
      await onSave({ name: trimmed.slice(0, 24), start, end: end || start });
    } catch {
      setError("儲存失敗，請稍後再試一次");
      setSaving(false);
    }
  };

  return (
    <form className="trip-card-form" onSubmit={submit}>
      <input
        value={name}
        maxLength="24"
        placeholder="行程名稱，例如：2025 冰島極光"
        aria-label="行程名稱"
        autoFocus
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
      />
      <div className="trip-card-form-dates">
        <div className="trip-card-form-field">
          <span>出發</span>
          <PlannerDatePicker value={start} onChange={(date) => { setStart(date); setError(""); }} />
        </div>
        <div className="trip-card-form-field">
          <span>回程</span>
          <PlannerDatePicker value={end} placeholder="同出發日" onChange={(date) => { setEnd(date); setError(""); }} />
        </div>
      </div>
      {error && <p className="trip-card-form-error" role="alert">{error}</p>}
      <div className="trip-card-form-actions">
        <button type="button" onClick={onCancel}>取消</button>
        <button type="submit" className="is-primary" disabled={saving}>{saving ? "儲存中…" : "加入"}</button>
      </div>
    </form>
  );
}

// The home page menu: one card of finished trips and one of trips to come.
// Finished trips come from the plans whose dates have passed plus any added
// by hand; a planned trip opens in 行程規劃.
function TripCards({ onDone }) {
  const navigate = useNavigate();
  const { setSyncCode } = useAuth();
  const trips = useTripSummaries();
  const past = usePastTrips();
  const [adding, setAdding] = useState(false);
  const today = todayKey();

  const loaded = Boolean(trips && past.trips);
  const done = [...(trips ?? []).filter((trip) => trip.end && trip.end < today), ...(past.trips ?? [])]
    .sort((a, b) => b.end.localeCompare(a.end));
  const upcoming = (trips ?? [])
    .filter((trip) => !trip.end || trip.end >= today)
    // Dated trips soonest first, then the ones without dates.
    .sort((a, b) => (a.start ?? "9999").localeCompare(b.start ?? "9999"));

  const pick = (code) => {
    setSyncCode(code);
    onDone?.();
    navigate("/planner");
  };

  const card = (kind, title, icon, list, empty, extra) => (
    <section className={`trip-card is-${kind}`} aria-label={title}>
      <header className="trip-card-head">
        <span className="trip-card-icon" aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
        <span className="trip-card-count">{loaded ? list.length : "…"}</span>
        {extra}
      </header>
      {kind === "done" && adding && (
        <PastTripForm
          today={today}
          onCancel={() => setAdding(false)}
          onSave={async (trip) => {
            await past.save(`trip-${Date.now().toString(36)}`, trip);
            setAdding(false);
          }}
        />
      )}
      {!loaded ? (
        <p className="trip-card-empty">讀取行程中…</p>
      ) : list.length ? (
        <ul>
          {list.map((trip) => (
            <TripRow
              key={trip.id ?? trip.code}
              trip={trip}
              today={today}
              kind={kind}
              onPick={pick}
              onRemove={(id) => past.save(id, null)}
            />
          ))}
        </ul>
      ) : (
        !adding && <p className="trip-card-empty">{empty}</p>
      )}
    </section>
  );

  return (
    <div className="trip-cards">
      {card(
        "done",
        "已完成行程",
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="m8 12.3 2.7 2.7L16.2 9.5" /></svg>,
        done,
        "還沒有完成的行程，按「＋」把去過的旅行加進來",
        <button
          type="button"
          className="trip-card-add"
          aria-label="新增已完成行程"
          aria-expanded={adding}
          onClick={() => setAdding((open) => !open)}
        >
          {adding ? "×" : "＋"}
        </button>,
      )}
      {card(
        "upcoming",
        "即將到來行程",
        <svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>,
        upcoming,
        "還沒有排定的行程",
      )}
    </div>
  );
}

export default TripCards;
