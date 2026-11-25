import { useCallback, useEffect, useRef, useState } from "react";
import { loadPlannerCloud, subscribePlannerCloud } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { countryBase } from "../../data/countries";
import { Link, useSearchParams } from "react-router-dom";
import { isLodgingName } from "../../services/freeMaps";
import "../../assets/pages/_hotel.scss";
import CountryScene from "../../component/CountryScene";
import FlightCards from "../../component/FlightCards";
import LodgingPrice, { LodgingMeals } from "../../component/LodgingPrice";

// Itinerary versions are labelled A, B, C… by position; older saved data
// still says "版本 1", "版本 2", so convert those on read.
const versionLabel = (index) => String.fromCharCode(65 + index);
const normalizeVersionLabel = (label) => {
  const legacy = /^版本\s*(\d+)$/u.exec(label ?? "");
  if (legacy) return versionLabel(Number(legacy[1]) - 1);
  return label || versionLabel(0);
};

const LODGING_STORAGE_KEY = "yuki-tabi-lodgings-v1";
const PLANNER_STORAGE_KEY = "yuki-tabi-planner-days-v2";
// Which synced trip this device's copy of 行程規劃 belongs to (Planner.jsx).
const PLANNER_SPACE_STORAGE_KEY = "yuki-tabi-planner-space-v1";
const NON_LODGING_NAME_PATTERN = /滑雪場|滑雪场|スキー場|ski\s*(?:area|resort)/iu;
const CHECKOUT_PATTERN = /退房|退宿|チェック[\s-]*アウト|check[\s-]*out/iu;
const LODGING_TYPES = new Set([
  "lodging",
  "hotel",
  "motel",
  "hostel",
  "guest_house",
  "resort",
  "campground",
  "rv_park",
]);

// Known official sites by name. They win over OpenStreetMap's website tag,
// which is missing for some lodgings and wrong for others (海と灯 points at a
// bike-share site).
const KNOWN_LODGING_WEBSITES = [
  { pattern: /グリーンピア大沼|green\s*pia\s*onuma/i, url: "https://www.gp-onuma.com/stay/hotel/" },
  { pattern: /笑\s*函館屋|emi\s*hakodateya/i, url: "https://www.hakodateya.jp/" },
  { pattern: /大沼\s*(?:プリンス|王子)|onuma\s*prince/i, url: "https://www.princehotels.co.jp/hakodate/" },
  { pattern: /海と灯|ヒューイットリゾート|umi\s*to\s*akari|hewitt\s*resort/i, url: "https://hewitt-resort.com/" },
];
const getLodgingWebsite = (lodging) =>
  KNOWN_LODGING_WEBSITES.find(({ pattern }) =>
    // NFKC folds half-width kana and split dakuten (フ + ゚) into plain プ.
    pattern.test(`${lodging.name ?? ""} ${lodging.displayName ?? ""}`.normalize("NFKC")),
  )?.url ||
  lodging.website ||
  "";

const formatStayDate = (dateString, dayNumber, action = "入住") => {
  if (!dateString) return `入住日期尚未設定 DAY ${dayNumber ?? "?"}`;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return `${dateString} DAY ${dayNumber ?? "?"}`;
  const weekday = "日一二三四五六"[date.getDay()];
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("/");
  return `${ymd} (${weekday}) DAY ${dayNumber ?? "?"} ${action}`;
};

