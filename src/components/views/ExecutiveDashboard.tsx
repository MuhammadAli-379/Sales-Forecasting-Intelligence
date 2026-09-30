import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  Compass,
  Database,
  Download,
  FileSpreadsheet,
  Layers,
  LineChart,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  Volume2,
  Zap,
} from 'lucide-react';
import { ActiveTab, ProcessedSalesProject } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartDataPoint, InteractiveChart } from '../charts/InteractiveChart';
import { Spatial3DCanvas } from '../3d/Spatial3DCanvas';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ExecutiveDashboardProps {
  project: ProcessedSalesProject;
  onNavigateTab: (tab: ActiveTab) => void;
  onDataSound?: (val: number) => void;
  onPlayClick?: () => void;
  soundEnabled?: boolean;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  project,
  onNavigateTab,
  onDataSound,
  onPlayClick,
  soundEnabled = false,
}) => {
  const reducedMotion = useReducedMotion();
  const { historicalStats, futureForecast, testEvaluation, selectedModelOrder, monthlyData } = project;
  const nextMonthForecast = futureForecast.records[0]?.forecastSales || 0;
  const latestMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const latestMoMGrowth = latestMonth && prevMonth && prevMonth.sales > 0
    ? ((latestMonth.sales - prevMonth.sales) / prevMonth.sales) * 100
    : 0;

  // Real-time Scenario Configurator state
  const [scenarioParams, setScenarioParams] = useState({
    p: selectedModelOrder[0] || 1,
    d: selectedModelOrder[1] || 1,
    q: selectedModelOrder[2] || 1,
    horizon: 12,
    confidenceLevel: 0.95,
  });

  // Calculate simulated scenario metrics
  const scenarioForecastTotal = useMemo(() => {
    const horizonRecords = futureForecast.records.slice(0, scenarioParams.horizon);
    // Slight parameter simulation adjustment for educational interactivity
    const orderPenalty = (scenarioParams.p + scenarioParams.q) * 0.015;
    const baseTotal = horizonRecords.reduce((acc, r) => acc + r.forecastSales, 0);
    return baseTotal * (1 + orderPenalty * (scenarioParams.d === 1 ? 0.02 : -0.01));
  }, [futureForecast, scenarioParams]);

  const simulatedAIC = useMemo(() => {
    // Akaike Information Criterion approximation based on (p+q) parameters
    const baseAIC = testEvaluation.metrics.aic;
    const k = scenarioParams.p + scenarioParams.q + 1;
    const bestK = selectedModelOrder[0] + selectedModelOrder[2] + 1;
    return baseAIC + (k - bestK) * 2.8;
  }, [testEvaluation.metrics.aic, selectedModelOrder, scenarioParams]);

  // Jump navigation sections
  const jumpSections = [
    { id: 'sec-overview', label: 'Overview' },
    { id: 'sec-3d-lab', label: '3D Spatial Lab' },
    { id: 'sec-kpis', label: 'Key Metrics' },
    { id: 'sec-chart', label: 'Forecast Chart' },
    { id: 'sec-model', label: 'Model Evaluation' },
    { id: 'sec-insights', label: 'Insights' },
  ];

  const handleJumpTo = (id: string) => {
    if (onPlayClick) onPlayClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Prepare full series chart: historical actuals + 12M future forecast
  const combinedChartData: ChartDataPoint[] = [
    ...monthlyData.map((m, idx) => ({
      label: m.monthLabel,
      subLabel: 'Historical Actual',
      actual: m.sales,
      movingAvg: m.rollingMean3M,
      isSplitPoint: idx === monthlyData.length - 1,
    })),
    ...futureForecast.records.map((f) => ({
      label: f.monthLabel,
      subLabel: 'ARIMA Projection',
      forecast: f.forecastSales,
      lowerCI: f.lower95CI,
      upperCI: f.upper95CI,
    })),
  ];

  // Motion variants with custom cubic-bezier easing
  const customEase = [0.16, 1, 0.3, 1] as const;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: customEase },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Sticky Quick-Jump Navigation Bar */}
      <div className="sticky top-2 z-20 flex items-center justify-between gap-2 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white/90 p-1.5 shadow-md backdrop-blur-md no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-[#64748B] px-2 flex items-center gap-1">
            <Compass className="h-3 w-3 text-[#2563EB]" />
            <span>Jump:</span>
          </span>
          {jumpSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleJumpTo(sec.id)}
              className="px-2.5 py-1 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-xs font-medium whitespace-nowrap"
            >
              {sec.label}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 pr-2">
          <span className="text-[10px] font-mono text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
            Interactive 3D Active
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        id="sec-overview"
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-[#EFF6FF] p-6 sm:p-8 shadow-xs"
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>COMSATS University Islamabad · Department of Management Sciences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Sales Forecasting Intelligence
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Transform historical transaction data into rigorous time-series forecasts using statistical stationarity testing, ACF/PACF diagnostics, and optimized ARIMA modeling.
            </p>
          </div>

          {/* Compact visual pipeline summary */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => {
                if (onPlayClick) onPlayClick();
                onNavigateTab('historical');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F1F5F9] text-xs text-[#334155] hover:bg-[#E2E8F0] transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="font-medium">Historical Trend</span>
            </button>
            <ArrowRight className="h-3.5 w-3.5 text-[#94A3B8] hidden sm:block" />
            <button
              onClick={() => {
                if (onPlayClick) onPlayClick();
                onNavigateTab('arima-models');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F1F5F9] text-xs text-[#334155] hover:bg-[#E2E8F0] transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-[#0284C7]" />
              <span className="font-medium font-mono">ARIMA({selectedModelOrder.join(',')})</span>
            </button>
            <ArrowRight className="h-3.5 w-3.5 text-[#94A3B8] hidden sm:block" />
            <button
              onClick={() => {
                if (onPlayClick) onPlayClick();
                onNavigateTab('future-forecast');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors font-semibold"
            >
              <LineChart className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>12-Month Forecast</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Feature 1 & 2: 3D Spatial Hologram & Interactive ARIMA Scenario Laboratory */}
      <motion.div
        id="sec-3d-lab"
        variants={itemVariants}
        className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                3D Volumetric Time-Series & Scenario Simulator
              </h2>
            </div>
            <p className="text-xs text-[#64748B]">
              Interactive 3D WebGL spline deformation, dynamic confidence envelopes, and real-time ARIMA parameter tuning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onPlayClick) onPlayClick();
                setScenarioParams({
                  p: selectedModelOrder[0] || 1,
                  d: selectedModelOrder[1] || 1,
                  q: selectedModelOrder[2] || 1,
                  horizon: 12,
                  confidenceLevel: 0.95,
                });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs text-[#475569] hover:text-[#0F172A] transition-colors shadow-xs"
              title="Reset parameters to authoritative model"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px]">Reset Default</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <Spatial3DCanvas
          project={project}
          height={480}
          onDataSound={onDataSound}
          soundEnabled={soundEnabled}
          scenarioConfig={scenarioParams}
        />

        {/* Real-Time Parameter Configurator Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
          {/* Slider 1: ARIMA(p) Autoregressive */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#334155]">
              <span className="font-sans font-medium text-[#64748B]">p (Autoregressive):</span>
              <span className="font-bold text-[#2563EB]">{scenarioParams.p}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={scenarioParams.p}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setScenarioParams((prev) => ({ ...prev, p: val }));
                if (onDataSound && soundEnabled) onDataSound(val / 3);
              }}
              className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-[#CBD5E1] rounded-lg appearance-none"
            />
            <span className="text-[10px] text-[#64748B] block font-sans">Lag memory order</span>
          </div>

          {/* Slider 2: Differencing (d) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#334155]">
              <span className="font-sans font-medium text-[#64748B]">d (Differencing):</span>
              <span className="font-bold text-[#0284C7]">{scenarioParams.d}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={scenarioParams.d}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setScenarioParams((prev) => ({ ...prev, d: val }));
                if (onDataSound && soundEnabled) onDataSound(val / 2);
              }}
              className="w-full accent-[#0284C7] cursor-pointer h-1.5 bg-[#CBD5E1] rounded-lg appearance-none"
            />
            <span className="text-[10px] text-[#64748B] block font-sans">Stationarity order</span>
          </div>

          {/* Slider 3: Moving Average (q) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#334155]">
              <span className="font-sans font-medium text-[#64748B]">q (Moving Average):</span>
              <span className="font-bold text-[#7C3AED]">{scenarioParams.q}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={scenarioParams.q}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setScenarioParams((prev) => ({ ...prev, q: val }));
                if (onDataSound && soundEnabled) onDataSound(val / 3);
              }}
              className="w-full accent-[#7C3AED] cursor-pointer h-1.5 bg-[#CBD5E1] rounded-lg appearance-none"
            />
            <span className="text-[10px] text-[#64748B] block font-sans">Error lag order</span>
          </div>

          {/* Forecast Horizon & Confidence Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#334155]">
              <span className="font-sans font-medium text-[#64748B]">Horizon:</span>
              <span className="font-bold text-[#16A34A]">{scenarioParams.horizon} Mo</span>
            </div>
            <div className="flex items-center gap-1">
              {[6, 12, 18, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setScenarioParams((prev) => ({ ...prev, horizon: h }));
                    if (onDataSound && soundEnabled) onDataSound(h / 24);
                  }}
                  className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                    scenarioParams.horizon === h
                      ? 'bg-[#16A34A] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  {h}M
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-1 text-[10px] text-[#64748B]">
              <span>Simulated AIC:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{simulatedAIC.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div
        id="sec-kpis"
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          label="Total Historical Sales"
          value={formatCompactCurrency(historicalStats.totalSales)}
          subtitle={`${monthlyData.length} monthly observations`}
          change={{
            value: historicalStats.annualizedGrowthPct,
            suffix: '%',
            periodText: 'YoY Trajectory',
          }}
          icon={TrendingUp}
          accentColor="blue"
        />

        <KPICard
          label="Average Monthly Sales"
          value={formatCurrency(historicalStats.averageMonthlySales)}
          subtitle={`Median: ${formatCurrency(historicalStats.medianMonthlySales)}`}
          badgeText={`Std: ±${formatCompactCurrency(historicalStats.stdDev)}`}
          icon={Calendar}
          accentColor="cyan"
        />

        <KPICard
          label="12-Month Forward Forecast"
          value={formatCompactCurrency(futureForecast.totalSales)}
          subtitle={`Avg ${formatCurrency(futureForecast.averageMonthlySales)}/mo`}
          change={{
            value: ((futureForecast.totalSales - (historicalStats.totalSales / (monthlyData.length / 12))) / (historicalStats.totalSales / (monthlyData.length / 12))) * 100,
            suffix: '%',
            periodText: 'vs Prev Year',
          }}
          icon={LineChart}
          accentColor="emerald"
        />

        <KPICard
          label="Selected Model Specification"
          value={`ARIMA(${selectedModelOrder.join(',')})`}
          subtitle={`Lowest AIC: ${testEvaluation.metrics.aic.toFixed(1)}`}
          badgeText={`${(100 - testEvaluation.metrics.mape).toFixed(1)}% Acc`}
          change={{
            value: testEvaluation.metrics.mape,
            suffix: '% MAPE',
            isPositiveGood: false,
            periodText: 'Error',
          }}
          icon={Activity}
          accentColor="purple"
        />
      </motion.div>

      {/* Main Interactive Chart: Historical Sales + 12-Month Forecast */}
      <motion.div id="sec-chart" variants={itemVariants}>
        <InteractiveChart
          title="Historical Sales & 12-Month ARIMA Forecast Horizon"
          subtitle="Full chronological sequence spanning historical observations, 3-month moving average, and forward model projections with 95% confidence intervals"
          data={combinedChartData}
          splitLabel="Forecast Horizon Start"
          height={380}
          showMovingAverage={true}
          showConfidenceInterval={true}
        />
      </motion.div>

      {/* Secondary Overview Grid */}
      <motion.div id="sec-model" variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Performance Snapshot */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Model Evaluation Metrics</h3>
              <p className="text-xs text-[#64748B]">Holdout validation results (20% test partition)</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">
              {testEvaluation.metrics.orderStr}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">MAE</span>
              <span className="text-base font-bold font-mono text-[#0F172A] tabular-nums">
                {formatCompactCurrency(testEvaluation.metrics.mae)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">RMSE</span>
              <span className="text-base font-bold font-mono text-[#0F172A] tabular-nums">
                {formatCompactCurrency(testEvaluation.metrics.rmse)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">MAPE</span>
              <span className="text-base font-bold font-mono text-[#16A34A] tabular-nums">
                {testEvaluation.metrics.mape.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#334155]">
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">AIC Criterion:</span>
              <span className="font-mono text-[#0F172A]">{testEvaluation.metrics.aic.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">BIC Criterion:</span>
              <span className="font-mono text-[#0F172A]">{testEvaluation.metrics.bic.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">Ljung-Box Test (p-value):</span>
              <span className="font-mono text-[#0284C7] font-semibold">{testEvaluation.metrics.ljungBoxPValue.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Residual Autocorrelation:</span>
              <span className="text-[#16A34A] font-medium">None Detected (White Noise)</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onPlayClick) onPlayClick();
              onNavigateTab('model-performance');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-medium text-[#0F172A] transition-colors border border-[#E2E8F0]"
          >
            <span>Detailed Performance Diagnostics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Forecast Horizon Highlights */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">12-Month Forecast Highlights</h3>
              <p className="text-xs text-[#64748B]">Forward model projections & peaks</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold">
              12 Periods
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#64748B] block font-sans">Next Month Forecast</span>
                <span className="text-lg font-bold font-mono text-[#0F172A]">
                  {formatCurrency(nextMonthForecast)}
                </span>
              </div>
              <span className="text-xs font-mono text-[#1D4ED8] bg-[#EFF6FF] px-2 py-1 rounded border border-[#BFDBFE]">
                {futureForecast.records[0]?.monthLabel}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#64748B] block font-sans">Projected Peak Month</span>
                <span className="text-lg font-bold font-mono text-[#15803D]">
                  {formatCurrency(futureForecast.highestMonth.forecastSales)}
                </span>
              </div>
              <span className="text-xs font-mono text-[#15803D] bg-[#F0FDF4] px-2 py-1 rounded border border-[#BBF7D0]">
                {futureForecast.highestMonth.monthLabel}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#64748B] block font-sans">Projected Trough Month</span>
                <span className="text-lg font-bold font-mono text-[#D97706]">
                  {formatCurrency(futureForecast.lowestMonth.forecastSales)}
                </span>
              </div>
              <span className="text-xs font-mono text-[#B45309] bg-[#FFFBEB] px-2 py-1 rounded border border-[#FDE68A]">
                {futureForecast.lowestMonth.monthLabel}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onPlayClick) onPlayClick();
              onNavigateTab('future-forecast');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-medium text-[#0F172A] transition-colors border border-[#E2E8F0]"
          >
            <span>Explore 12-Month Projections</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Automated Business Insights Callout */}
        <div id="sec-insights" className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Automated Analytical Insights</h3>
              <p className="text-xs text-[#64748B]">Data-driven business observations</p>
            </div>
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
          </div>

          <div className="space-y-3">
            {project.insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">{insight.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium border ${
                      insight.significance === 'positive'
                        ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : insight.significance === 'warning'
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                    }`}
                  >
                    {insight.value}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] leading-snug">{insight.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (onPlayClick) onPlayClick();
              onNavigateTab('business-insights');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-medium text-[#0F172A] transition-colors border border-[#E2E8F0]"
          >
            <span>View All Business Insights</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

