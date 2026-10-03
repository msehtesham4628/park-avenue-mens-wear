import React, { useState } from 'react';
import { X, Download, FileText, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  fileName?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title,
  fileName
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || !pdfUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName || `${title.replace(/\s+/g, '_')}_Specification.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-[#936B34]/40 relative">
        {/* Modal Top Luxury Header */}
        <div className="px-5 py-3.5 bg-[#111827] text-white flex items-center justify-between border-b border-[#936B34]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#936B34] text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] block font-semibold">
                PARK AVENUE ATELIER · PDF DOCUMENT
              </span>
              <h3 className="font-serif text-base sm:text-lg text-white font-medium truncate max-w-md sm:max-w-xl">
                {title}
              </h3>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#936B34] hover:bg-[#7a5726] text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleOpenExternal}
              className="p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer ml-2"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Canvas / Frame */}
        <div className="flex-1 bg-[#2C2D30] overflow-auto flex items-center justify-center p-2 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0 bg-white"
            title={title}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-[#F9F9F8] border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-[#936B34] font-semibold">ATELIER ARCHIVE:</span>
            <span className="truncate max-w-xs">{fileName || 'Product_Specification.pdf'}</span>
          </div>
          <span className="text-[11px] text-gray-400">
            Complimentary bespoke sizing &amp; alterations available
          </span>
        </div>
      </div>
    </div>
  );
};