// The day after a stay date (YYYY-MM-DD), or "" when it has none.
const dayAfter = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  if (!dateString || Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// A lodging's nights in date order, each run of nights in a row followed by
// its 退房 the morning after.
const stayRows = (entries) => {
  const nights = [...new Map(entries.map((entry) => [entry.key, entry])).values()].sort(
    (first, second) => (first.date || "9999-12-31").localeCompare(second.date || "9999-12-31"),
  );
  const dates = new Set(nights.map((entry) => entry.date).filter(Boolean));
  return nights.flatMap((entry) => {
    const checkout = dayAfter(entry.date);
    return checkout && !dates.has(checkout)
      ? [entry, { key: `${entry.key}:checkout`, date: checkout, dayNumber: entry.dayNumber + 1, checkout: true }]
      : [entry];
  });
};

// The lodgings of a trip, from its 行程規劃 days: the synced trip's days when
// given, else this device's copy (which may belong to another trip).
function loadLodgings(days) {
  try {
    const lodgings = JSON.parse(localStorage.getItem(LODGING_STORAGE_KEY)) ?? [];
    if (!Array.isArray(lodgings)) return [];

    const plannerDays = days ?? JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY)) ?? [];
    const lodgingItems = Array.isArray(plannerDays)
      ? plannerDays.flatMap((day, dayIndex) => {
          const versions = Array.isArray(day.versions) && day.versions.length
            ? day.versions.map((version, index) => ({
                ...version,
                label: versionLabel(index),
                items:
                  version.id === day.activeVersionId
                    ? day.items
                    : version.items,
              }))
            : [{ id: "version-1", label: versionLabel(0), items: day.items ?? [] }];
          return versions.flatMap((version) =>
            (version.items ?? [])
              .filter(
                (item) =>
                  !CHECKOUT_PATTERN.test(item.text ?? "") &&
                  item.location &&
                  !NON_LODGING_NAME_PATTERN.test(item.location.name ?? "") &&
                  (item.location.types?.some((type) => LODGING_TYPES.has(type)) ||
                    (!item.location.types?.length && isLodgingName(item.location.name))),
              )
              .map((item) => ({ item, day, dayIndex, version })),
          );
        })
      : [];
    const activeItemIds = new Set(
      lodgingItems.map(({ item }) => item.id),
    );
    const activeLocationIds = new Set(
      lodgingItems.map(({ item }) => item.location?.id).filter(Boolean),
    );

    const hotelLodgings = lodgings.filter(
      (lodging) =>
        !NON_LODGING_NAME_PATTERN.test(lodging.name ?? "") &&
        (lodging.stayItemId
          ? activeItemIds.has(lodging.stayItemId)
          : activeLocationIds.has(lodging.id)),
    );
    const rebuiltLodgings = lodgingItems.map(
      ({ item, day, dayIndex, version }) => ({
      id: item.location.id,
      name: item.location.name,
      displayName: item.location.displayName ?? item.location.name,
      website: item.location.website ?? "",
      stayDate: day.date ?? "",
      stayDayLabel: day.label ?? "",
      stayDayId: day.id ?? "",
      stayDayNumber: dayIndex + 1,
      stayVersionId: version.id,
      stayVersionLabel: version.label,
      stayItemId: item.id,
      updatedAt: Date.now(),
      }),
    );
    const rebuiltItemIds = new Set(
      rebuiltLodgings.map((lodging) => lodging.stayItemId),
    );
    const mergedLodgings = [
      ...rebuiltLodgings,
      ...hotelLodgings.filter(
        (lodging) => !rebuiltItemIds.has(lodging.stayItemId),
      ),
    ];
    localStorage.setItem(
      LODGING_STORAGE_KEY,
      JSON.stringify(mergedLodgings),
    );
    return mergedLodgings;
  } catch {
    return [];
  }
}

