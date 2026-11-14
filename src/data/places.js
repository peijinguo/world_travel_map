// The places on each country's map (CountryHome.jsx), like the snow towns on
// the Japan map: a real [longitude, latitude], the region (ISO 3166-2 code
// in src/data/regions/<country>.json) it sits in, and a hand-drawn motif
// (PlaceMotif.jsx). `offset` moves the motif off the land onto a dotted
// leader, in map units (the map is 1000 x 1000), so neighbours do not overlap.
// `spots` are the sights in and around the place, listed on its panel card.
export const countryPlaces = {
  finland: [
    { id: "saariselka", name: "薩利色爾卡", en: "SAARISELKÄ", region: "FI-10", lonLat: [27.415, 68.416], motif: "aurora", note: "玻璃屋裡看極光", offset: [190, -40],
      spots: [{ name: "卡克斯勞塔寧北極度假村", en: "Kakslauttanen Arctic Resort" }, { name: "烏爾霍・吉科寧國家公園", en: "Urho Kekkonen National Park" }, { name: "考尼斯帕山頂", en: "Kaunispää" }, { name: "薩利色爾卡滑雪場", en: "Saariselkä Ski & Sport Resort" }] },
    { id: "levi", name: "列維", en: "LEVI", region: "FI-10", lonLat: [24.809, 67.805], motif: "ski", note: "芬蘭最大的滑雪場", offset: [-190, -60],
      spots: [{ name: "列維滑雪場", en: "Levi Ski Resort" }, { name: "列維山頂觀景台", en: "Levitunturi" }, { name: "列維玻璃屋", en: "Levin Iglut" }, { name: "帕拉斯-優拉斯國家公園", en: "Pallas-Yllästunturi National Park" }] },
    { id: "rovaniemi", name: "羅瓦涅米", en: "ROVANIEMI", region: "FI-10", lonLat: [25.847, 66.543], motif: "santa", note: "北極圈上的聖誕老人村", offset: [200, 50],
      spots: [{ name: "聖誕老人村", en: "Santa Claus Village" }, { name: "聖誕老人樂園", en: "SantaPark" }, { name: "北極科學館", en: "Arktikum" }, { name: "拉努阿野生動物園", en: "Ranua Wildlife Park" }] },
    { id: "koli", name: "科利國家公園", en: "KOLI", region: "FI-13", lonLat: [29.8, 63.1], motif: "hills", note: "山頂俯瞰森林與湖泊", offset: [130, -70],
      spots: [{ name: "烏科-科利觀景台", en: "Ukko-Koli" }, { name: "皮耶利寧湖", en: "Lake Pielinen" }, { name: "科利自然中心", en: "Koli Nature Centre Ukko" }] },
    { id: "kuopio", name: "庫奧皮奧", en: "KUOPIO", region: "FI-15", lonLat: [27.678, 62.893], motif: "tower", note: "普伊約塔看湖區", offset: [-210, -60],
      spots: [{ name: "普伊約塔", en: "Puijo Tower" }, { name: "庫奧皮奧市集廣場", en: "Kuopio Market Square" }, { name: "煙燻桑拿", en: "Jätkänkämppä Smoke Sauna" }, { name: "卡拉韋西湖", en: "Lake Kallavesi" }] },
    { id: "tampere", name: "坦佩雷", en: "TAMPERE", region: "FI-11", lonLat: [23.761, 61.498], motif: "sauna", note: "世界桑拿之都", offset: [-200, -40],
      spots: [{ name: "皮尼基觀景塔", en: "Pyynikki Observation Tower" }, { name: "拉烏哈涅米湖畔桑拿", en: "Rauhaniemi Folk Spa" }, { name: "姆明博物館", en: "Moomin Museum" }, { name: "沙卡尼耶米樂園", en: "Särkänniemi" }] },
    { id: "savonlinna", name: "薩翁林納", en: "SAVONLINNA", region: "FI-04", lonLat: [28.9, 61.864], motif: "lakeCastle", note: "湖中的奧拉維城堡", offset: [150, 40],
      spots: [{ name: "奧拉維城堡", en: "Olavinlinna" }, { name: "塞馬湖", en: "Lake Saimaa" }, { name: "林納薩里國家公園", en: "Linnansaari National Park" }, { name: "薩翁林納歌劇節", en: "Savonlinna Opera Festival" }] },
    { id: "turku", name: "圖爾庫", en: "TURKU", region: "FI-19", lonLat: [22.229, 60.435], motif: "castle", note: "芬蘭最古老的城市與城堡", offset: [-150, 50],
      spots: [{ name: "圖爾庫城堡", en: "Turku Castle" }, { name: "圖爾庫大教堂", en: "Turku Cathedral" }, { name: "奧拉河畔", en: "Aura River" }, { name: "姆明世界", en: "Moominworld" }] },
    { id: "helsinki", name: "赫爾辛基", en: "HELSINKI", region: "FI-18", lonLat: [24.952, 60.17], motif: "cathedral", note: "白色大教堂與港口市集", offset: [-60, 105],
      spots: [{ name: "赫爾辛基大教堂", en: "Helsinki Cathedral" }, { name: "芬蘭堡", en: "Suomenlinna" }, { name: "岩石教堂", en: "Temppeliaukio Church" }, { name: "港口露天市集", en: "Market Square" }, { name: "頌歌中央圖書館", en: "Oodi" }] },
    { id: "porvoo", name: "波爾沃", en: "PORVOO", region: "FI-18", lonLat: [25.665, 60.393], motif: "redHouses", note: "河岸紅色木屋老城", offset: [140, 80],
      spots: [{ name: "波爾沃老城", en: "Old Porvoo" }, { name: "河岸紅色倉庫", en: "Riverside Storehouses" }, { name: "波爾沃大教堂", en: "Porvoo Cathedral" }, { name: "布魯恩堡巧克力工坊", en: "Brunberg" }] },
  ],
};

// Region outlines are bundled per country and loaded with its page.
const regionLoaders = {
  finland: () => import("./regions/finland.json"),
};
export const loadRegions = (country) =>
  regionLoaders[country]?.().then((module) => module.default ?? module) ?? Promise.resolve(null);
