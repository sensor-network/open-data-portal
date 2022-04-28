/**
 * Originally from https://github.com/dcousens/haversine-distance under MIT license.
 **/

const asin = Math.asin;
const cos = Math.cos;
const sin = Math.sin;
const sqrt = Math.sqrt;
const PI = Math.PI;

// equatorial mean radius of Earth (in meters)
const R = 6378137;

const squared = (x: number) => {
  return x * x;
};
const toRad = (x: number) => {
  return (x * PI) / 180.0;
};
const hav = (x: number) => {
  return squared(sin(x / 2));
};

type Point = { lat: number; long: number };

// hav(theta) = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLon - aLon)
const haversine = (a: Point, b: Point) => {
  const aLat = toRad(a.lat);
  const bLat = toRad(b.lat);
  const aLng = toRad(a.long);
  const bLng = toRad(b.long);

  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng);
  return 2 * R * asin(sqrt(ht));
};

export default haversine;
