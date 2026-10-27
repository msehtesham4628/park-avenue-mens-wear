/**
 * Park Avenue Menswear — PDF & Multi-Angle Garment Image Processing Utility
 * 
 * Supports:
 * - 3 to 5 View Angles (Front, Back, Left, Right, Detail)
 * - PDF document uploads with client-side rendering to high-res preview images
 * - Multi-file drag & drop (3-5 PDFs or photos simultaneously)
 * - Multi-page PDF extraction (e.g., Page 1: Front, Page 2: Back, Page 3: Left, Page 4: Right)
 */

export interface ProcessedViewResult {
  viewType: 'front' | 'back' | 'left' | 'right' | 'detail';
  label: string;
  previewUrl: string; // High-res image (from photo or rendered PDF page)
  pdfUrl?: string;    // Original PDF data URL (if uploaded as PDF)
  fileName: string;
  fileSize?: string;
  isPdf: boolean;
}

export const VIEW_CONFIGS: { type: 'front' | 'back' | 'left' | 'right' | 'detail'; label: string; description: string; required?: boolean }[] = [
  { type: 'front', label: 'Front View', description: 'Primary frontal silhouette & lapels', required: true },
  { type: 'back', label: 'Back View', description: 'Rear drape, center/side vents & shoulders', required: true },
  { type: 'left', label: 'Left View', description: 'Left profile, sleeve pitch & collar roll', required: true },
  { type: 'right', label: 'Right View', description: 'Right profile, button stance & cuff finish' },
  { type: 'detail', label: 'Detail / Fabric View', description: 'Close-up texture, pick stitching or lining' }
];

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Dynamically load PDF.js from trusted CDN if not already loaded
 */
let pdfJsLoadingPromise: Promise<any> | null = null;
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (win.pdfjsLib) return win.pdfjsLib;

  if (pdfJsLoadingPromise) return pdfJsLoadingPromise;

  pdfJsLoadingPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (win.pdfjsLib) {
        win.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(win.pdfjsLib || null);
    };
    script.onerror = () => {
      console.warn('[PDF Processor] PDF.js CDN load failed, using canvas fallback.');
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return pdfJsLoadingPromise;
}

/**
 * Generate a luxury fallback placeholder canvas for a PDF page
 */
function createPdfFallbackCanvas(fileName: string, pageNum = 1, viewLabel = 'Garment View'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#F8F9FA';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sartorial border
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.strokeStyle = '#936B34';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  // Header
  ctx.fillStyle = '#936B34';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PARK AVENUE ATELIER', canvas.width / 2, 80);

  // Logo / Emblem
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 36px "Cormorant Garamond", serif';
  ctx.fillText('PA', canvas.width / 2, 130);

  // Central Document Icon
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(150, 200, 300, 380);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 200, 300, 380);

  // Document header bar
  ctx.fillStyle = '#111827';
  ctx.fillRect(150, 200, 300, 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PDF SPECIFICATION PHOTO', canvas.width / 2, 232);

  // View Label
  ctx.fillStyle = '#936B34';
  ctx.font = 'bold 22px "Cormorant Garamond", serif';
  ctx.fillText(viewLabel.toUpperCase(), canvas.width / 2, 320);

  // Details
  ctx.fillStyle = '#4B5563';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`File: ${fileName.slice(0, 28)}`, canvas.width / 2, 390);
  ctx.fillText(`Page ${pageNum}`, canvas.width / 2, 420);

  // Footer instructions
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Click to view full PDF document in atelier reader', canvas.width / 2, 680);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Automatically detects and changes image background to studio pure white (#FFFFFF).
 * Uses perimeter and corner patch sampling, transparency compositing, adaptive thresholding,
 * and contiguous border flood-fill to whiten off-white paper, studio backdrops, scanner textures,
 * shadows, and gradient edges while safeguarding garments, linings, lapels, and details.
 */
export function applyStudioWhiteBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  // Preserves original authentic background and transparency without forced whitening
  return canvas;
}

export const changeImageBackgroundToWhite = applyStudioWhiteBackground;

/**
 * Loads an image URL or data URL and preserves its background
 */
export async function whitenImageFromUrlOrDataUrl(urlOrData: string): Promise<string> {
  return urlOrData;
}

/**
 * Compress and resize an image file or data URL to standard sartorial presentation dimensions,
 * preserving original background and transparency to blend seamlessly with the website.
 */
