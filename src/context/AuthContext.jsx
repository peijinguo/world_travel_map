import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  addTripCode,
  deleteTripCloud,
  isFirebaseConfigured,
  observeAuth,
  removeTripCode,
  setTripName,
  signInAnonymous,
  subscribeTripCodes,
} from "../services/firebase";
import { countryFromHash, directoryIdFor, spaceIdFor, storageKeyFor } from "../services/syncCode";

const AuthContext = createContext(null);
const SYNC_CODE_STORAGE_KEY = "travel-map-sync-code";
const SYNC_CODE_HISTORY_STORAGE_KEY = "travel-map-sync-code-history";
const TRIP_NAMES_STORAGE_KEY = "travel-map-trip-names";
// The code this device made up on its own for a country with no trip yet. It
// keeps the pages working but is not a trip the user added, so it is never
// listed or shared; adding or choosing a trip replaces it.
const AUTO_CODE_STORAGE_KEY = "travel-map-sync-code-auto";
const MAX_TRIP_NAME_LENGTH = 24;

function getSavedTripNames(country) {
  try {
    const names = JSON.parse(localStorage.getItem(storageKeyFor(TRIP_NAMES_STORAGE_KEY, country)) ?? "{}");
    return names && typeof names === "object" && !Array.isArray(names) ? names : {};
  } catch {
    return {};
  }
}

function createSyncCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return [...bytes].map((value) => alphabet[value % alphabet.length]).join("");
}

function normalizeSyncCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);
}

function getSavedSyncCodes(currentCode, country) {
  try {
    const savedCodes = JSON.parse(
      localStorage.getItem(storageKeyFor(SYNC_CODE_HISTORY_STORAGE_KEY, country)) ?? "[]",
    );
    const normalizedCodes = Array.isArray(savedCodes)
      ? savedCodes.map(normalizeSyncCode).filter((code) => code.length >= 8)
      : [];
    return [...new Set([currentCode, ...normalizedCodes])].slice(0, 8);
  } catch {
    return [currentCode];
  }
}

// A country's current trip on this device; a country opened for the first
// time gets a hidden placeholder code (see AUTO_CODE_STORAGE_KEY).
function getSavedSyncCode(country) {
  const key = storageKeyFor(SYNC_CODE_STORAGE_KEY, country);
  const saved = normalizeSyncCode(localStorage.getItem(key) ?? "");
  if (saved.length >= 8) return saved;
  const next = createSyncCode();
  localStorage.setItem(key, next);
  localStorage.setItem(storageKeyFor(AUTO_CODE_STORAGE_KEY, country), next);
  return next;
}

