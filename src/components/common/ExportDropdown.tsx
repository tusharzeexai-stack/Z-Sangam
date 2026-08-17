import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileSpreadsheet, 
  FileCode2, 
  FileText,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export interface ExportDropdownItem {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  badge?: string;
  variant?: 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'slate';
  isDivider?: boolean;
}

export interface ExportDropdownProps {
  label?: string;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onOpenAdvanced?: () => void;
  csvLabel?: string;
  pdfLabel?: string;
  jsonLabel?: string;
  items?: ExportDropdownItem[];
  menuHeader?: string;
  buttonClassName?: string;
  id?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  label = 'Download Report',
  onExportCSV,
  onExportPDF,
  onExportJSON,
  onOpenAdvanced,
  csvLabel = 'Export as CSV (.csv)',
  pdfLabel = 'Export as PDF (.pdf)',
  jsonLabel = 'Export as JSON (.json)',
  items,
  menuHeader = 'Administrative Report Export',
  buttonClassName,
  id = 'export-dropdown-btn'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs"
        }
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {menuHeader}
            </span>
          </div>

          <div className="py-1">
            {items ? (
              items.map((item, idx) => {
                if (item.isDivider) {
                  return <div key={idx} className="my-1 border-t border-slate-800/80" />;
                }

                const iconBgClass = 
                  item.variant === 'rose' ? 'bg-rose-500/15 text-rose-400' :
                  item.variant === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                  item.variant === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                  item.variant === 'purple' ? 'bg-purple-500/15 text-purple-400' :
                  'bg-blue-500/15 text-blue-400';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left group"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconBgClass}`}>
                      {item.icon || <Download className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 group-hover:text-white flex items-center justify-between gap-1">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <>
                {onExportCSV && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onExportCSV();
                    }}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">{csvLabel}</div>
                      <div className="text-[10.5px] text-slate-400">Spreadsheet format with complete data rows</div>
                    </div>
                  </button>
                )}

                {onExportPDF && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onExportPDF();
                    }}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">{pdfLabel}</div>
                      <div className="text-[10.5px] text-slate-400">Print-ready executive formatted document</div>
                    </div>
                  </button>
                )}

                {onExportJSON && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onExportJSON();
                    }}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                      <FileCode2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">{jsonLabel}</div>
                      <div className="text-[10.5px] text-slate-400">Hierarchical JSON payload structure</div>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {onOpenAdvanced && (
            <div className="border-t border-slate-800/80 pt-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdvanced();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors text-left font-medium"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Configure Custom Report...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

