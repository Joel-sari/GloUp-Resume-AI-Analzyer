export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

type PdfJsLib = typeof import("pdfjs-dist");

let pdfjsLib: PdfJsLib | null = null;
let loadPromise: Promise<PdfJsLib> | null = null;

// pdf.js touches browser globals, so it is loaded lazily on the client only
// (this app is server-rendered by React Router). The promise is cached so the
// library and its worker are only set up once.
async function loadPdfJs(): Promise<PdfJsLib> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = import("pdfjs-dist").then((lib) => {
    // Worker lives in /public and must match the installed pdfjs-dist version.
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

/**
 * Renders the first page of a PDF to a PNG image.
 *
 * Returns an object URL for previewing the image plus a `File` that can be
 * uploaded to storage. On failure `file` is null and `error` describes why.
 */
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Scale up so the image is crisp enough for the AI to read small text.
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return { imageUrl: "", file: null, error: "Could not create canvas context" };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 1.0)
    );

    if (!blob) {
      return { imageUrl: "", file: null, error: "Failed to create image blob" };
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${originalName}.png`, { type: "image/png" });

    return {
      imageUrl: URL.createObjectURL(blob),
      file: imageFile,
    };
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