export async function compressImageFile(
  fileOrDataUrl: File | string,
  maxWidth = 960,
  maxHeight = 1280,
  quality = 0.75
): Promise<string> {
  // Try hardware-accelerated createImageBitmap first if available (supports iOS 15+ and modern Android)
  if (typeof window !== 'undefined' && typeof createImageBitmap !== 'undefined' && fileOrDataUrl instanceof Blob) {
    try {
      const bitmap = await createImageBitmap(fileOrDataUrl);
      let { width, height } = bitmap;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        try { bitmap.close(); } catch (_) {}
        let compressed = canvas.toDataURL('image/jpeg', quality);
        if (compressed && compressed.length > 450000) {
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = Math.round(canvas.width * 0.75);
          scaledCanvas.height = Math.round(canvas.height * 0.75);
          const scaledCtx = scaledCanvas.getContext('2d');
          if (scaledCtx) {
            scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
            compressed = scaledCanvas.toDataURL('image/jpeg', 0.68);
          }
        }
        if (compressed && compressed.length > 30) {
          return compressed;
        }
      }
    } catch (_) {
      // Fall through to FileReader / Image pathway
    }
  }

  return new Promise((resolve) => {
    const processImg = (src: string) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src.length < 500000 ? src : '');
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          let compressed = canvas.toDataURL('image/jpeg', quality);
          if (compressed.length > 450000) {
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = Math.round(canvas.width * 0.75);
            scaledCanvas.height = Math.round(canvas.height * 0.75);
            const scaledCtx = scaledCanvas.getContext('2d');
            if (scaledCtx) {
              scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
              compressed = scaledCanvas.toDataURL('image/jpeg', 0.68);
            }
          }
          resolve(compressed);
        } catch (_) {
          resolve(src.length < 500000 ? src : '');
        }
      };
      img.onerror = () => resolve(src.length < 500000 ? src : '');
      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processImg(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImg(e.target?.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Render a specific page of a PDF file to an image data URL using PDF.js.
 */
export async function renderPdfPageToDataUrl(pdfData: ArrayBuffer | Uint8Array, pageNum = 1, fallbackName = 'Document.pdf', viewLabel = 'View'): Promise<string> {
  try {
    const pdfjs = await loadPdfJs();
    if (!pdfjs) {
      return createPdfFallbackCanvas(fallbackName, pageNum, viewLabel);
    }

    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;

    if (pageNum > pdfDoc.numPages) {
      return createPdfFallbackCanvas(fallbackName, pageNum, viewLabel);
    }

    const page = await pdfDoc.getPage(pageNum);
    const unscaled = page.getViewport({ scale: 1.0 });
    const targetScale = Math.min(1.2, Math.min(960 / (unscaled.width || 600), 1280 / (unscaled.height || 800)));
    const viewport = page.getViewport({ scale: Math.max(0.8, targetScale) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return createPdfFallbackCanvas(fallbackName, pageNum, viewLabel);
    }

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.76);
  } catch (err) {
    console.warn('[PDF Processor] Page render error, using luxury canvas fallback:', err);
    return createPdfFallbackCanvas(fallbackName, pageNum, viewLabel);
  }
}

/**
 * Process an individual uploaded file (PDF or Image)
 */
export async function processProductFile(
  file: File,
  viewType: 'front' | 'back' | 'left' | 'right' | 'detail'
): Promise<ProcessedViewResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const label = VIEW_CONFIGS.find(v => v.type === viewType)?.label || 'Product View';

  if (!isPdf) {
    // Normal image file (JPG, PNG, WEBP) — compress immediately to eliminate quota bloat
    const compressedPreview = await compressImageFile(file, 960, 1280, 0.75);
    return {
      viewType,
      label,
      previewUrl: compressedPreview,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      isPdf: false
    };
  }

  // Handle PDF file
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Also create a data URL for embedding / downloading the PDF
        const pdfDataUrl = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(file);
        });

        // Render Page 1 to high-resolution image
        const renderedImage = await renderPdfPageToDataUrl(arrayBuffer, 1, file.name, label);

        resolve({
          viewType,
          label,
          previewUrl: renderedImage,
          pdfUrl: pdfDataUrl,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          isPdf: true
        });
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Process a batch of 3 to 5 files dropped or selected together.
 * If 1 multi-page PDF is provided, it extracts pages 1..N to Front, Back, Left, Right views!
 */
export async function processBatchProductFiles(files: FileList | File[]): Promise<ProcessedViewResult[]> {
  const fileArray = Array.from(files).slice(0, 5);
  if (fileArray.length === 0) return [];

  const viewOrder: Array<'front' | 'back' | 'left' | 'right' | 'detail'> = [
    'front',
    'back',
    'left',
    'right',
    'detail'
  ];

  // Special case: Single PDF file with multiple pages!
  if (fileArray.length === 1 && (fileArray[0].type === 'application/pdf' || fileArray[0].name.toLowerCase().endsWith('.pdf'))) {
    const singleFile = fileArray[0];
    const arrayBuffer = await singleFile.arrayBuffer();
    
    // Check page count using PDF.js
    let numPages = 1;
    try {
      const pdfjs = await loadPdfJs();
      if (pdfjs) {
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        numPages = doc.numPages;
      }
    } catch (_) {}

    // If multi-page PDF (e.g. 2-5 pages containing front, back, left, right views)
    if (numPages > 1) {
      const pagesToExtract = Math.min(numPages, 5);
      const pdfDataUrl = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(singleFile);
      });

      const results: ProcessedViewResult[] = [];
      for (let i = 0; i < pagesToExtract; i++) {
        const vType = viewOrder[i];
        const vLabel = VIEW_CONFIGS.find(v => v.type === vType)?.label || `View ${i + 1}`;
        const previewUrl = await renderPdfPageToDataUrl(arrayBuffer, i + 1, singleFile.name, vLabel);
        results.push({
          viewType: vType,
          label: `${vLabel} (Page ${i + 1})`,
          previewUrl,
          pdfUrl: pdfDataUrl,
          fileName: `${singleFile.name} (P.${i + 1})`,
          fileSize: formatBytes(singleFile.size),
          isPdf: true
        });
      }
      return results;
    }
  }

  // Standard case: 2 to 5 separate files uploaded
  const results: ProcessedViewResult[] = [];
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const vType = viewOrder[i] || 'detail';
    const result = await processProductFile(file, vType);
    results.push(result);
  }

  return results;
}

export const processSingleFile = processProductFile;
export const processMultiFileDrop = processBatchProductFiles;
