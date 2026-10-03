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
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return canvas;

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const totalPixels = width * height;

    // Sample border pixels and 4 corner patches (top-left, top-right, bottom-left, bottom-right)
    let borderCount = 0;
    let sumR = 0, sumG = 0, sumB = 0;

    const samplePixel = (px: number, py: number) => {
      if (px < 0 || px >= width || py < 0 || py >= height) return;
      const idx = (py * width + px) * 4;
      const a = data[idx + 3];
      if (a > 20) {
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        borderCount++;
      }
    };

    // 1. Sample outer perimeter borders
    for (let x = 0; x < width; x += 2) {
      samplePixel(x, 0);
      samplePixel(x, 1);
      samplePixel(x, height - 1);
      samplePixel(x, height - 2);
    }
    for (let y = 0; y < height; y += 2) {
      samplePixel(0, y);
      samplePixel(1, y);
      samplePixel(width - 1, y);
      samplePixel(width - 2, y);
    }

    // 2. Sample 4 corner patches (8x8 pixels each)
    const cornerSize = Math.min(12, Math.floor(Math.min(width, height) / 8));
    for (let dy = 0; dy < cornerSize; dy++) {
      for (let dx = 0; dx < cornerSize; dx++) {
        samplePixel(dx, dy); // top-left
        samplePixel(width - 1 - dx, dy); // top-right
        samplePixel(dx, height - 1 - dy); // bottom-left
        samplePixel(width - 1 - dx, height - 1 - dy); // bottom-right
      }
    }

    const avgR = borderCount > 0 ? sumR / borderCount : 255;
    const avgG = borderCount > 0 ? sumG / borderCount : 255;
    const avgB = borderCount > 0 ? sumB / borderCount : 255;
    const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

    // 0 = unvisited, 1 = background (whiten to #FFFFFF), 2 = garment foreground
    const mask = new Uint8Array(totalPixels);

    // BFS queue for flood filling from the outer perimeter
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    const isBackdropColor = (r: number, g: number, b: number, a: number): boolean => {
      if (a < 235) return true; // Transparent or semi-transparent
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);

      // Distance to sampled border color
      const dr = r - avgR;
      const dg = g - avgG;
      const db = b - avgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      // Matches border backdrop color closely
      if (dist < 48) return true;

      // Light neutral studio backdrop (e.g. white, off-white, light gray, soft studio lights)
      if (lum >= 165 && sat < 40) {
        if (Math.abs(lum - avgLum) < 55 || lum >= 195) return true;
      }

      // Very bright highlights in backdrop
      if (lum >= 235 && sat < 42) return true;

      return false;
    };

    // Seed perimeter pixels into BFS queue
    for (let x = 0; x < width; x++) {
      const topIdx = x;
      const btmIdx = (height - 1) * width + x;
      
      const topData = topIdx * 4;
      if (isBackdropColor(data[topData], data[topData + 1], data[topData + 2], data[topData + 3])) {
        mask[topIdx] = 1;
        queue[qTail++] = topIdx;
      } else {
        mask[topIdx] = 2;
      }

      const btmData = btmIdx * 4;
      if (isBackdropColor(data[btmData], data[btmData + 1], data[btmData + 2], data[btmData + 3])) {
        mask[btmIdx] = 1;
        queue[qTail++] = btmIdx;
      } else {
        mask[btmIdx] = 2;
      }
    }

    for (let y = 1; y < height - 1; y++) {
      const leftIdx = y * width;
      const rightIdx = y * width + (width - 1);

      const leftData = leftIdx * 4;
      if (mask[leftIdx] === 0) {
        if (isBackdropColor(data[leftData], data[leftData + 1], data[leftData + 2], data[leftData + 3])) {
          mask[leftIdx] = 1;
          queue[qTail++] = leftIdx;
        } else {
          mask[leftIdx] = 2;
        }
      }

      const rightData = rightIdx * 4;
      if (mask[rightIdx] === 0) {
        if (isBackdropColor(data[rightData], data[rightData + 1], data[rightData + 2], data[rightData + 3])) {
          mask[rightIdx] = 1;
          queue[qTail++] = rightIdx;
        } else {
          mask[rightIdx] = 2;
        }
      }
    }

    // Run BFS to spread across contiguous background
    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);

      // Check 4 neighbors
      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < width - 1 ? curr + 1 : -1,
        cy > 0 ? curr - width : -1,
        cy < height - 1 ? curr + width : -1
      ];

      for (let i = 0; i < 4; i++) {
        const nIdx = neighbors[i];
        if (nIdx >= 0 && mask[nIdx] === 0) {
          const dIdx = nIdx * 4;
          if (isBackdropColor(data[dIdx], data[dIdx + 1], data[dIdx + 2], data[dIdx + 3])) {
            mask[nIdx] = 1;
            queue[qTail++] = nIdx;
          } else {
            mask[nIdx] = 2;
          }
        }
      }
    }

    // Second pass: Whiten all background pixels and soft-feather edges to pure #FFFFFF
    for (let i = 0; i < totalPixels; i++) {
      const dIdx = i * 4;
      if (mask[i] === 1 || data[dIdx + 3] < 245) {
        // Pure studio white #FFFFFF
        data[dIdx] = 255;
        data[dIdx + 1] = 255;
        data[dIdx + 2] = 255;
        data[dIdx + 3] = 255;
      } else if (mask[i] === 2) {
        // Soft feathering on boundary
        const px = i % width;
        const py = Math.floor(i / width);
        const hasBgNeighbor = 
          (px > 0 && mask[i - 1] === 1) ||
          (px < width - 1 && mask[i + 1] === 1) ||
          (py > 0 && mask[i - width] === 1) ||
          (py < height - 1 && mask[i + width] === 1);

        if (hasBgNeighbor) {
          const lum = 0.299 * data[dIdx] + 0.587 * data[dIdx + 1] + 0.114 * data[dIdx + 2];
          if (lum > 210) {
            const blend = 0.75;
            data[dIdx] = Math.round(data[dIdx] * (1 - blend) + 255 * blend);
            data[dIdx + 1] = Math.round(data[dIdx + 1] * (1 - blend) + 255 * blend);
            data[dIdx + 2] = Math.round(data[dIdx + 2] * (1 - blend) + 255 * blend);
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('[Background Whitening] Canvas pixel processing warning:', err);
  }

  return canvas;
}

export const changeImageBackgroundToWhite = applyStudioWhiteBackground;

/**
 * Loads an image URL or data URL and converts its background to pure studio white (#FFFFFF).
 */
export async function whitenImageFromUrlOrDataUrl(urlOrData: string): Promise<string> {
  if (!urlOrData || typeof urlOrData !== 'string') return urlOrData;
  return compressImageFile(urlOrData, 1200, 1600, 0.88);
}

/**
 * Compress and resize an image file or data URL to standard sartorial presentation dimensions,
 * automatically whitening the background to pure studio white (#FFFFFF).
 */
export async function compressImageFile(
  fileOrDataUrl: File | string,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.84
): Promise<string> {
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
          resolve(src);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Automatically change background to pure studio white (#FFFFFF)
        applyStudioWhiteBackground(canvas);

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (_) {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
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
 * Render a specific page of a PDF file to an image data URL using PDF.js,
 * automatically converting the rendered background to pure studio white (#FFFFFF).
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
    const targetScale = Math.min(1.5, Math.min(1200 / (unscaled.width || 600), 1600 / (unscaled.height || 800)));
    const viewport = page.getViewport({ scale: Math.max(0.8, targetScale) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return createPdfFallbackCanvas(fallbackName, pageNum, viewLabel);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    // Automatically change PDF background to pure studio white (#FFFFFF)
    applyStudioWhiteBackground(canvas);

    return canvas.toDataURL('image/jpeg', 0.84);
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
    const compressedPreview = await compressImageFile(file, 1200, 1600, 0.84);
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
