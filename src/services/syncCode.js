// A trip's cloud space id: a hash of its code, so the code itself (which
// works like a password for the trip) never reaches the database.
export async function hashSyncCode(code) {
  const data = new TextEncoder().encode(`travel-map:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Each country keeps its own copy of a trip's data (行前準備, 行程, 機票住宿,
// 想吃清單…). Japan, the first country, keeps the original space so its
// existing data stays where it is; every other country hashes its id in.
export function spaceIdFor(country, code) {
  return hashSyncCode(!country || country === "japan" ? code : `${country}:${code}`);
}

// The country of a page, from its hash route: #/c/<id>/… or Japan otherwise.
export function countryFromHash(hash = window.location.hash) {
  return hash.match(/^#\/c\/([A-Za-z]+)/)?.[1] ?? "japan";
}

// Each country also has its own list of trips: its own current trip, trip
// history and trip names on this device, and its own shared trip directory
// in the cloud. Japan keeps the original keys and directory.
export const storageKeyFor = (base, country) =>
  !country || country === "japan" ? base : `${base}:${country}`;

const TRIP_DIRECTORY_KEY = "__trip-directory__";
export function directoryIdFor(country) {
  return hashSyncCode(storageKeyFor(TRIP_DIRECTORY_KEY, country));
}
