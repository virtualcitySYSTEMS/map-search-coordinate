import { Coordinate, toStringHDMS } from 'ol/coordinate';

export const latRegex =
  /(?:90|[0-8]?[0-9])°\s*([0-5]?[0-9]'\s*)?([0-5]?[0-9](?:[.,]\d{1,5})?"\s*)?\s*[NS]/;

export const lonRegex =
  /(?:180|1[0-7][0-9]|0?[0-9][0-9]|[0-9])°\s*([0-5]?[0-9]'\s*)?([0-5]?[0-9](?:[.,]\d{1,5})?"\s*)?\s?[EW]/;

function dmsToDecimal(coord: string): number {
  let dd = 0;
  let dir;
  const parts = coord.split(/[^\w.]+/);
  if (parts.length === 2) {
    dd = Number(parts[0]);
    dir = parts[1];
  } else if (parts.length === 3) {
    dd = Number(parts[0]) + Number(parts[1]) / 60;
    dir = parts[2];
  } else if (parts.length === 4) {
    dd =
      Number(parts[0]) + Number(parts[1]) / 60 + Number(parts[2]) / (60 * 60);
    dir = parts[3];
  }

  if (dir === 'S' || dir === 'W') {
    dd *= -1;
  } // Don't do anything for N or E
  return dd;
}

export function parseDMS(input: string[]): Coordinate {
  return input.map(dmsToDecimal);
}

export function toDMS(coordinate: Coordinate): string[] {
  const dmsString = toStringHDMS(coordinate);
  const directions = dmsString.match(/\s*[NSEW]\s*/g);
  const coords = dmsString.split(/\s*[NSEW]\s*/g);
  return [
    `${coords[0]}${directions![0]}`.trim(),
    `${coords[1]}${directions![1]}`.trim(),
  ];
}