function Hotel() {
  // This country's own pages (Japan: /hotel, others: /c/<id>/hotel).
  const { country, user, syncSpaceId, isFirebaseConfigured } = useAuth();
  const base = countryBase(country);
  const cloudKey = user && syncSpaceId ? syncSpaceId : null;
  // This device's copy of 行程規劃 is only used when it is this trip's.
  const [lodgings, setLodgings] = useState(() =>
    !isFirebaseConfigured || localStorage.getItem(PLANNER_SPACE_STORAGE_KEY) === syncSpaceId
      ? loadLodgings()
      : [],
  );
  // The chosen trip's days from the cloud, so switching trips (or coming
  // from another country's pages) always shows that trip's lodgings.
  const cloudDaysRef = useRef(null);
  useEffect(() => {
    cloudDaysRef.current = null;
    if (!cloudKey) return undefined;
    let cancelled = false;
    const apply = (cloud) => {
      if (cancelled) return;
      const days = Array.isArray(cloud?.days) ? cloud.days : [];
      cloudDaysRef.current = days;
      setLodgings(loadLodgings(days));
    };
    loadPlannerCloud(cloudKey).then(apply).catch(() => {});
    const stop = subscribePlannerCloud(cloudKey, apply, () => {});
    return () => {
      cancelled = true;
      stop();
    };
  }, [cloudKey]);
  const [searchParams] = useSearchParams();
  const selectedLodgingId = searchParams.get("lodging");
  const availableVersions = [
    ...new Set(lodgings.map((lodging) => normalizeVersionLabel(lodging.stayVersionLabel))),
  ].sort((first, second) =>
    first.localeCompare(second, "zh-Hant", { numeric: true }),
  );
  const requestedVersion = searchParams.get("version");
  const selectedVersion = availableVersions.includes(requestedVersion)
    ? requestedVersion
    : availableVersions[0] ?? versionLabel(0);
  const versionLodgings = lodgings.filter(
    (lodging) => normalizeVersionLabel(lodging.stayVersionLabel) === selectedVersion,
  );
  const [selectedLodgingElement, setSelectedLodgingElement] = useState(null);
  const refreshLodgings = useCallback(
    () => setLodgings(loadLodgings(cloudDaysRef.current ?? undefined)),
    [],
  );
  const groupedLodgings = [...versionLodgings.reduce((groups, lodging) => {
    const key = lodging.id || `${lodging.name}::${lodging.displayName}`;
    const group = groups.get(key) ?? {
      ...lodging,
      stayDates: [],
      stayVersions: [],
      stayEntries: [],
    };
    group.stayDates.push(lodging.stayDate);
    group.stayVersions.push({
      key: `${lodging.stayDayId}:${lodging.stayVersionId ?? "version-1"}`,
      dayId: lodging.stayDayId,
      versionId: lodging.stayVersionId ?? "version-1",
      label: normalizeVersionLabel(lodging.stayVersionLabel),
    });
    group.stayEntries.push({
      key: `${lodging.stayDate}:${lodging.stayDayId}:${lodging.stayVersionId ?? "version-1"}`,
      date: lodging.stayDate,
      dayNumber: lodging.stayDayNumber,
      dayId: lodging.stayDayId,
      versionId: lodging.stayVersionId ?? "version-1",
    });
    groups.set(key, group);
    return groups;
  }, new Map()).values()].sort((first, second) => {
    const firstDate = first.stayDates.filter(Boolean).sort()[0] ?? "9999-12-31";
    const secondDate = second.stayDates.filter(Boolean).sort()[0] ?? "9999-12-31";
    return firstDate.localeCompare(secondDate);
  });

  useEffect(() => {
    window.addEventListener("storage", refreshLodgings);
    window.addEventListener("lodgings-changed", refreshLodgings);
    return () => {
      window.removeEventListener("storage", refreshLodgings);
      window.removeEventListener("lodgings-changed", refreshLodgings);
    };
  }, [refreshLodgings]);

  useEffect(() => {
    selectedLodgingElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedLodgingElement]);

  return (
    <section className="hotel-page">
      <CountryScene country={country} page="hotel" />
      <h2 className="hotel-section-title"><span className="brush-title">機票</span></h2>
      <FlightCards />
      <h2 className="hotel-section-title"><span className="brush-title">住宿</span></h2>
      {availableVersions.length > 0 && (
        <nav className="hotel-version-nav" aria-label="住宿行程版本">
          {availableVersions.map((version) => (
            <Link
              key={version}
              className={version === selectedVersion ? "is-active" : undefined}
              to={`${base}/hotel?version=${encodeURIComponent(version)}`}
            >
              {version}
            </Link>
          ))}
        </nav>
      )}
      {groupedLodgings.length ? (
        <ul className="hotel-list">
          {groupedLodgings.map((lodging) => (
            <li
              key={lodging.id || `${lodging.name}-${lodging.displayName}`}
              ref={selectedLodgingId === lodging.id ? setSelectedLodgingElement : null}
              className={selectedLodgingId === lodging.id ? "hotel-list-item-selected" : undefined}
            >
              <div>
                <strong>{lodging.name}</strong>
                <span>{lodging.displayName}</span>
                <div className="hotel-stay-date-links">
                  {stayRows(lodging.stayEntries).map((entry) => (
                    <div key={entry.key} className={`hotel-stay-date ${entry.checkout ? "is-checkout" : ""}`}>
                      {entry.checkout ? (
                        <span className="hotel-checkout-date">{formatStayDate(entry.date, entry.dayNumber, "退房")}</span>
                      ) : (
                        <Link
                          to={`${base}/planner?day=${encodeURIComponent(entry.dayId)}&version=${encodeURIComponent(entry.versionId)}`}
                        >
                          {formatStayDate(entry.date, entry.dayNumber)}
                        </Link>
                      )}
                      <LodgingMeals
                        stayKey={`${selectedVersion}:${lodging.id || lodging.name}:${entry.checkout ? `checkout-${entry.date}` : entry.dayId}`}
                      />
                    </div>
                  ))}
                </div>
                <LodgingPrice
                  priceKey={`${selectedVersion}:${lodging.id || lodging.name}`}
                  nights={new Set(lodging.stayEntries.map((entry) => entry.key)).size}
                />
              </div>
              <div className="hotel-list-actions">
                {getLodgingWebsite(lodging) ? (
                  <a
                    className="hotel-website-link"
                    href={getLodgingWebsite(lodging)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="前往官方網站"
                    data-tooltip="前往官方網站"
                  >
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <a
                    className="hotel-website-link"
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${lodging.name} 官方網站`)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="搜尋官方網站"
                    data-tooltip="搜尋官方網站"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="6" />
                      <path d="m15 15 5 5" />
                    </svg>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="hotel-empty">
          版本 {selectedVersion} 尚未有住宿資料。請先在該版本輸入並定位住宿。
        </div>
      )}
    </section>
  );
}

export default Hotel;
