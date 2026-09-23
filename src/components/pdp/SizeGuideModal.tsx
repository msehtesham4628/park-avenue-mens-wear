import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="min-h-screen px-4 py-12 flex items-center justify-center">
        <div className="relative w-full max-w-2xl bg-[#090D16] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 text-[#F8FAFC]">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#C8A97E]" />
              <h3 className="font-serif text-xl text-white">
                Park Avenue Tailoring &amp; Size Standards
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between my-4 text-xs text-slate-400">
            <span>Category: <strong className="text-[#C8A97E]">{category}</strong></span>
            <div className="flex items-center border border-white/10 p-0.5 bg-[#0E1526]">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 font-medium transition-colors cursor-pointer ${
                  unit === 'in' ? 'bg-[#C8A97E] text-[#090D16]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inches (in)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 font-medium transition-colors cursor-pointer ${
                  unit === 'cm' ? 'bg-[#C8A97E] text-[#090D16]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto my-4 border border-white/10">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0E1526] text-[#C8A97E] uppercase tracking-wider text-[10px] border-b border-white/10 font-mono">
                <tr>
                  <th className="p-3">US/UK Size</th>
                  <th className="p-3">EU Size</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Waist</th>
                  <th className="p-3">Sleeve</th>
                  <th className="p-3">Trouser Inseam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums font-mono">
                <tr>
                  <td className="p-3 font-semibold text-white">38R</td>
                  <td className="p-3 text-slate-400">48</td>
                  <td className="p-3">{unit === 'in' ? '38.0"' : '96.5 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '32.0"' : '81.3 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '33.5"' : '85.1 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '36" (Unfinished)' : '91.4 cm'}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">40R</td>
                  <td className="p-3 text-slate-400">50</td>
                  <td className="p-3">{unit === 'in' ? '40.0"' : '101.6 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '34.0"' : '86.4 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '34.2"' : '86.9 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '36" (Unfinished)' : '91.4 cm'}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">42R</td>
                  <td className="p-3 text-slate-400">52</td>
                  <td className="p-3">{unit === 'in' ? '42.0"' : '106.7 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '36.0"' : '91.4 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '35.0"' : '88.9 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '36" (Unfinished)' : '91.4 cm'}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">44R</td>
                  <td className="p-3 text-slate-400">54</td>
                  <td className="p-3">{unit === 'in' ? '44.0"' : '111.8 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '38.0"' : '96.5 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '35.5"' : '90.2 cm'}</td>
                  <td className="p-3">{unit === 'in' ? '36" (Unfinished)' : '91.4 cm'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#0E1526] border border-[#C8A97E]/30 text-xs text-slate-300 space-y-1.5">
            <p className="text-[#C8A97E] font-medium">Bespoke Fit Promise</p>
            <p>
              All Park Avenue trousers are delivered with unfinished hems to allow custom hemming by our master tailors or your personal tailor. You can specify exact hem break measurements directly at checkout.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
