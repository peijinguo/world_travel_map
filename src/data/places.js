// The places on each country's map (CountryHome.jsx), like the snow towns on
// the Japan map: a real [longitude, latitude], the region (ISO 3166-2 code
// in src/data/regions/<country>.json) it sits in, and a hand-drawn motif
// (PlaceMotif.jsx). `offset` moves the motif off the land onto a dotted
// leader, in map units (the map is 1000 x 1000), so neighbours do not overlap.
export const countryPlaces = {
  finland: [
    { id: "saariselka", name: "薩利色爾卡", en: "SAARISELKÄ", region: "FI-10", lonLat: [27.415, 68.416], motif: "aurora", note: "玻璃屋裡看極光", offset: [190, -40] },
    { id: "levi", name: "列維", en: "LEVI", region: "FI-10", lonLat: [24.809, 67.805], motif: "ski", note: "芬蘭最大的滑雪場", offset: [-190, -60] },
    { id: "rovaniemi", name: "羅瓦涅米", en: "ROVANIEMI", region: "FI-10", lonLat: [25.847, 66.543], motif: "santa", note: "北極圈上的聖誕老人村", offset: [200, 50] },
    { id: "koli", name: "科利國家公園", en: "KOLI", region: "FI-13", lonLat: [29.8, 63.1], motif: "hills", note: "山頂俯瞰森林與湖泊", offset: [130, -70] },
    { id: "kuopio", name: "庫奧皮奧", en: "KUOPIO", region: "FI-15", lonLat: [27.678, 62.893], motif: "tower", note: "普伊約塔看湖區", offset: [-210, -60] },
    { id: "tampere", name: "坦佩雷", en: "TAMPERE", region: "FI-11", lonLat: [23.761, 61.498], motif: "sauna", note: "世界桑拿之都", offset: [-200, -40] },
    { id: "savonlinna", name: "薩翁林納", en: "SAVONLINNA", region: "FI-04", lonLat: [28.9, 61.864], motif: "lakeCastle", note: "湖中的奧拉維城堡", offset: [150, 40] },
    { id: "turku", name: "圖爾庫", en: "TURKU", region: "FI-19", lonLat: [22.229, 60.435], motif: "castle", note: "芬蘭最古老的城市與城堡", offset: [-150, 50] },
    { id: "helsinki", name: "赫爾辛基", en: "HELSINKI", region: "FI-18", lonLat: [24.952, 60.17], motif: "cathedral", note: "白色大教堂與港口市集", offset: [-60, 105] },
    { id: "porvoo", name: "波爾沃", en: "PORVOO", region: "FI-18", lonLat: [25.665, 60.393], motif: "redHouses", note: "河岸紅色木屋老城", offset: [140, 80] },
  ],
};

// Region outlines are bundled per country and loaded with its page.
const regionLoaders = {
  finland: () => import("./regions/finland.json"),
};
export const loadRegions = (country) =>
  regionLoaders[country]?.().then((module) => module.default ?? module) ?? Promise.resolve(null);
