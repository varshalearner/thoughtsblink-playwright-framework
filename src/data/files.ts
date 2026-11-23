/** A file for setInputFiles, built in memory so no binary fixtures live in the repo. */
export interface UploadFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

// A valid 1x1 PNG: the smallest real image the app's image checks accept.
const ONE_PIXEL_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export function pngFile(name = 'artwork.png'): UploadFile {
  return { name, mimeType: 'image/png', buffer: Buffer.from(ONE_PIXEL_PNG, 'base64') };
}

export function textFile(name = 'notes.txt'): UploadFile {
  return { name, mimeType: 'text/plain', buffer: Buffer.from('not an image') };
}
