/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ActiveTab, GlobalFilterState, ProcessedSalesProject } from './types';
import { processCompleteSalesPipeline } from './utils/timeSeriesEngine';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalFilterBar } from './components/common/GlobalFilterBar';
import { ExecutiveDashboard } from './components/views/ExecutiveDashboard';
import { DataManagement } from './components/views/DataManagement';
import { HistoricalAnalysis } from './components/views/HistoricalAnalysis';
import { TimeSeriesLab } from './components/views/TimeSeriesLab';
import { StationarityLab } from './components/views/StationarityLab';
import { AcfPacfLab } from './components/views/AcfPacfLab';
import { ArimaModelCenter } from './components/views/ArimaModelCenter';
import { ModelPerformance } from './components/views/ModelPerformance';
import { ResidualDiagnosticsView } from './components/views/ResidualDiagnosticsView';
import { FutureForecastView } from './components/views/FutureForecastView';
import { ForecastTableView } from './components/views/ForecastTableView';
import { BusinessInsightsView } from './components/views/BusinessInsightsView';
import { ReportGenerator } from './components/views/ReportGenerator';
import { ExportCenter } from './components/views/ExportCenter';
import { VivaPresentationMode } from './components/views/VivaPresentationMode';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { MagneticCursor } from './components/common/MagneticCursor';
import { useSoundEngine } from './hooks/useSoundEngine';
import { AlertTriangle, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [project, setProject] = useState<ProcessedSalesProject>(() => processCompleteSalesPipeline());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVivaMode, setShowVivaMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sound Engine hook
  const sound = useSoundEngine();

  const addToast = (title: string, message?: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    sound.playChime();
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Theme state: defaults to light enterprise palette
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sfi_theme');
    return saved === 'dark';
  });

  // Global filters
  const [filterState, setFilterState] = useState<GlobalFilterState>({
    year: 'all',
    quarter: 'all',
    startDate: '',
    endDate: '',
  });

  // Global Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        sound.toggleMute();
      } else if (e.key === 'v' || e.key === 'V') {
        setShowVivaMode((prev) => !prev);
        sound.playClick();
      } else if (e.key === 'Escape') {
        setShowVivaMode(false);
        setErrorMessage(null);
      } else if (e.key >= '1' && e.key <= '9') {
        const tabs: ActiveTab[] = [
          'dashboard',
          'data-management',
          'historical',
          'time-series',
          'stationarity',
          'acf-pacf',
          'arima-models',
          'model-performance',
          'future-forecast',
        ];
        const idx = parseInt(e.key, 10) - 1;
        if (tabs[idx]) {
          setActiveTab(tabs[idx]);
          sound.playClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sound]);

  // Update theme class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sfi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sfi_theme', 'light');
    }
  }, [darkMode]);

  // Extract available years from dataset
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    project.monthlyData.forEach((m) => set.add(m.year));
    return Array.from(set).sort();
  }, [project.monthlyData]);

  // Filtered monthly data based on global filters
  const filteredMonthly = useMemo(() => {
    return project.monthlyData.filter((m) => {
      if (filterState.year !== 'all' && m.year !== parseInt(filterState.year, 10)) {
        return false;
      }
      if (filterState.quarter !== 'all' && m.quarter !== parseInt(filterState.quarter, 10)) {
        return false;
      }
      return true;
    });
  }, [project.monthlyData, filterState]);

  // Handle CSV file upload
  const handleFileUpload = (content: string, fileName: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const processed = processCompleteSalesPipeline(content, fileName);
        setProject(processed);
        setFilterState({ year: 'all', quarter: 'all', startDate: '', endDate: '' });
        setActiveTab('data-management');
        addToast('Dataset Loaded Successfully', `Processed ${processed.monthlyData.length} monthly steps from ${fileName}`);
      } catch (err: any) {
        setErrorMessage(
          err?.message ||
            'We could not process the uploaded file. Please ensure your CSV contains an Order Date column and a numeric Sales column.'
        );
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  // Reset to authoritative project sample dataset
  const handleResetToSample = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const processed = processCompleteSalesPipeline();
        setProject(processed);
        setFilterState({ year: 'all', quarter: 'all', startDate: '', endDate: '' });
        addToast('Reset to Default Dataset', 'Restored authoritative 48-month university project data.');
      } catch (err: any) {
        setErrorMessage('Failed to reset dataset: ' + (err?.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  };

  const selectedOrderStr = `ARIMA(${project.selectedModelOrder.join(',')})`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Magnetic Cursor with spring physics */}
      <MagneticCursor />

      {/* Top Header */}
      <Header
        project={project}
        darkMode={darkMode}
        onToggleDarkMode={() => {
          sound.playClick();
          setDarkMode(!darkMode);
        }}
        onResetToDefault={handleResetToSample}
        onNavigateTab={(tab) => {
          sound.playClick();
          setActiveTab(tab);
        }}
        onOpenPresentation={() => {
          sound.playClick();
          setShowVivaMode(true);
        }}
        isAudioMuted={sound.isMuted}
        onToggleAudio={sound.toggleMute}
      />

      {/* Main Body with Sidebar + Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            sound.playClick();
            setActiveTab(tab);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => {
            sound.playClick();
            setSidebarCollapsed(!sidebarCollapsed);
          }}
          qualityScore={project.quality.totalScore}
          selectedOrderStr={selectedOrderStr}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Error Banner if upload failed */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-900 block">File Processing Notice</span>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-700 hover:text-red-900 px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Processing Loading Indicator */}
          {isProcessing ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-[#2563EB]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0F172A]">Evaluating Time Series Data...</h3>
                <p className="text-xs text-[#64748B] max-w-sm">
                  Cleaning records, running Augmented Dickey-Fuller stationarity tests, computing ACF/PACF, and fitting ARIMA parameter grid.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Global Filter Bar (shown on overview and time series views) */}
              {['dashboard', 'historical', 'time-series'].includes(activeTab) && (
                <GlobalFilterBar
                  years={availableYears}
                  filterState={filterState}
                  onFilterChange={(f) => {
                    sound.playClick();
                    setFilterState((prev) => ({ ...prev, ...f }));
                  }}
                  onResetFilters={() => {
                    sound.playClick();
                    setFilterState({ year: 'all', quarter: 'all', startDate: '', endDate: '' });
                  }}
                  filteredCount={filteredMonthly.length}
                  totalCount={project.monthlyData.length}
                />
              )}

              {/* View Router with Custom Cubic Bezier Transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'dashboard' && (
                    <ExecutiveDashboard
                      project={project}
                      onNavigateTab={(tab) => {
                        sound.playClick();
                        setActiveTab(tab);
                      }}
                      onDataSound={sound.playDataTick}
                      onPlayClick={sound.playClick}
                      soundEnabled={!sound.isMuted}
                    />
                  )}

                  {activeTab === 'data-management' && (
                    <DataManagement
                      project={project}
                      onFileUpload={handleFileUpload}
                      onResetToSample={handleResetToSample}
                      isProcessing={isProcessing}
                    />
                  )}

                  {activeTab === 'historical' && (
                    <HistoricalAnalysis
                      project={project}
                      filteredMonthly={filteredMonthly}
                    />
                  )}

                  {activeTab === 'time-series' && (
                    <TimeSeriesLab
                      project={project}
                      filteredMonthly={filteredMonthly}
                    />
                  )}

                  {activeTab === 'stationarity' && (
                    <StationarityLab project={project} />
                  )}

                  {activeTab === 'acf-pacf' && (
                    <AcfPacfLab project={project} />
                  )}

                  {activeTab === 'arima-models' && (
                    <ArimaModelCenter project={project} />
                  )}

                  {activeTab === 'model-performance' && (
                    <ModelPerformance project={project} />
                  )}

                  {activeTab === 'residual-diagnostics' && (
                    <ResidualDiagnosticsView project={project} />
                  )}

                  {activeTab === 'future-forecast' && (
                    <FutureForecastView
                      project={project}
                      onNavigateTab={(tab) => {
                        sound.playClick();
                        setActiveTab(tab);
                      }}
                    />
                  )}

                  {activeTab === 'forecast-table' && (
                    <ForecastTableView project={project} />
                  )}

                  {activeTab === 'business-insights' && (
                    <BusinessInsightsView project={project} />
                  )}

                  {activeTab === 'report-generator' && (
                    <ReportGenerator project={project} />
                  )}

                  {activeTab === 'export-center' && (
                    <ExportCenter project={project} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* Minimal Professional Light Footer */}
          <footer className="pt-8 pb-4 border-t border-[#E2E8F0] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono no-print">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#2563EB]" />
              <span className="text-[#475569] font-medium">COMSATS University Islamabad · Department of Management Sciences</span>
            </div>
            <div className="text-center sm:text-right text-[11px] text-[#64748B]">
              <span>Business Data Analysis · Time Series & ARIMA Forecasting · Muhammad Abubakar (FA24-BBD-109)</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Full-Screen Viva Presentation Defense Modal */}
      {showVivaMode && (
        <VivaPresentationMode
          project={project}
          onClose={() => {
            sound.playClick();
            setShowVivaMode(false);
          }}
        />
      )}

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