// The placeholder code, if this device still has one for the country. Codes
// made before this was recorded are recognised by their look: the only trip,
// unnamed, twelve characters from createSyncCode's alphabet.
function getAutoCode(country) {
  try {
    const key = storageKeyFor(AUTO_CODE_STORAGE_KEY, country);
    const saved = normalizeSyncCode(localStorage.getItem(key) ?? "");
    if (saved) return saved;
    const current = normalizeSyncCode(localStorage.getItem(storageKeyFor(SYNC_CODE_STORAGE_KEY, country)) ?? "");
    const history = JSON.parse(localStorage.getItem(storageKeyFor(SYNC_CODE_HISTORY_STORAGE_KEY, country)) ?? "[]");
    const others = (Array.isArray(history) ? history : []).map(normalizeSyncCode).filter((code) => code && code !== current);
    if (/^[A-HJ-NP-Z2-9]{12}$/.test(current) && !others.length && !getSavedTripNames(country)[current]) {
      localStorage.setItem(key, current);
      return current;
    }
  } catch {
    // Storage blocked: nothing is hidden.
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  // The country whose pages are open. Each country has its own trips (list,
  // current trip, names) and its own copy of each trip's data. Read from the
  // address at start, then kept up to date by the layout (FrontendLayout).
  const [country, setCountryState] = useState(() => countryFromHash());
  const [syncCode, setSyncCodeState] = useState(() => getSavedSyncCode(country));
  const [localSyncCodes, setSyncCodes] = useState(() => getSavedSyncCodes(syncCode, country));
  const [sharedSyncCodes, setSharedSyncCodes] = useState([]);
  const [localTripNames, setLocalTripNames] = useState(() => getSavedTripNames(country));
  const [autoCode, setAutoCode] = useState(() => getAutoCode(country));
  const [sharedTripNames, setSharedTripNames] = useState({});
  // Names from the cloud win; this device's copy covers offline use.
  const tripNames = useMemo(
    () => ({ ...localTripNames, ...sharedTripNames }),
    [localTripNames, sharedTripNames],
  );
  const [tripDirectoryId, setTripDirectoryId] = useState(null);
  // Trips added on any device are listed everywhere, after this device's own.
  // The placeholder code is left out unless someone has named or shared it.
  const sharedCodes = useMemo(
    () => sharedSyncCodes.map(normalizeSyncCode).filter((code) => code.length >= 8),
    [sharedSyncCodes],
  );
  const draftCode = autoCode && !tripNames[autoCode] && !sharedCodes.includes(autoCode) ? autoCode : null;
  const syncCodes = useMemo(
    () => [...new Set([...localSyncCodes, ...sharedCodes])].filter((code) => code !== draftCode),
    [localSyncCodes, sharedCodes, draftCode],
  );
  const [syncSpaceId, setSyncSpaceId] = useState(null);
  const [syncVersion, setSyncVersion] = useState(0);
  // Opening another country switches to that country's own trips.
  const countryRef = useRef(country);
  const setCountry = useCallback((next) => {
    if (countryRef.current === next) return;
    countryRef.current = next;
    const code = getSavedSyncCode(next);
    setCountryState(next);
    setSyncCodeState(code);
    setSyncCodes(getSavedSyncCodes(code, next));
    setLocalTripNames(getSavedTripNames(next));
    setAutoCode(getAutoCode(next));
    setSharedSyncCodes([]);
    setSharedTripNames({});
    setTripDirectoryId(null);
    setSyncSpaceId(null);
    setSyncVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let attempted = false;
    return observeAuth(async (nextUser) => {
      if (!nextUser && isFirebaseConfigured && !attempted) {
        attempted = true;
        try {
          await signInAnonymous();
          return;
        } catch (error) {
          console.error("匿名同步驗證失敗", error);
          setAuthError("請在 Firebase Authentication 啟用「匿名」登入");
        }
      }
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    directoryIdFor(country).then((id) => {
      if (!cancelled) setTripDirectoryId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (!user || !tripDirectoryId) return undefined;
    return subscribeTripCodes(
      tripDirectoryId,
      ({ codes, names }) => {
        setSharedSyncCodes(Array.isArray(codes) ? codes : []);
        setSharedTripNames(names && typeof names === "object" ? names : {});
      },
      (error) => console.error("無法讀取共用的行程清單", error),
    );
  }, [user, tripDirectoryId]);

  const shareTripCode = (code) => {
    if (!user || !tripDirectoryId) return;
    addTripCode(tripDirectoryId, code).catch((error) =>
      console.error("無法共用行程代號", error),
    );
  };

  useEffect(() => {
    let cancelled = false;
    setSyncSpaceId(null);
    spaceIdFor(country, syncCode).then((spaceId) => {
      if (!cancelled) setSyncSpaceId(spaceId);
    });
    return () => {
      cancelled = true;
    };
  }, [syncCode, country]);

  const setSyncCode = (value) => {
    const next = normalizeSyncCode(value);
    if (next.length < 8) return false;
    localStorage.setItem(storageKeyFor(SYNC_CODE_STORAGE_KEY, country), next);
    if (draftCode) {
      // A real trip replaces the placeholder, which is dropped for good.
      localStorage.removeItem(storageKeyFor(AUTO_CODE_STORAGE_KEY, country));
      setAutoCode(null);
    }
    setSyncCodes((codes) => {
      const updatedCodes = [...new Set([next, ...codes.filter((code) => code !== draftCode)])].slice(0, 8);
      localStorage.setItem(
        storageKeyFor(SYNC_CODE_HISTORY_STORAGE_KEY, country),
        JSON.stringify(updatedCodes),
      );
      return updatedCodes;
    });
    setSyncSpaceId(null);
    setSyncCodeState(next);
    setSyncVersion((version) => version + 1);
    spaceIdFor(country, next).then(setSyncSpaceId);
    shareTripCode(next);
    return true;
  };

  // On the placeholder while real trips exist (shared from another device, or
  // added here before): open the first of them instead.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- moving off the placeholder once the trips are known
    if (draftCode && draftCode === syncCode && syncCodes.length) setSyncCode(syncCodes[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCode, syncCode, syncCodes]);

  const removeSyncCode = (value) => {
    const codeToRemove = normalizeSyncCode(value);
    const remainingCodes = syncCodes.filter((code) => code !== codeToRemove);
    if (remainingCodes.length === 0) return false;

    localStorage.setItem(
      storageKeyFor(SYNC_CODE_HISTORY_STORAGE_KEY, country),
      JSON.stringify(localSyncCodes.filter((code) => code !== codeToRemove)),
    );
    setSyncCodes((codes) => codes.filter((code) => code !== codeToRemove));

    setSharedSyncCodes((codes) => codes.filter((code) => code !== codeToRemove));
    if (user && tripDirectoryId) {
      removeTripCode(tripDirectoryId, codeToRemove).catch((error) =>
        console.error("無法從共用清單移除行程", error),
      );
    }

    if (codeToRemove === syncCode) {
      const nextCode = remainingCodes[0];
      localStorage.setItem(storageKeyFor(SYNC_CODE_STORAGE_KEY, country), nextCode);
      setSyncSpaceId(null);
      setSyncCodeState(nextCode);
      setSyncVersion((version) => version + 1);
    }
    return true;
  };

  const renameTrip = (value, name) => {
    const code = normalizeSyncCode(value);
    const nextName = String(name ?? "").trim().slice(0, MAX_TRIP_NAME_LENGTH);
    setLocalTripNames((names) => {
      const nextNames = { ...names, [code]: nextName };
      if (!nextName) delete nextNames[code];
      try {
        localStorage.setItem(storageKeyFor(TRIP_NAMES_STORAGE_KEY, country), JSON.stringify(nextNames));
      } catch {
        // The name still shows for this visit.
      }
      return nextNames;
    });
    setSharedTripNames((names) => {
      const nextNames = { ...names, [code]: nextName };
      if (!nextName) delete nextNames[code];
      return nextNames;
    });
    if (user && tripDirectoryId) {
      // Naming a trip also lists it for everyone, like adding it does.
      addTripCode(tripDirectoryId, code).catch(() => {});
      setTripName(tripDirectoryId, code, nextName).catch((error) =>
        console.error("無法同步行程名稱", error),
      );
    }
  };

  // Deletes the trip's cloud content, then drops it from every list.
  const deleteTrip = async (value) => {
    const code = normalizeSyncCode(value);
    if (!user) throw new Error("not-connected");
    if (!syncCodes.some((savedCode) => savedCode !== code)) {
      throw new Error("last-trip");
    }
    await deleteTripCloud(await spaceIdFor(country, code));
    removeSyncCode(code);
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      authError,
      isFirebaseConfigured,
      syncCode,
      syncCodes,
      syncSpaceId,
      syncVersion,
      setSyncCode,
      removeSyncCode,
      deleteTrip,
      tripNames,
      tripName: tripNames[syncCode] ?? "",
      // The current code when it is only the hidden placeholder, else null.
      draftCode: draftCode === syncCode ? draftCode : null,
      tripDirectoryId,
      country,
      setCountry,
      renameTrip,
    }),
    // The setters read these too, so a new list or directory id must reach them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, authReady, authError, syncCode, syncCodes, localSyncCodes, tripDirectoryId, syncSpaceId, syncVersion, tripNames, country, draftCode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
