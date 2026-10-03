import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  VIEW_CONFIGS, 
  processProductFile, 
  processBatchProductFiles, 
  ProcessedViewResult 
} from '../../utils/pdfUploadUtils';
import { ProductViews, ProductPdfDocument } from '../../types';
import { PdfViewerModal } from '../common/PdfViewerModal';

interface ProductViewsUploaderProps {
  initialViews?: ProductViews;
  initialImages?: string[];
  initialPdfDocuments?: ProductPdfDocument[];
  onChange: (data: {
    views: ProductViews;
    images: string[];
    pdfDocuments: ProductPdfDocument[];
  }) => void;
  productName?: string;
}

export const ProductViewsUploader: React.FC<ProductViewsUploaderProps> = ({
  initialViews,
  initialImages = [],
  initialPdfDocuments = [],
  onChange,
  productName = 'Garment'
}) => {
  const [views, setViews] = useState<ProductViews>(() => ({
    front: initialViews?.front || initialImages[0] || '',
    back: initialViews?.back || initialImages[1] || '',
    left: initialViews?.left || initialImages[2] || '',
    right: initialViews?.right || initialImages[3] || '',
    detail: initialViews?.detail || initialImages[4] || ''
  }));

  const [pdfDocuments, setPdfDocuments] = useState<ProductPdfDocument[]>(initialPdfDocuments || []);
  const [activePdfModal, setActivePdfModal] = useState<{ url: string; title: string; fileName?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Hidden file inputs
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
    detail: useRef<HTMLInputElement>(null)
  };
  const extraPdfInputRef = useRef<HTMLInputElement>(null);

  const notifyChange = (updatedViews: ProductViews, updatedPdfs: ProductPdfDocument[]) => {
    const imagesList = [
      updatedViews.front,
      updatedViews.back,
      updatedViews.left,
      updatedViews.right,
      updatedViews.detail
    ].filter(Boolean) as string[];

    onChange({
      views: updatedViews,
      images: imagesList,
      pdfDocuments: updatedPdfs
    });
  };

  // Handle batch 3-5 file drop or selection
  const handleBatchFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setProcessingStatus(`Processing ${files.length} file(s)... rendering high-res view angles...`);

    try {
      const results: ProcessedViewResult[] = await processBatchProductFiles(files);
      const nextViews = { ...views };
      const nextPdfs = [...pdfDocuments];

      results.forEach((res) => {
        nextViews[res.viewType] = res.previewUrl;
        if (res.isPdf && res.pdfUrl) {
          const cleanFileName = (res.fileName || '').replace(/\s*\(P\.\d+\)/, '');
          const alreadyExists = nextPdfs.some(p => p.fileName === cleanFileName || p.fileName === res.fileName || p.url === res.pdfUrl);
          if (!alreadyExists) {
            nextPdfs.push({
              id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              title: `${productName} — Lookbook & Specifications`,
              fileName: cleanFileName || res.fileName,
              url: res.pdfUrl,
              uploadedAt: new Date().toISOString(),
              viewType: res.viewType,
              fileSize: res.fileSize
            });
          }
        }
      });

      setViews(nextViews);
      setPdfDocuments(nextPdfs);
      notifyChange(nextViews, nextPdfs);
      setProcessingStatus(`Successfully updated ${results.length} view angle(s)!`);
      setTimeout(() => setProcessingStatus(''), 3000);
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setProcessingStatus(`Upload error: ${err.message || 'Failed to process files'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle individual slot file upload
  const handleSingleSlotFile = async (
    file: File,
    viewType: 'front' | 'back' | 'left' | 'right' | 'detail'
  ) => {
    if (!file) return;
    setIsProcessing(true);
    const viewLabel = VIEW_CONFIGS.find(v => v.type === viewType)?.label || viewType;
    setProcessingStatus(`Processing ${file.name} for ${viewLabel}...`);

    try {
      const res = await processProductFile(file, viewType);
      const nextViews = { ...views, [viewType]: res.previewUrl };
      const nextPdfs = [...pdfDocuments];

      if (res.isPdf && res.pdfUrl) {
        const alreadyExists = nextPdfs.some(p => p.fileName === res.fileName || p.url === res.pdfUrl);
        if (!alreadyExists) {
          nextPdfs.push({
            id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: `${productName} — ${res.label}`,
            fileName: res.fileName,
            url: res.pdfUrl,
            uploadedAt: new Date().toISOString(),
            viewType,
            fileSize: res.fileSize
          });
        }
      }

      setViews(nextViews);
      setPdfDocuments(nextPdfs);
      notifyChange(nextViews, nextPdfs);
      setProcessingStatus(`Updated ${viewLabel}!`);
      setTimeout(() => setProcessingStatus(''), 2500);
    } catch (err: any) {
      console.error('Single upload error:', err);
      setProcessingStatus(`Error: ${err.message || 'Failed to upload'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearSlot = (viewType: 'front' | 'back' | 'left' | 'right' | 'detail') => {
    const nextViews = { ...views, [viewType]: '' };
    const nextPdfs = pdfDocuments.filter(p => p.viewType !== viewType);
    setViews(nextViews);
    setPdfDocuments(nextPdfs);
    notifyChange(nextViews, nextPdfs);
  };

  const handleRemovePdf = (pdfId: string) => {
    const nextPdfs = pdfDocuments.filter(p => p.id !== pdfId);
    setPdfDocuments(nextPdfs);
    notifyChange(views, nextPdfs);
  };

  const filledCount = Object.values(views).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Guidance */}
      <div className="p-4 bg-white border border-[#936B34]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-none bg-[#111827] text-[#936B34] flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#936B34] font-semibold">
                GARMENT MULTI-ANGLE VIEWS UPLOADER (3–5 VIEWS)
              </span>
              <span className="px-2 py-0.5 bg-[#936B34]/10 text-[#936B34] text-[10px] font-mono font-bold">
                {filledCount}/5 Active Views
              </span>
            </div>
            <p className="text-xs text-gray-600 font-sans mt-0.5">
              Upload Front, Back, Left, Right &amp; Detail photos of the garment. Image and PDF backgrounds are automatically converted to studio pure white (#FFFFFF).
            </p>
          </div>
        </div>

        {filledCount >= 3 ? (
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">3-5 Views Configured</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-amber-800 bg-amber-50 px-3 py-1.5 border border-amber-200 shrink-0">
            Recommended: 3 to 5 Views
          </div>
        )}
      </div>

      {/* Primary Batch Dropzone for 3-5 Photos */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) {
            handleBatchFiles(e.dataTransfer.files);
          }
        }}
        className={`border-2 border-dashed p-6 sm:p-8 text-center transition-all bg-[#FBFBFA] ${
          dragActive
            ? 'border-[#936B34] bg-[#936B34]/5 shadow-md'
            : 'border-gray-300 hover:border-[#936B34]'
        }`}
      >
        <input
          ref={batchFileInputRef}
          type="file"
          multiple
          accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleBatchFiles(e.target.files);
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto bg-[#111827] text-white flex items-center justify-center shadow-md">
            <Upload className="w-6 h-6 text-[#936B34]" />
          </div>

          <div>
            <h4 className="font-serif text-lg text-[#111827] uppercase tracking-wide font-medium">
              DROP 3 TO 5 PHOTOS AT ONCE
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-1 leading-relaxed">
              Drag &amp; drop Front, Back, Left, Right files. They will automatically be parsed and slotted into position.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => batchFileInputRef.current?.click()}
              className="px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>SELECT 3-5 PHOTOS</span>
            </button>
          </div>

          {processingStatus && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
              <span>{processingStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated 5-Slot Visual Grid: Front, Back, Left, Right, Detail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-[#111827] font-semibold">
            INDIVIDUAL VIEW ANGLE SLOTS (3 TO 5 VIEWS)
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            Accepts: .pdf, .jpg, .png, .webp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {VIEW_CONFIGS.map((slot, index) => {
            const currentPreview = views[slot.type];
            const matchingPdf = pdfDocuments.find(p => p.viewType === slot.type);
            const inputRef = singleFileInputRefs[slot.type];

            return (
              <div
                key={slot.type}
                className={`border bg-white flex flex-col justify-between transition-all ${
                  currentPreview
                    ? 'border-[#936B34] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Hidden input for this slot */}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSingleSlotFile(file, slot.type);
                  }}
                />

                {/* Slot Header */}
                <div className="p-2.5 bg-[#F9F9F8] border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#936B34] font-bold block">
                      0{index + 1} · {slot.type.toUpperCase()}
                    </span>
                    <span className="font-serif text-sm text-[#111827] font-medium block">
                      {slot.label}
                    </span>
                  </div>
                  {slot.required && !currentPreview && (
                    <span className="text-[9px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200">
                      Req
                    </span>
                  )}
                  {currentPreview && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 font-bold">
                      ✓ Set
                    </span>
                  )}
                </div>

                {/* Slot Image / PDF Preview Frame */}
                <div className="relative aspect-[3/4] bg-[#F3F4F6] overflow-hidden flex items-center justify-center group">
                  {currentPreview ? (
                    <>
                      <img
                        src={currentPreview}
                        alt={`${productName} - ${slot.label}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay controls on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {matchingPdf?.url && (
                          <button
                            type="button"
                            onClick={() => setActivePdfModal({
                              url: matchingPdf.url,
                              title: `${productName} — ${slot.label}`,
                              fileName: matchingPdf.fileName
                            })}
                            className="px-2.5 py-1 bg-white text-[#111827] text-[10px] font-mono uppercase tracking-wider font-semibold hover:bg-[#936B34] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View PDF</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className="px-2.5 py-1 bg-[#111827] text-white text-[10px] font-mono uppercase tracking-wider font-semibold hover:bg-[#936B34] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleClearSlot(slot.type)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Remove view"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => inputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-500 flex items-center justify-center mb-1 shadow-xs">
                        <Upload className="w-4 h-4 text-[#936B34]" />
                      </div>
                      <span className="text-[11px] font-mono text-[#111827] font-semibold">
                        + Upload View
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 mt-0.5">
                        PDF or Image
                      </span>
                    </div>
                  )}

                  {/* PDF Badge Indicator if source is PDF */}
                  {matchingPdf && (
                    <div className="absolute top-2 left-2 z-10 bg-[#111827]/90 text-[#D4AF37] px-2 py-0.5 text-[9px] font-mono flex items-center gap-1 shadow-xs">
                      <FileText className="w-2.5 h-2.5" />
                      <span>PDF SOURCE</span>
                    </div>
                  )}

                  {currentPreview && (
                    <div className="absolute bottom-2 left-2 z-10 bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 text-[8px] font-mono px-1.5 py-0.5 flex items-center gap-1 shadow-xs">
                      <span>✓ Studio White (#FFFFFF)</span>
                    </div>
                  )}
                </div>

                {/* Slot Footer Action */}
                <div className="p-2 bg-[#F9F9F8] border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-[10px] font-mono uppercase text-[#936B34] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentPreview ? 'Change File' : 'Upload File'}</span>
                  </button>
                  {currentPreview && (
                    <button
                      type="button"
                      onClick={() => handleClearSlot(slot.type)}
                      className="text-[10px] font-mono text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active PDF Viewer Modal */}
      {activePdfModal && (
        <PdfViewerModal
          isOpen={Boolean(activePdfModal)}
          onClose={() => setActivePdfModal(null)}
          pdfUrl={activePdfModal.url}
          title={activePdfModal.title}
          fileName={activePdfModal.fileName}
        />
      )}
    </div>
  );
};
