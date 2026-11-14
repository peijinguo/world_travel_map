// A small map of Japan for the header on the Japan pages, drawn like the
// site logo (BrandLogo.jsx): green land with an ink outline.
// The outline is the 1:110m Natural Earth coastline of Honshu, Hokkaido and
// Shikoku, projected into the 48 x 48 box.

const INK = "#1f3a5a";
const JAPAN =
  "M33.6,25.1L31.1,27.4L30.5,30.1L29.3,32.1L29.4,33.5L27.9,35.1L24.9,35.7L21.2,35.1L17.6,37.3L16.4,36.1L16.7,34.1L12.9,33.9L10.1,34.6L7.6,34.1L9.4,36.4L7.1,40.4L5.5,41.1L4.7,39.9L5.7,37.8L4.5,36.8L4,34.9L6.2,34.5L7.6,33.2L10,32.3L11.9,30.9L16.3,31L18.4,32L21.6,27.8L22.8,29.4L26.4,27.4L27.9,26.6L29.9,23.5L30.2,20.4L31.5,18.8L33.8,18.8L34.1,22.9Z" +
  "M42.2,12.8L44,11.9L43.8,15.3L40.5,15.4L38,17.8L35.1,15.2L33.3,18L31,17.6L31.3,14.7L32.8,12.7L35.1,13L36.5,9.1L37.7,6.9L39.5,10.5L40.9,11.9Z" +
  "M10.3,35.8L11.8,34.5L13,35.1L14.1,34.2L15.5,35.1L15.6,36L14.1,37.3L13.4,36.3L12.2,36.6L11.3,38L10.1,37Z";

function JapanMapIcon() {
  return (
    <svg className="japan-map-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path className="japan-map-icon-land" transform="translate(0 -1)" d={JAPAN} fill="#93c07f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default JapanMapIcon;
