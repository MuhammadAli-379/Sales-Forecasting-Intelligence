import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Info,
  Layers,
  Percent,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { MonthlySalesRecord, ProcessedSalesProject } from '../../types';
import { InteractiveChart } from '../charts/InteractiveChart';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface TimeSeriesLabProps {
  project: ProcessedSalesProject;
  filteredMonthly: MonthlySalesRecord[];
}

export const TimeSeriesLab: React.FC<TimeSeriesLabProps> = ({
  project,
  filteredMonthly,
}) => {
  const [viewMode, setViewMode] = useState<'levels' | 'differenced' | 'rolling-volatility'>('levels');
  const { correlationMatrix, adfOriginal } = project;

  // Chart data for Levels with Rolling Mean, Min, Max
  const levelsChartData = useMemo(() => {
    return filteredMonthly.map((m) => ({
      label: m.monthLabel,
      subLabel: `Sales: ${formatCompactCurrency(m.sales)}`,
      actual: m.sales,
      movingAvg: m.rollingMean3M,
      lowerCI: m.rollingMin3M,
      upperCI: m.rollingMax3M,
    }));
  }, [filteredMonthly]);

  // Chart data for First-Differenced Series
  const diffChartData = useMemo(() => {
    return filteredMonthly.slice(1).map((m, idx) => {
      const prev = filteredMonthly[idx].sales;
      const diffVal = m.sales - prev;
      return {
        label: m.monthLabel,
        subLabel: `Δy_t: ${diffVal >= 0 ? '+' : ''}${formatCompactCurrency(diffVal)}`,
        actual: diffVal,
      };
    });
  }, [filteredMonthly]);

  // Rolling Standard Deviation series
  const rollingStdData = useMemo(() => {
    return filteredMonthly.map((m) => ({
      label: m.monthLabel,
      subLabel: `Std: ±${m.rollingStd3M ? formatCompactCurrency(m.rollingStd3M) : 'N/A'}`,
      actual: m.rollingStd3M,
    }));
  }, [filteredMonthly]);

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Time Series Analysis Lab</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Series decomposition, first differencing, rolling statistical envelopes, and lag cross-correlations
          </p>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setViewMode('levels')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'levels' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Original Series & Envelope
          </button>
          <button
            onClick={() => setViewMode('differenced')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'differenced' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Differenced Series (Δy_t)
          </button>
          <button
            onClick={() => setViewMode('rolling-volatility')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'rolling-volatility' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Rolling Volatility (3M Std)
          </button>
        </div>
      </div>

      {/* Main Interactive Time Series Chart */}
      {viewMode === 'levels' && (
        <InteractiveChart
          title="Historical Levels with 3-Month Rolling Min/Max Envelope"
          subtitle="Observed sales levels (blue), 3-month rolling mean (cyan dashed), and 3-month min/max envelope ribbon"
          data={levelsChartData}
          height={380}
          showMovingAverage={true}
          showConfidenceInterval={true}
        />
      )}

      {viewMode === 'differenced' && (
        <InteractiveChart
          title="First-Differenced Sales Series (d = 1)"
          subtitle="Computed as Δy_t = y_t - y_{t-1}. Differencing stabilizes the mean and removes linear and non-linear stochastic drift."
          data={diffChartData}
          height={380}
          showMovingAverage={false}
          showConfidenceInterval={false}
        />
      )}

      {viewMode === 'rolling-volatility' && (
        <InteractiveChart
          title="Trailing 3-Month Rolling Standard Deviation"
          subtitle="Measures time-varying volatility across adjacent quarters. Peak periods highlight surging seasonal swing windows."
          data={rollingStdData}
          height={380}
          showMovingAverage={false}
          showConfidenceInterval={false}
        />
      )}

      {/* Educational Explanation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
            <Info className="h-4 w-4" />
            <span>Why Stationarity Matters</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            ARIMA models require time-invariant statistical properties (constant mean, constant variance, and autocovariance depending only on lag distance). Non-stationary series lead to spurious regressions and unstable forecasts.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#0284C7] text-xs font-bold uppercase tracking-wider">
            <Sliders className="h-4 w-4" />
            <span>Why Differencing is Used</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Taking consecutive differences (<code className="font-mono text-[#1D4ED8] bg-[#EFF6FF] px-1 py-0.5 rounded">{'Δy_t = y_t - y_{t-1}'}</code>) subtracts out trends, producing a stationary series suitable for autoregressive and moving average modeling (setting order <code className="font-mono text-[#1D4ED8] bg-[#EFF6FF] px-1 py-0.5 rounded">d = 1</code>).
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#7C3AED] text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            <span>Rolling Statistics & Volatility</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Computing trailing 3-month moving averages and standard deviations highlights whether variance is constant or heteroscedastic over time, identifying seasonal spikes in business revenue.
          </p>
        </div>
      </div>

      {/* Correlation Matrix Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Feature Correlation Matrix</h3>
            <p className="text-xs text-[#64748B]">
              Pearson correlation coefficients between contemporaneous sales, engineered lag variables, and rolling statistics
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            [-1.00 to +1.00]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3 text-left">Variable</th>
                {correlationMatrix.columns.map((col, idx) => (
                  <th key={idx} className="py-2.5 px-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {correlationMatrix.columns.map((rowName, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-3 text-left font-semibold text-[#0F172A]">{rowName}</td>
                  {correlationMatrix.matrix[rIdx].map((val, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    const isHigh = Math.abs(val) >= 0.7;
                    return (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3 ${
                          isSelf
                            ? 'text-[#94A3B8] font-normal'
                            : isHigh
                            ? 'text-[#2563EB] font-bold bg-[#EFF6FF]'
                            : 'text-[#475569]'
                        }`}
                      >
                        {val.toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
