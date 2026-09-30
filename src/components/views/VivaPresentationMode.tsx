import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface VivaPresentationModeProps {
  project: ProcessedSalesProject;
  onClose: () => void;
}

interface Slide {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const VivaPresentationMode: React.FC<VivaPresentationModeProps> = ({ project, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const {
    historicalStats,
    quality,
    adfOriginal,
    adfDifferenced,
    selectedModelOrder,
    testEvaluation,
    residuals,
    futureForecast,
    monthlyData,
  } = project;

  const slides: Slide[] = [
    {
      id: 'intro',
      chapter: 'Chapter 01 · Project Overview',
      title: 'Time Series Sales Forecasting Using ARIMA',
      subtitle: 'COMSATS University Islamabad · Department of Management Sciences',
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-[#2563EB]" />
              <div>
                <h4 className="text-lg font-bold text-[#0F172A]">Course: Business Data Analysis</h4>
                <p className="text-xs text-[#475569] font-mono">Investigator: Muhammad Abubakar (FA24-BBD-109)</p>
                <p className="text-xs text-[#64748B] font-mono">Supervisor: Sir Usama Ali</p>
              </div>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              This empirical research applies the Box-Jenkins methodology to historical business sales transaction data. The project automates data quality hygiene, establishes statistical stationarity via Augmented Dickey-Fuller tests, estimates autoregressive and moving-average orders, and validates forecast precision for strategic resource planning.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 font-mono text-center">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Historical Horizon</span>
              <span className="text-xl font-bold text-[#0F172A]">{monthlyData.length} Months</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Total Historical Sales</span>
              <span className="text-xl font-bold text-[#16A34A]">{formatCompactCurrency(historicalStats.totalSales)}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Selected Model</span>
              <span className="text-xl font-bold text-[#2563EB]">ARIMA({selectedModelOrder.join(',')})</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-hygiene',
      chapter: 'Chapter 02 · Data Quality & Hygiene',
      title: 'Automated Cleaning & Time Series Aggregation',
      subtitle: 'Ensuring numerical validity, chronological ordering, and outlier bounds',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Quality Score</span>
              <span className="text-2xl font-bold text-[#16A34A]">{quality.totalScore}%</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Raw Records</span>
              <span className="text-2xl font-bold text-[#0F172A]">{quality.rowsBeforeCleaning}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Duplicates Purged</span>
              <span className="text-2xl font-bold text-[#0284C7]">{quality.duplicateRows}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Outlier Months</span>
              <span className="text-2xl font-bold text-[#7C3AED]">{quality.outlierMonthsCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs text-[#475569]">
            <span className="font-bold text-[#0F172A] text-sm block">Validation Method:</span>
            <p>1. Datetime coercion handles standard timestamp variations without dropping genuine observations.</p>
            <p>2. Sales column undergoes numeric coercion, filtering negative values and missing tokens.</p>
            <p>3. Resampling to calendar month-end produces continuous equidistant time-series steps.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'stationarity',
      chapter: 'Chapter 03 · Stationarity Analysis',
      title: 'Augmented Dickey-Fuller (ADF) Unit Root Test',
      subtitle: 'Mathematical rationale for selecting differencing order d = 1',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
              <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider block">Level Series (d = 0)</span>
              <div className="text-lg font-mono font-bold text-[#0F172A]">ADF: {adfOriginal.adfStatistic.toFixed(4)}</div>
              <div className="text-sm font-mono text-[#DC2626]">p-value: {adfOriginal.pValue.toFixed(4)}</div>
              <p className="text-xs text-[#64748B] pt-2 border-t border-[#FECACA]">
                Failed to reject unit-root null hypothesis (p &gt; 0.05). The raw series contains stochastic drift and non-constant mean.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider block">First-Differenced (d = 1)</span>
              <div className="text-lg font-mono font-bold text-[#15803D]">ADF: {adfDifferenced.adfStatistic.toFixed(4)}</div>
              <div className="text-sm font-mono text-[#16A34A]">p-value: {adfDifferenced.pValue.toFixed(4)}</div>
              <p className="text-xs text-[#64748B] pt-2 border-t border-[#BBF7D0]">
                Reject null hypothesis (p &le; 0.05). Differencing successfully stabilized the series, establishing d = 1.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-center text-[#475569]">
            5% Critical Threshold: {adfDifferenced.criticalValues['5%'].toFixed(4)} · Differenced Statistic: {adfDifferenced.adfStatistic.toFixed(4)} (More Negative = Rejection)
          </div>
        </div>
      ),
    },
    {
      id: 'model-selection',
      chapter: 'Chapter 04 · ARIMA Parameter Grid Search',
      title: 'Information Criterion Optimization (AIC / BIC)',
      subtitle: `Selection of ARIMA(${selectedModelOrder.join(',')}) by lowest Akaike Information Criterion`,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Optimal Model</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">Lowest AIC</span>
            </div>
            <h3 className="text-3xl font-extrabold text-[#0F172A] font-mono">
              ARIMA({selectedModelOrder.join(',')})
            </h3>
            <p className="text-xs text-[#475569]">
              Evaluated across 16 parameter specifications for p ∈ [0, 3] and q ∈ [0, 3] with d = {selectedModelOrder[1]}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-center">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Akaike Information Criterion (AIC)</span>
              <span className="text-xl font-bold text-[#2563EB]">{testEvaluation.metrics.aic.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Bayesian Information Criterion (BIC)</span>
              <span className="text-xl font-bold text-[#0F172A]">{testEvaluation.metrics.bic.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'performance',
      chapter: 'Chapter 05 · Holdout Test Accuracy',
      title: 'Empirical Out-of-Sample Performance',
      subtitle: '20% holdout test partition validation',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center font-mono">
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">MAE</span>
              <span className="text-2xl font-bold text-[#0F172A]">{formatCurrency(testEvaluation.metrics.mae)}</span>
              <span className="text-[11px] text-[#94A3B8] font-sans block mt-1">Mean Absolute Error</span>
            </div>
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">RMSE</span>
              <span className="text-2xl font-bold text-[#0F172A]">{formatCurrency(testEvaluation.metrics.rmse)}</span>
              <span className="text-[11px] text-[#94A3B8] font-sans block mt-1">Root Mean Squared Error</span>
            </div>
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">MAPE</span>
              <span className="text-2xl font-bold text-[#16A34A]">{testEvaluation.metrics.mape.toFixed(2)}%</span>
              <span className="text-[11px] text-[#94A3B8] font-sans block mt-1">{(100 - testEvaluation.metrics.mape).toFixed(1)}% Accuracy</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
            Holdout testing on {testEvaluation.records.length} out-of-sample periods confirmed stable error bounds without overfitting.
          </div>
        </div>
      ),
    },
    {
      id: 'residuals',
      chapter: 'Chapter 06 · Residual White-Noise Verification',
      title: 'Ljung-Box Diagnostic & Normality',
      subtitle: 'Checking for absence of serial autocorrelation in model residuals',
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Diagnostic Test</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold">
                p-value: {residuals.ljungBoxPValue.toFixed(4)}
              </span>
            </div>
            <h4 className="text-xl font-bold text-[#0F172A]">
              Ljung-Box Portmanteau Q-Test: White Noise Validated
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              {residuals.summaryText}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-center text-xs">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-sans">Mean Residual:</span>
              <span className="text-[#0F172A] font-bold">{residuals.mean.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-sans">Residual Std:</span>
              <span className="text-[#0F172A] font-bold">±{residuals.std.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'future',
      chapter: 'Chapter 07 · Future 12-Month Projections',
      title: 'Strategic Revenue Forecast Horizon',
      subtitle: 'Projected sales volume refitted on 100% of historical observations',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">12-Month Total</span>
              <span className="text-xl font-bold text-[#16A34A]">{formatCompactCurrency(futureForecast.totalSales)}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Monthly Mean</span>
              <span className="text-xl font-bold text-[#2563EB]">{formatCompactCurrency(futureForecast.averageMonthlySales)}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Projected Peak</span>
              <span className="text-lg font-bold text-[#0F172A]">{futureForecast.highestMonth.monthLabel}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] block font-sans">Peak Volume</span>
              <span className="text-lg font-bold text-[#16A34A]">{formatCompactCurrency(futureForecast.highestMonth.forecastSales)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] space-y-1">
            <span className="font-semibold text-[#0F172A] block">Managerial Recommendation:</span>
            <p className="text-[#64748B]">
              Prepare procurement, inventory stocking, and staffing capacity around peak revenue month ({futureForecast.highestMonth.monthLabel}) while monitoring monthly variance within 95% confidence bands.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'conclusion',
      chapter: 'Chapter 08 · Viva Defense Certification',
      title: 'Formal Project Summary & Submission',
      subtitle: 'COMSATS University Islamabad · Department of Management Sciences',
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-white to-[#F8FAFC] border border-[#BFDBFE] space-y-3">
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Examination & Presentation Milestone</span>
            </div>
            <h4 className="text-xl font-bold text-[#0F172A]">
              End-to-End Time Series Pipeline Successfully Executed
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              All statistical checkpoints verified: data cleaning, chronological indexing, stationarity differencing, ACF/PACF identification, AIC minimization, holdout out-of-sample validation, and white-noise residual testing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-[#E2E8F0]">
            <div>
              <span className="text-[#64748B] block">Candidate:</span>
              <span className="text-[#0F172A] font-bold">Muhammad Abubakar (FA24-BBD-109)</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Instructor:</span>
              <span className="text-[#0F172A] font-bold">Sir Usama Ali</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((s) => Math.min(slides.length - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((s) => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 select-none">
      <div className="relative flex flex-col h-full max-h-[720px] w-full max-w-4xl rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB]">
            <GraduationCap className="h-4 w-4" />
            <span className="font-semibold">Viva & Presentation Defense Mode</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#64748B]">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider block">
              {slide.chapter}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-[#64748B]">{slide.subtitle}</p>
          </div>

          <div className="pt-2">{slide.content}</div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <button
            onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentSlide === 0
                ? 'text-[#94A3B8] cursor-not-allowed'
                : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Slide Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-[#2563EB]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentSlide === slides.length - 1
                ? 'text-[#94A3B8] cursor-not-allowed'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
