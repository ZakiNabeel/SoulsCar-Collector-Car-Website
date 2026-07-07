// Client-side photo compression for the sell-your-car form.
//
// Sellers attach phone photos that are 3–8MB each. The site runs on Vercel,
// where a serverless function rejects any request body over ~4.5MB — so a
// submission with even two original photos never reached our API route and
// the form showed "Something went wrong". We therefore downscale/re-encode
// every photo in the browser before upload and keep the whole payload under
// a hard budget.

const MAX_DIMENSION = 1600;
const INITIAL_QUALITY = 0.72;
// Keep total photo bytes safely under Vercel's ~4.5MB request-body cap,
// leaving headroom for multipart boundaries and the text fields.
export const PHOTO_BUDGET_BYTES = 3.5 * 1024 * 1024;

async function decodeToCanvasSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap is fastest and handles EXIF orientation; Safari (esp.
  // older iOS) sometimes lacks it or fails on certain formats, so fall back
  // to a plain <img> decode.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> decode
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function encodeScaled(
  source: ImageBitmap | HTMLImageElement,
  maxDim: number,
  quality: number,
): Promise<Blob | null> {
  const srcW = "naturalWidth" in source ? source.naturalWidth : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight : source.height;
  if (!srcW || !srcH) return null;

  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(srcW * scale));
  canvas.height = Math.max(1, Math.round(srcH * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, quality);
}

// Compresses one photo to a JPEG capped at MAX_DIMENSION on its longest side.
// If the browser can't decode the file (e.g. exotic HEIC variants), the
// original file is returned unchanged — the total-budget pass below will
// still catch payloads that are too large.
export async function compressPhoto(file: File): Promise<File> {
  try {
    const source = await decodeToCanvasSource(file);
    const blob = await encodeScaled(source, MAX_DIMENSION, INITIAL_QUALITY);
    if ("close" in source) source.close();
    if (!blob) return file;
    // Only keep the re-encode when it actually helps.
    if (blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Ensures the combined size of all photos fits the upload budget, re-encoding
// progressively smaller/rougher until it does. Returns null when even the
// most aggressive pass can't fit (e.g. dozens of undecodable files).
export async function fitPhotosToBudget(photos: File[]): Promise<File[] | null> {
  let current = photos;
  const total = (files: File[]) => files.reduce((sum, f) => sum + f.size, 0);
  if (total(current) <= PHOTO_BUDGET_BYTES) return current;

  const passes: { maxDim: number; quality: number }[] = [
    { maxDim: 1280, quality: 0.6 },
    { maxDim: 1024, quality: 0.5 },
    { maxDim: 800, quality: 0.4 },
  ];

  for (const pass of passes) {
    current = await Promise.all(
      current.map(async (file) => {
        try {
          const source = await decodeToCanvasSource(file);
          const blob = await encodeScaled(source, pass.maxDim, pass.quality);
          if ("close" in source) source.close();
          if (!blob || blob.size >= file.size) return file;
          const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          return new File([blob], name, { type: "image/jpeg" });
        } catch {
          return file;
        }
      }),
    );
    if (total(current) <= PHOTO_BUDGET_BYTES) return current;
  }

  return null;
}
