import React, { useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Info,
  Radio,
  Scale,
  Sparkles,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { InteractiveChart } from '../charts/InteractiveChart';
import { BarDistributionChart } from '../charts/BarDistributionChart';
import { AcfPacfChart } from '../charts/AcfPacfChart';
import { QQDiagnosticChart } from '../charts/QQDiagnosticChart';
import { formatCurrency, formatNumber } from '../../utils/timeSeriesEngine';

interface ResidualDiagnosticsViewProps {
  project: ProcessedSalesProject;
}

export const ResidualDiagnosticsView: React.FC<ResidualDiagnosticsViewProps> = ({ project }) => {
  const { residuals, selectedModelOrder } = project;

  // Residual time series line data
  const residualLineData = useMemo(() => {
    return residuals.points.map((pt) => ({
      label: pt.dateStr,
      subLabel: `Res: ${formatCurrency(pt.residual)}`,
      actual: pt.standardizedResidual,
    }));
  }, [residuals]);

  // Histogram data
  const histBarData = useMemo(() => {
    return residuals.histogram.map((bin) => ({
      label: `${bin.binStart.toFixed(0)}`,
      value: bin.count,
      secondaryValue: bin.normalDensity,
      color: '#3B82F6',
    }));
  }, [residuals]);

  // Residual ACF needle data
  const resAcfData = useMemo(() => {
    return residuals.residualAcf.map((r) => ({
      lag: r.lag,
      value: r.acf,
      confBound: r.confBound,
      isSignificant: Math.abs(r.acf) > r.confBound,
    }));
  }, [residuals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">ARIMA Residual Diagnostics</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            4-quadrant statistical diagnostics assessing white noise compliance, normality, and absence of autocorrelation
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono text-[#1D4ED8] font-semibold">
          <Activity className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Model: ARIMA({selectedModelOrder.join(',')})</span>
        </div>
      </div>

      {/* Ljung-Box Test Verdict Card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Ljung-Box White Noise Diagnostic
              </span>
              {!residuals.hasResidualAutocorrelation ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-medium">
                  <CheckCircle2 className="h-3 w-3 text-[#16A34A]" />
                  White Noise Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-medium">
                  <XCircle className="h-3 w-3 text-[#D97706]" />
                  Autocorrelation Detected
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Portmanteau Test (Q-Statistic): {residuals.ljungBoxStatistic.toFixed(2)} at Lag {residuals.ljungBoxLag}
            </h3>
            <p className="text-xs text-[#475569] max-w-3xl leading-relaxed">
              {residuals.summaryText}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center font-mono">
              <span className="text-[10px] text-[#64748B] block font-sans">p-value</span>
              <span className={`text-xl font-bold tabular-nums ${!residuals.hasResidualAutocorrelation ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                {residuals.ljungBoxPValue.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Residual Summary Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Mean Residual</span>
            <span className="text-[#0F172A] font-semibold">{residuals.mean.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Residual Std</span>
            <span className="text-[#0F172A] font-semibold">±{residuals.std.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Skewness</span>
            <span className="text-[#0F172A] font-semibold">{residuals.skewness.toFixed(3)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Excess Kurtosis</span>
            <span className="text-[#0F172A] font-semibold">{residuals.kurtosis.toFixed(3)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Min Error</span>
            <span className="text-[#DC2626] font-semibold">{residuals.min.toFixed(0)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block font-sans">Max Error</span>
            <span className="text-[#16A34A] font-semibold">+{residuals.max.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Diagnostic Charts matching statsmodels plot_diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadrant 1: Standardized Residuals Over Time */}
        <InteractiveChart
          title="1. Standardized Residuals Over Time"
          subtitle="Residual values divided by estimated standard error over the training period"
          data={residualLineData}
          height={300}
          showMovingAverage={false}
          showConfidenceInterval={false}
        />

        {/* Quadrant 2: Histogram plus Estimated Density */}
        <BarDistributionChart
          title="2. Histogram plus Normal Density"
          subtitle="Empirical residual counts (blue bars) plotted against standard Gaussian curve (red line)"
          data={histBarData}
          height={300}
          hasNormalDensityOverlay={true}
        />

        {/* Quadrant 3: Normal Q-Q Plot */}
        <QQDiagnosticChart
          title="3. Normal Q-Q Plot"
          subtitle="Ordered residual quantiles versus theoretical standard normal quantiles (45° diagonal)"
          points={residuals.points}
          height={300}
        />

        {/* Quadrant 4: Correlogram (ACF of Residuals) */}
        <AcfPacfChart
          title="4. Correlogram (Residual ACF)"
          subtitle="Autocorrelation of residuals with 95% Bartlett white-noise confidence bounds"
          type="ACF"
          data={resAcfData}
          height={300}
        />
      </div>
    </div>
  );
};
