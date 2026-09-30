import React, { useMemo } from 'react';
import {
  BookOpen,
  GitBranch,
  HelpCircle,
  Layers,
  Radio,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { AcfPacfChart } from '../charts/AcfPacfChart';

interface AcfPacfLabProps {
  project: ProcessedSalesProject;
}

export const AcfPacfLab: React.FC<AcfPacfLabProps> = ({ project }) => {
  const { acfPacfData, selectedModelOrder, selectedDifferencingOrderD } = project;
  const [p, d, q] = selectedModelOrder;

  // Format data for ACF Chart
  const acfChartData = useMemo(() => {
    return acfPacfData.map((item) => ({
      lag: item.lag,
      value: item.acf,
      confBound: item.confBound,
      isSignificant: item.isAcfSignificant,
    }));
  }, [acfPacfData]);

  // Format data for PACF Chart
  const pacfChartData = useMemo(() => {
    return acfPacfData.map((item) => ({
      lag: item.lag,
      value: item.pacf,
      confBound: item.confBound,
      isSignificant: item.isPacfSignificant,
    }));
  }, [acfPacfData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">ACF & PACF Diagnostics Lab</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Autocorrelation and Partial Autocorrelation functions for identifying autoregressive (p) and moving-average (q) orders
          </p>
        </div>

        {/* Selected Parameter Badge */}
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono text-[#1D4ED8] font-semibold">
          <Terminal className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Selected: ARIMA({p},{d},{q})</span>
        </div>
      </div>

      {/* Model Parameter Breakdown Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Autoregressive Order (p)</span>
            <span className="font-mono text-[#2563EB] font-bold">p = {p}</span>
          </div>
          <p className="text-lg font-bold font-mono text-[#0F172A]">Lagged Observations</p>
          <p className="text-[11px] text-[#64748B] leading-snug">
            Inferred from PACF cutoff behavior. Incorporates direct dependence on prior months.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Differencing Degree (d)</span>
            <span className="font-mono text-[#0284C7] font-bold">d = {d}</span>
          </div>
          <p className="text-lg font-bold font-mono text-[#0F172A]">Integration Order</p>
          <p className="text-[11px] text-[#64748B] leading-snug">
            Determined by ADF stationarity test. Stabilizes the mean and eliminates trend drift.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Moving Average Order (q)</span>
            <span className="font-mono text-[#7C3AED] font-bold">q = {q}</span>
          </div>
          <p className="text-lg font-bold font-mono text-[#0F172A]">Lagged Shock Errors</p>
          <p className="text-[11px] text-[#64748B] leading-snug">
            Inferred from ACF cutoff behavior. Accounts for persistence of unobserved shock residuals.
          </p>
        </div>
      </div>

      {/* Side-by-Side ACF and PACF Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcfPacfChart
          title="Autocorrelation Function (ACF)"
          subtitle="Measures total correlation between y_t and y_{t-k} across lags (indicates MA order q)"
          type="ACF"
          data={acfChartData}
          height={300}
        />

        <AcfPacfChart
          title="Partial Autocorrelation Function (PACF)"
          subtitle="Measures direct correlation between y_t and y_{t-k} controlling for intermediate lags (indicates AR order p)"
          type="PACF"
          data={pacfChartData}
          height={300}
        />
      </div>

      {/* Quantitative Analytics Terminal Guide */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Box-Jenkins Identification Rules</h3>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">Quantitative Method</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#475569]">
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <h4 className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
              <span>Autoregressive Process AR(p)</span>
            </h4>
            <p className="text-[#64748B] leading-relaxed text-[11px]">
              • <strong>ACF:</strong> Tails off gradually (exponential decay or damped sine wave).
            </p>
            <p className="text-[#64748B] leading-relaxed text-[11px]">
              • <strong>PACF:</strong> Cuts off sharply after lag <code className="text-[#1D4ED8] font-mono bg-blue-50 px-1 py-0.5 rounded">p</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <h4 className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
              <span>Moving Average Process MA(q)</span>
            </h4>
            <p className="text-[#64748B] leading-relaxed text-[11px]">
              • <strong>ACF:</strong> Cuts off sharply after lag <code className="text-[#0369A1] font-mono bg-sky-50 px-1 py-0.5 rounded">q</code>.
            </p>
            <p className="text-[#64748B] leading-relaxed text-[11px]">
              • <strong>PACF:</strong> Tails off gradually (exponential decay or damped sine wave).
            </p>
          </div>
        </div>

        {/* Tabular Lag Diagnostics */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Lag (k)</th>
                <th className="py-2.5 px-3 text-right">ACF Value</th>
                <th className="py-2.5 px-3 text-center">ACF Sig (95%)</th>
                <th className="py-2.5 px-3 text-right">PACF Value</th>
                <th className="py-2.5 px-3 text-center">PACF Sig (95%)</th>
                <th className="py-2.5 px-3 text-right">Critical Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {acfPacfData.slice(0, 10).map((row) => (
                <tr key={row.lag} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2 px-3 font-semibold text-[#0F172A]">Lag {row.lag}</td>
                  <td className={`py-2 px-3 text-right font-bold ${row.isAcfSignificant ? 'text-[#2563EB]' : 'text-[#334155]'}`}>
                    {row.acf.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {row.isAcfSignificant ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-sans font-medium">Significant</span>
                    ) : (
                      <span className="text-[10px] text-[#94A3B8] font-sans">Noise</span>
                    )}
                  </td>
                  <td className={`py-2 px-3 text-right font-bold ${row.isPacfSignificant ? 'text-[#0284C7]' : 'text-[#334155]'}`}>
                    {row.pacf.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {row.isPacfSignificant ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] font-sans font-medium">Significant</span>
                    ) : (
                      <span className="text-[10px] text-[#94A3B8] font-sans">Noise</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-[#64748B]">
                    ±{row.confBound.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
