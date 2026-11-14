import { useCallback, useEffect, useRef, useState } from "react";

// The snow on top of the 行前準備 notebook: it piles up slowly along the top
// edge; once the pile is full, clumps of it slide off and land on the first
// items, hiding their text. A sideways swipe across the notebook brushes the
// snow away, and it starts piling up again.
const FILL_SECONDS = 45; // empty to full
const TICK_MS = 200;
const AFTER_FALL = 0.3; // what stays on top once the clumps have fallen
const SWIPE_PX = 50;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The pile's outline when full: the notebook's original snow cap, in a 400 × 30
// box stretched to its width. It grows up to this from the frame (y 19).
const CAP_PATH =
  "M5 17C4 9 13 6 22 7C40 2 60 4 78 6C100 1 130 2 150 5C175 1 205 2 228 5C255 0 290 2 312 5C340 1 365 3 380 6C391 6 397 11 395 17C390 20 380 19 372 19C366 19 365 27 358 27C351 27 352 19 344 19L300 19C291 19 289 24 282 24C275 24 276 19 268 19L200 19C192 19 191 29 183 29C175 29 176 19 168 19L110 19C102 19 101 25 94 25C87 25 88 19 80 19L30 19C20 19 9 22 5 17Z";

// A lump of snow, drawn a little differently each time from its seed.
function clumpPath(seed) {
  const r = (n) => 0.5 + 0.5 * Math.sin(seed * 12.9898 + n * 78.233);
  const h = 22 + r(1) * 8;
  return `M6 ${h}C2 ${h - 8} 8 ${10 - r(2) * 4} 20 ${9 - r(3) * 4}C30 ${2 + r(4) * 3} 44 ${3 + r(5) * 4} 54 ${8 - r(6) * 3}C66 ${2 + r(7) * 4} 82 ${6 + r(8) * 3} 90 ${12 + r(9) * 3}C98 ${15 + r(1) * 4} 99 ${h - 6} 94 ${h}C80 ${h + 4} 60 ${h + 2} 48 ${h + 3}C30 ${h + 5} 14 ${h + 4} 6 ${h}Z`;
}

export default function usePrepSnowfall(sheetRef) {
  const still = reducedMotion();
  const [level, setLevel] = useState(still ? 1 : 0);
  const [clumps, setClumps] = useState([]);
  const [brushing, setBrushing] = useState(0); // swipe direction while clearing
  const levelRef = useRef(level);
  const fallenRef = useRef(false);

  // Snow over the first few items' text, placed from the list as it is now.
  const dropClumps = useCallback(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const sheetBox = sheet.getBoundingClientRect();
    const texts = [...sheet.querySelectorAll(".prep-list .prep-text")].slice(0, 4);
    const seed = Date.now() % 1000;
    setClumps(
      texts.flatMap((text, index) => {
        const box = text.getBoundingClientRect();
        const width = Math.min(150, Math.max(80, box.width * 0.75));
        const left = box.left - sheetBox.left - 8 + ((seed * (index + 3)) % 30);
        return [{
          id: `${seed}-${index}`,
          left,
          top: box.top - sheetBox.top + box.height / 2 - 18,
          width,
          fallFrom: box.top - sheetBox.top + 60,
          delay: index * 0.18,
          seed: seed + index,
        }];
      }),
    );
  }, [sheetRef]);

  // Pile up, and let the clumps fall once full.
  useEffect(() => {
    if (still) return undefined;
    const step = TICK_MS / 1000 / FILL_SECONDS;
    const timer = window.setInterval(() => {
      if (fallenRef.current) return;
      const next = Math.min(1, levelRef.current + step);
      levelRef.current = next;
      setLevel(next);
      if (next >= 1) {
        fallenRef.current = true;
        dropClumps();
        window.setTimeout(() => {
          levelRef.current = AFTER_FALL;
          setLevel(AFTER_FALL);
        }, 250);
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [still, dropClumps]);

  // Brush everything off, then start piling up again.
  const brush = useCallback((direction) => {
    if (still || (!fallenRef.current && levelRef.current < 0.08)) return;
    setBrushing(direction);
    fallenRef.current = true; // hold the pile while it slides off
    window.setTimeout(() => {
      levelRef.current = 0;
      setLevel(0);
      setClumps([]);
      setBrushing(0);
      fallenRef.current = false;
    }, 520);
  }, [still]);

  // A sideways swipe anywhere on the notebook; vertical drags still scroll.
  // A swipe that starts or ends on an item never also ticks it.
  const start = useRef(null);
  const swipedAt = useRef(0);
  const checkSwipe = (event) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.4) {
      start.current = null;
      swipedAt.current = Date.now();
      brush(Math.sign(dx));
    }
  };
  const swipeHandlers = {
    onPointerDown: (event) => {
      start.current = { x: event.clientX, y: event.clientY };
    },
    onPointerMove: checkSwipe,
    onPointerUp: (event) => {
      checkSwipe(event);
      start.current = null;
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (event) => {
      if (Date.now() - swipedAt.current < 500) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  };

  const cap = (
    <svg
      className={`prep-snowcap ${brushing ? "is-brushed" : ""}`}
      style={{ "--brush": brushing, "--level": Math.max(0.08, level) }}
      viewBox="0 0 400 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={CAP_PATH} />
    </svg>
  );

  const fallen = clumps.length > 0 && (
    <div className="prep-snow-clumps" aria-hidden="true">
      {clumps.map((clump) => (
        <svg
          key={clump.id}
          className={`prep-snow-clump ${brushing ? "is-brushed" : ""}`}
          viewBox="0 0 100 34"
          preserveAspectRatio="none"
          style={{
            left: clump.left,
            top: clump.top,
            width: clump.width,
            "--fall": `${-clump.fallFrom}px`,
            "--brush": brushing,
            animationDelay: `${clump.delay}s`,
          }}
        >
          <path d={clumpPath(clump.seed)} />
        </svg>
      ))}
    </div>
  );

  return { cap, fallen, swipeHandlers, hasSnow: clumps.length > 0 };
}
