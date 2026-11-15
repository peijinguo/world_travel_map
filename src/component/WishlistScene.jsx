import wide from "../assets/wishlist-bg-wide.webp";
import tall from "../assets/wishlist-bg-tall.webp";

// The picture behind 想吃清單 (little cakes scattered on white), filling the
// screen under the header, with candy sprinkles drifting slowly up over it and
// sugar sparkles twinkling (see _wishlist.scss). A landscape screen gets the
// wide picture, a portrait one (a phone) the tall one.
const SCENES = [
  { name: "wide", src: wide, w: 1805, h: 1016, sprinkles: 46, sparkles: 22 },
  { name: "tall", src: tall, w: 572, h: 1016, sprinkles: 28, sparkles: 14 },
];

const SPRINKLE_COLORS = ["#f4a7b9", "#f7d06b", "#9fd8c4", "#b9a4e3", "#f2b48a", "#8fc3ea"];

// Fixed pseudo-random numbers, the same on every render.
const random = (index, seed) => (n) => Math.abs((Math.sin((index + 1) * n + seed) * 10000) % 1);

function Sweets({ sprinkles, sparkles, seed }) {
  return (
    <div className="wishlist-scene-sweets">
      {Array.from({ length: sprinkles }, (_, index) => {
        const r = random(index, seed);
        const rise = 16 + r(4.123) * 14;
        return (
          <i
            key={`s${index}`}
            className="wishlist-sprinkle"
            style={{
              left: `${Math.round(r(12.9898) * 1000) / 10}%`,
              background: SPRINKLE_COLORS[index % SPRINKLE_COLORS.length],
              "--turn": `${Math.round(r(7.77) * 360)}deg`,
              "--spin": `${r(2.5) > 0.5 ? 1 : -1}`,
              animationDuration: `${rise.toFixed(1)}s, ${(3 + r(5.31) * 2).toFixed(1)}s`,
              animationDelay: `${-(r(93.989) * rise).toFixed(1)}s, ${-(r(8.1) * 4).toFixed(1)}s`,
            }}
          />
        );
      })}
      {Array.from({ length: sparkles }, (_, index) => {
        const r = random(index, seed + 50);
        return (
          <svg
            key={`k${index}`}
            className="wishlist-sparkle"
            viewBox="-10 -10 20 20"
            style={{
              left: `${Math.round(r(12.9898) * 1000) / 10}%`,
              top: `${Math.round(r(39.346) * 1000) / 10}%`,
              width: 10 + Math.round(r(4.1) * 8),
              animationDuration: `${(2.4 + r(6.2) * 2).toFixed(1)}s`,
              animationDelay: `${-(r(9.7) * 4).toFixed(1)}s`,
            }}
          >
            <path d="M0-10Q1.6-1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6-10 0Q-1.6-1.6 0-10Z" />
          </svg>
        );
      })}
    </div>
  );
}

function WishlistScene() {
  return (
    <div className="wishlist-scene" aria-hidden="true">
      {SCENES.map((scene, index) => (
        <div
          key={scene.name}
          className={`wishlist-scene-art is-${scene.name}`}
          style={{ "--ratio": scene.w / scene.h }}
        >
          <img className="wishlist-scene-bg" src={scene.src} alt="" />
          <Sweets sprinkles={scene.sprinkles} sparkles={scene.sparkles} seed={index * 7} />
        </div>
      ))}
    </div>
  );
}

export default WishlistScene;
