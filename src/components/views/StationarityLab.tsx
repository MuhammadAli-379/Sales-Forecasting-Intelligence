import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  HelpCircle,
  Radio,
  Scale,
  Sparkles,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { formatNumber } from '../../utils/timeSeriesEngine';

interface StationarityLabProps {
  project: ProcessedSalesProject;
}

export const StationarityLab: React.FC<StationarityLabProps> = ({ project }) => {
  const { adfOriginal, adfDifferenced, selectedDifferencingOrderD } = project;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Stationarity Lab (ADF Diagnostic)</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Augmented Dickey-Fuller (ADF) unit root hypothesis testing for determining differencing order d
        </p>
      </div>

      {/* Decision Summary Banner */}
      <div className="rounded-xl border border-[#BFDBFE] bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#2563EB]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
              ARIMA Integration Decision Rule
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            Selected Differencing Order: <span className="font-mono text-[#2563EB] text-xl">d = {selectedDifferencingOrderD}</span>
          </h3>
          <p className="text-xs text-[#475569] max-w-2xl">
            {selectedDifferencingOrderD === 1
              ? 'Original sales series is non-stationary (p-value > 0.05). After first differencing (d=1), the series rejects the null hypothesis of a unit root (p-value ≤ 0.05), confirming stationarity.'
              : 'Original sales series rejected the null hypothesis of a unit root at the 5% level without differencing (d=0).'}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] font-mono text-sm text-[#1D4ED8] font-semibold">
          <span>Order: d = {selectedDifferencingOrderD}</span>
        </div>
      </div>

      {/* Side-by-Side ADF Test Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test 1: Original Sales Series */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">ADF Test on Original Sales</h3>
              <p className="text-xs text-[#64748B]">Raw undifferenced series (level values)</p>
            </div>
            {adfOriginal.isStationary ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                STATIONARY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                <XCircle className="h-3.5 w-3.5" />
                NON-STATIONARY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">ADF Test Statistic</span>
              <span className="text-lg font-bold font-mono text-[#0F172A] tabular-nums">
                {adfOriginal.adfStatistic.toFixed(4)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">MacKinnon p-value</span>
              <span className={`text-lg font-bold font-mono tabular-nums ${adfOriginal.pValue <= 0.05 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                {adfOriginal.pValue.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">Selected Lags:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{adfOriginal.usedLag}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">Observations (k):</span>
              <span className="font-mono text-[#0F172A] font-semibold">{adfOriginal.observations}</span>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Critical Values:
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">1% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfOriginal.criticalValues['1%'].toFixed(4)}</span>
                </div>
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">5% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfOriginal.criticalValues['5%'].toFixed(4)}</span>
                </div>
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">10% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfOriginal.criticalValues['10%'].toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] space-y-1">
            <span className="font-semibold text-[#0F172A] block">Interpretation:</span>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {adfOriginal.interpretation}
            </p>
          </div>
        </div>

        {/* Test 2: After First Differencing */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">ADF Test After First Differencing</h3>
              <p className="text-xs text-[#64748B]">First-differenced series: Δy_t = y_t - y_{'{t-1}'}</p>
            </div>
            {adfDifferenced.isStationary ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                STATIONARY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                <XCircle className="h-3.5 w-3.5" />
                NON-STATIONARY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">ADF Test Statistic</span>
              <span className="text-lg font-bold font-mono text-[#16A34A] tabular-nums">
                {adfDifferenced.adfStatistic.toFixed(4)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block font-sans">MacKinnon p-value</span>
              <span className={`text-lg font-bold font-mono tabular-nums ${adfDifferenced.pValue <= 0.05 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                {adfDifferenced.pValue.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">Selected Lags:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{adfDifferenced.usedLag}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">Observations (k):</span>
              <span className="font-mono text-[#0F172A] font-semibold">{adfDifferenced.observations}</span>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Critical Values:
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">1% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfDifferenced.criticalValues['1%'].toFixed(4)}</span>
                </div>
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">5% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfDifferenced.criticalValues['5%'].toFixed(4)}</span>
                </div>
                <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-sans">10% Level</span>
                  <span className="text-xs text-[#0F172A] font-semibold">{adfDifferenced.criticalValues['10%'].toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] space-y-1">
            <span className="font-semibold text-[#0F172A] block">Interpretation:</span>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {adfDifferenced.interpretation}
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Rigor Note */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
          <Scale className="h-4 w-4 text-[#2563EB]" />
          <span>Statistical Foundation: Augmented Dickey-Fuller Test</span>
        </h4>
        <div className="space-y-2 text-xs text-[#475569] leading-relaxed">
          <p>
            The ADF test evaluates the null hypothesis <code className="font-mono text-[#1D4ED8] bg-[#EFF6FF] px-1 py-0.5 rounded">H_0: γ = 0</code> (unit root present, series is non-stationary) against the alternative <code className="font-mono text-[#1D4ED8] bg-[#EFF6FF] px-1 py-0.5 rounded">H_1: γ &lt; 0</code> (series is stationary).
          </p>
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] text-[#1E40AF] overflow-x-auto">
            Δy_t = α + β·t + γ·y_{'{t-1}'} + Σ(δ_i · Δy_{'{t-i}'}) + ε_t
          </div>
          <p className="text-[#64748B]">
            Because the test statistic is more negative than the 5% critical value (-2.93) after first differencing, we reject H_0 and conclude that the first difference series is stationary.
          </p>
        </div>
      </div>
    </div>
  );
};
