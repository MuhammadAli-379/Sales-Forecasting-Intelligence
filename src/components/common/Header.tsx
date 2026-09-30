import React from 'react';
import {
  Activity,
  Calendar,
  Database,
  Download,
  FileSpreadsheet,
  Moon,
  Printer,
  RefreshCw,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { AudioToggle } from './AudioToggle';

interface HeaderProps {
  project: ProcessedSalesProject;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetToDefault: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenPresentation?: () => void;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  darkMode,
  onToggleDarkMode,
  onResetToDefault,
  onNavigateTab,
  onOpenPresentation,
  isAudioMuted = true,
  onToggleAudio,
}) => {
  const startMonth = project.monthlyData[0]?.monthLabel || 'N/A';
  const endMonth = project.monthlyData[project.monthlyData.length - 1]?.monthLabel || 'N/A';
  const obsCount = project.monthlyData.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Zone 1: Single-element brand title (Top Bar Contract) */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A] block leading-none">
            Sales Forecasting Intelligence
          </span>
          <span className="text-[11px] text-[#64748B] font-medium hidden sm:block mt-0.5">
            ARIMA Time Series & Statistical Analytics
          </span>
        </div>
      </div>

      {/* Zone 2: Context & Metadata Links */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-[#475569]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
          <Database className="h-3.5 w-3.5 text-[#0284C7]" />
          <span className="text-[#0F172A] font-medium truncate max-w-[140px]">{project.datasetName}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
          <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>{startMonth} – {endMonth}</span>
          <span className="text-[#64748B] font-mono">({obsCount} Mo)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
          <Activity className="h-3.5 w-3.5 text-[#16A34A]" />
          <span className="text-[#0F172A] font-mono font-medium">
            ARIMA({project.selectedModelOrder.join(',')})
          </span>
        </div>
      </div>

      {/* Zone 3: Actions + Audio Toggle + Viva Mode */}
      <div className="flex items-center gap-2">
        {onToggleAudio && (
          <AudioToggle isMuted={isAudioMuted} onToggle={onToggleAudio} />
        )}

        {onOpenPresentation && (
          <button
            onClick={onOpenPresentation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-xs font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors"
            title="Launch Viva & Defense Presentation Slides (Press V)"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Viva Mode</span>
            <kbd className="hidden md:inline text-[9px] bg-blue-100 px-1 rounded font-mono text-[#1E40AF]">V</kbd>
          </button>
        )}

        <button
          onClick={() => onNavigateTab('report-generator')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
          title="Print or view formal report"
        >
          <Printer className="h-3.5 w-3.5 text-[#64748B]" />
          <span>Report</span>
        </button>

        <button
          onClick={() => onNavigateTab('export-center')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Exports</span>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};

