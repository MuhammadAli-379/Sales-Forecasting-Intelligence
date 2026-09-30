import React, { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  Info,
  TrendingUp,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { ChartDataPoint, InteractiveChart } from '../charts/InteractiveChart';
import { BarDistributionChart } from '../charts/BarDistributionChart';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface ModelPerformanceProps {
  project: ProcessedSalesProject;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ project }) => {
  const { trainData, testData, testEvaluation, selectedModelOrder } = project;
  const { metrics, records } = testEvaluation;

  // Chart dataset for Actual vs Holdout Test Forecast
  const holdoutChartData: ChartDataPoint[] = useMemo(() => {
    const list: ChartDataPoint[] = [];

    // Training observations
    trainData.forEach((m, idx) => {
      list.push({
        label: m.monthLabel,
        subLabel: 'Training Partition',
        actual: m.sales,
        isSplitPoint: idx === trainData.length - 1,
      });
    });

    // Test observations with actuals and forecast
    records.forEach((r) => {
      list.push({
        label: r.monthLabel,
        subLabel: 'Holdout Test Partition',
        testActual: r.actualSales,
        forecast: r.forecastSales,
        lowerCI: r.lowerCI,
        upperCI: r.upperCI,
      });
    });

    return list;
  }, [trainData, records]);

  // Absolute error bar data
  const errorBarData = useMemo(() => {
    return records.map((r) => ({
      label: r.monthLabel,
      value: r.absoluteError,
      color: '#F59E0B',
    }));
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">ARIMA Model Performance & Validation</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Holdout out-of-sample accuracy evaluation, absolute forecast errors, and confidence intervals
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 px-3 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-mono text-[#475569]">
          <span>Split: 80% Train ({trainData.length} mo) / 20% Test ({testData.length} mo)</span>
        </div>
      </div>

      {/* Main KPI Cards: MAE, RMSE, MAPE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MAE */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold uppercase tracking-wider">Mean Absolute Error (MAE)</span>
            <span className="text-[11px] font-mono text-[#2563EB]">Σ|y - ŷ| / n</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#0F172A] tabular-nums">
            {formatCurrency(metrics.mae)}
          </p>
          <p className="text-xs text-[#64748B] leading-snug">
            Average magnitude of forecast errors in sales currency units without penalizing large swings disproportionately.
          </p>
        </div>

        {/* RMSE */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold uppercase tracking-wider">Root Mean Squared Error (RMSE)</span>
            <span className="text-[11px] font-mono text-[#0284C7]">√(Σ(y - ŷ)² / n)</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#0F172A] tabular-nums">
            {formatCurrency(metrics.rmse)}
          </p>
          <p className="text-xs text-[#64748B] leading-snug">
            Square root of mean squared errors. Heavily penalizes large variance outliers in predictions.
          </p>
        </div>

        {/* MAPE */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold uppercase tracking-wider">Mean Abs Percentage Error (MAPE)</span>
            <span className="text-[11px] font-mono text-[#16A34A]">(Σ|e/y| / n) · 100%</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#16A34A] tabular-nums">
            {metrics.mape.toFixed(2)}%
          </p>
          <p className="text-xs text-[#64748B] leading-snug">
            Relative error scale independent of volume. Represents ~{(100 - metrics.mape).toFixed(1)}% empirical prediction precision.
          </p>
        </div>
      </div>

      {/* Main Holdout Actual vs Forecast Chart */}
      <InteractiveChart
        title="Holdout Test: Actual Sales vs ARIMA Forecast"
        subtitle="Historical training data (blue), holdout test actuals (white dots), ARIMA forecast (coral dashed), and 95% confidence interval ribbon"
        data={holdoutChartData}
        splitLabel="Train / Test Split"
        height={380}
        showMovingAverage={false}
        showConfidenceInterval={true}
      />

      {/* Holdout Error Bar Chart & Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absolute Error by Month */}
        <BarDistributionChart
          title="Holdout Forecast Absolute Error (|Actual - Forecast|)"
          subtitle="Dollar error magnitude per holdout observation (Amber bars)"
          data={errorBarData}
          height={320}
        />

        {/* Detailed Evaluation Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Holdout Month-by-Month Log</h3>
              <p className="text-xs text-[#64748B]">Actuals, point predictions, and error percentages</p>
            </div>
            <span className="text-xs font-mono text-[#64748B]">
              {records.length} Holdout Months
            </span>
          </div>

          <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Actual</th>
                  <th className="py-2.5 px-3 text-right">Forecast</th>
                  <th className="py-2.5 px-3 text-right">Abs Error</th>
                  <th className="py-2.5 px-3 text-right">Error %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#0F172A]">{r.monthLabel}</td>
                    <td className="py-2 px-3 text-right text-[#475569]">
                      {formatCurrency(r.actualSales)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#DC2626] font-semibold">
                      {formatCurrency(r.forecastSales)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#D97706] font-medium">
                      {formatCurrency(r.absoluteError)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#16A34A] font-bold">
                      {r.percentageError.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
