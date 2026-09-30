import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpDown,
  CheckCircle2,
  HelpCircle,
  Layers,
  Scale,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ARIMAModelCandidate, ProcessedSalesProject } from '../../types';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface ArimaModelCenterProps {
  project: ProcessedSalesProject;
}

export const ArimaModelCenter: React.FC<ArimaModelCenterProps> = ({ project }) => {
  const { candidateModels, selectedModelOrder, testEvaluation, alternativeModels } = project;
  const [sortField, setSortField] = useState<'aic' | 'bic' | 'order'>('aic');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'candidates' | 'benchmarks'>('candidates');

  const selectedModelStr = `ARIMA(${selectedModelOrder.join(',')})`;

  // Sorted candidates
  const sortedCandidates = useMemo(() => {
    const list = [...candidateModels];
    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'aic') diff = a.aic - b.aic;
      else if (sortField === 'bic') diff = a.bic - b.bic;
      else if (sortField === 'order') diff = a.p - b.p || a.q - b.q;
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [candidateModels, sortField, sortAsc]);

  const handleSort = (field: 'aic' | 'bic' | 'order') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">ARIMA Model Center</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Model parameter grid search, information criterion optimization (AIC/BIC), and benchmark comparisons
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'candidates' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            ARIMA Specifications ({candidateModels.length})
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'benchmarks' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Benchmark Models ({alternativeModels.length})
          </button>
        </div>
      </div>

      {/* Interactive Hyperparameter Tuning Playground */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#2563EB]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Interactive ARIMA Order Playground</h3>
              <p className="text-xs text-[#64748B]">
                Adjust autoregressive (p), differencing (d), and moving-average (q) parameters to test model behavior
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-medium">
            Real-time Evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AR Order p */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#475569]">AR Order (p):</span>
              <span className="font-mono text-[#2563EB] font-bold text-sm">p = {selectedModelOrder[0]}</span>
            </div>
            <p className="text-[11px] text-[#64748B]">Controls number of lagged sales observations in autoregression.</p>
            <div className="flex items-center gap-1 pt-1">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  disabled={val === selectedModelOrder[0]}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    val === selectedModelOrder[0]
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Order d */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#475569]">Differencing (d):</span>
              <span className="font-mono text-[#0284C7] font-bold text-sm">d = {selectedModelOrder[1]}</span>
            </div>
            <p className="text-[11px] text-[#64748B]">Determined by ADF stationarity test (d=1 stabilizes mean).</p>
            <div className="flex items-center gap-1 pt-1">
              {[0, 1].map((val) => (
                <button
                  key={val}
                  disabled={val === selectedModelOrder[1]}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    val === selectedModelOrder[1]
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  d = {val}
                </button>
              ))}
            </div>
          </div>

          {/* MA Order q */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#475569]">MA Order (q):</span>
              <span className="font-mono text-[#7C3AED] font-bold text-sm">q = {selectedModelOrder[2]}</span>
            </div>
            <p className="text-[11px] text-[#64748B]">Controls number of lagged forecast error shock terms.</p>
            <div className="flex items-center gap-1 pt-1">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  disabled={val === selectedModelOrder[2]}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    val === selectedModelOrder[2]
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Model Showcase Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-[#BFDBFE] text-[#1D4ED8] text-xs font-mono font-medium shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
              <span>Selected by lowest AIC criterion</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-mono">
                {selectedModelStr}
              </h3>
              <span className="text-sm font-sans text-[#64748B]">
                (p={selectedModelOrder[0]}, d={selectedModelOrder[1]}, q={selectedModelOrder[2]})
              </span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              AutoRegressive Integrated Moving Average fitted using conditional sum-of-squares and maximum likelihood. Evaluated across 16 parameter permutations; selected based on lowest Akaike Information Criterion.
            </p>
          </div>

          {/* Metric Grid inside Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-center shrink-0">
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">Lowest AIC</span>
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {testEvaluation.metrics.aic.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">BIC</span>
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {testEvaluation.metrics.bic.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">Test MAPE</span>
              <span className="text-base font-bold text-[#16A34A] tabular-nums">
                {testEvaluation.metrics.mape.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">Test MAE</span>
              <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                {formatCompactCurrency(testEvaluation.metrics.mae)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">Test RMSE</span>
              <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                {formatCompactCurrency(testEvaluation.metrics.rmse)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] font-sans block">Ljung-Box p</span>
              <span className="text-sm font-bold text-[#2563EB] tabular-nums">
                {testEvaluation.metrics.ljungBoxPValue.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'candidates' ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">ARIMA Specification Grid Search Results</h3>
              <p className="text-xs text-[#64748B]">
                Sorted by selected criterion. Click table headers to re-order.
              </p>
            </div>
            <span className="text-xs font-mono text-[#64748B]">
              Showing 16 Candidate Specifications
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">
                    <button
                      onClick={() => handleSort('order')}
                      className="flex items-center gap-1 hover:text-[#0F172A]"
                    >
                      <span>Model Order</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center">p (AR)</th>
                  <th className="py-2.5 px-3 text-center">d (Diff)</th>
                  <th className="py-2.5 px-3 text-center">q (MA)</th>
                  <th className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleSort('aic')}
                      className="flex items-center gap-1 ml-auto hover:text-[#0F172A]"
                    >
                      <span>AIC Criterion</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleSort('bic')}
                      className="flex items-center gap-1 ml-auto hover:text-[#0F172A]"
                    >
                      <span>BIC Criterion</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center">Selection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {sortedCandidates.map((cand, idx) => {
                  const isSelected = cand.orderStr === selectedModelStr;
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-[#EFF6FF] text-[#0F172A] font-semibold border-l-2 border-l-[#2563EB]'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0F172A] flex items-center gap-2">
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />}
                        <span>{cand.orderStr}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#475569]">{cand.p}</td>
                      <td className="py-2.5 px-3 text-center text-[#475569]">{cand.d}</td>
                      <td className="py-2.5 px-3 text-center text-[#475569]">{cand.q}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#2563EB]">
                        {cand.aic.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#64748B]">
                        {cand.bic.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                            Selected (Lowest AIC)
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans text-[#94A3B8]">Evaluated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Alternative Benchmark Models Comparison Tab */
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Forecasting Model Comparison Laboratory</h3>
              <p className="text-xs text-[#64748B]">
                Benchmarking ARIMA against Exponential Smoothing (Holt-Winters, SES) and Moving Averages
              </p>
            </div>
            <span className="text-xs font-mono text-[#2563EB] font-medium">Comparative Analytics</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Model Family</th>
                  <th className="py-2.5 px-3">Parameters</th>
                  <th className="py-2.5 px-3 text-right">MAE</th>
                  <th className="py-2.5 px-3 text-right">RMSE</th>
                  <th className="py-2.5 px-3 text-right">MAPE (%)</th>
                  <th className="py-2.5 px-3 text-right">AIC</th>
                  <th className="py-2.5 px-3">Methodology Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {alternativeModels.map((alt, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr
                      key={idx}
                      className={isTop ? 'bg-[#EFF6FF] font-semibold' : 'hover:bg-[#F8FAFC] transition-colors'}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-[#0F172A] flex items-center gap-1.5">
                        {isTop && <span className="h-2 w-2 rounded-full bg-[#16A34A]" />}
                        <span>{alt.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">{alt.parameters}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0F172A]">
                        {formatCompactCurrency(alt.mae)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0F172A]">
                        {formatCompactCurrency(alt.rmse)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isTop ? 'text-[#16A34A]' : 'text-[#475569]'}`}>
                        {alt.mape.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#2563EB]">
                        {alt.aic ? alt.aic.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-sans text-[#64748B] max-w-xs truncate">
                        {alt.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
