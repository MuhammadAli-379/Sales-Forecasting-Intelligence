import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { MonthlySalesRecord, ProcessedSalesProject } from '../../types';
import { InteractiveChart } from '../charts/InteractiveChart';
import { BarDistributionChart } from '../charts/BarDistributionChart';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface HistoricalAnalysisProps {
  project: ProcessedSalesProject;
  filteredMonthly: MonthlySalesRecord[];
}

export const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({
  project,
  filteredMonthly,
}) => {
  const { historicalStats, quarterlyData, yearlyData } = project;

  // Primary chart data: actual monthly sales + 3M moving average
  const chartData = useMemo(() => {
    return filteredMonthly.map((m) => ({
      label: m.monthLabel,
      subLabel: `${m.quarterName} ${m.year}`,
      actual: m.sales,
      movingAvg: m.rollingMean3M,
    }));
  }, [filteredMonthly]);

  // MoM growth data for bar chart
  const momBarData = useMemo(() => {
    return filteredMonthly
      .filter((m) => m.momGrowthPct !== null)
      .map((m) => ({
        label: m.monthLabel,
        value: m.momGrowthPct!,
      }));
  }, [filteredMonthly]);

  // Quarterly bar data
  const quarterlyBarData = useMemo(() => {
    return quarterlyData.map((q) => ({
      label: q.quarterLabel,
      value: q.sales,
      color: '#8B5CF6',
    }));
  }, [quarterlyData]);

  // Yearly bar data
  const yearlyBarData = useMemo(() => {
    return yearlyData.map((y) => ({
      label: String(y.year),
      value: y.sales,
      color: '#0D9488',
    }));
  }, [yearlyData]);

  // Monthly sales distribution bins
  const distributionData = useMemo(() => {
    const salesVals = filteredMonthly.map((m) => m.sales);
    if (salesVals.length === 0) return [];
    const minS = Math.min(...salesVals);
    const maxS = Math.max(...salesVals);
    const numBins = 7;
    const width = (maxS - minS) / numBins;
    const bins: { label: string; value: number; color: string }[] = [];

    for (let b = 0; b < numBins; b++) {
      const bStart = minS + b * width;
      const bEnd = bStart + width;
      const count = salesVals.filter((v) => v >= bStart && (b === numBins - 1 ? v <= bEnd : v < bEnd)).length;
      bins.push({
        label: `${formatCompactCurrency(bStart)}–${formatCompactCurrency(bEnd)}`,
        value: count,
        color: '#3B82F6',
      });
    }
    return bins;
  }, [filteredMonthly]);

  // Dynamically calculated insights from actual filtered subset
  const highestMonth = useMemo(() => {
    if (filteredMonthly.length === 0) return null;
    return [...filteredMonthly].sort((a, b) => b.sales - a.sales)[0];
  }, [filteredMonthly]);

  const lowestMonth = useMemo(() => {
    if (filteredMonthly.length === 0) return null;
    return [...filteredMonthly].sort((a, b) => a.sales - b.sales)[0];
  }, [filteredMonthly]);

  const avgGrowth = useMemo(() => {
    const valids = filteredMonthly.filter((m) => m.momGrowthPct !== null).map((m) => m.momGrowthPct!);
    if (valids.length === 0) return 0;
    return valids.reduce((a, b) => a + b, 0) / valids.length;
  }, [filteredMonthly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Historical Sales Analysis</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Empirical sales trajectories, rolling smoothing averages, quarterly dynamics, and distribution properties
        </p>
      </div>

      {/* Calculated Insight Cards (Strictly from actual data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Highest Sales Month</span>
            <div className="p-1 rounded-md bg-[#F0FDF4] border border-[#BBF7D0]">
              <TrendingUp className="h-3.5 w-3.5 text-[#16A34A]" />
            </div>
          </div>
          <p className="text-lg font-bold font-mono text-[#15803D]">
            {highestMonth ? formatCurrency(highestMonth.sales) : 'N/A'}
          </p>
          <p className="text-xs text-[#64748B] font-sans">{highestMonth?.monthLabel}</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Lowest Sales Month</span>
            <div className="p-1 rounded-md bg-[#FEF2F2] border border-[#FECACA]">
              <TrendingDown className="h-3.5 w-3.5 text-[#DC2626]" />
            </div>
          </div>
          <p className="text-lg font-bold font-mono text-[#B91C1C]">
            {lowestMonth ? formatCurrency(lowestMonth.sales) : 'N/A'}
          </p>
          <p className="text-xs text-[#64748B] font-sans">{lowestMonth?.monthLabel}</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Average MoM Growth</span>
            <div className="p-1 rounded-md bg-[#EFF6FF] border border-[#BFDBFE]">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
            </div>
          </div>
          <p className="text-lg font-bold font-mono text-[#0F172A]">
            {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(2)}%
          </p>
          <p className="text-xs text-[#64748B] font-sans">Across {filteredMonthly.length} observations</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Empirical Standard Deviation</span>
            <div className="p-1 rounded-md bg-[#F5F3FF] border border-[#DDD6FE]">
              <Layers className="h-3.5 w-3.5 text-[#7C3AED]" />
            </div>
          </div>
          <p className="text-lg font-bold font-mono text-[#0F172A]">
            ±{formatCurrency(historicalStats.stdDev)}
          </p>
          <p className="text-xs text-[#64748B] font-sans">
            Median: {formatCurrency(historicalStats.medianMonthlySales)}
          </p>
        </div>
      </div>

      {/* Primary Chart: Monthly Sales Trend with 3-Month Moving Average */}
      <InteractiveChart
        title="Monthly Sales Trend & 3-Month Moving Average"
        subtitle="Chronological sales time series paired with a trailing 3-month unweighted moving average smoothing filter"
        data={chartData}
        height={360}
        showMovingAverage={true}
        showConfidenceInterval={false}
      />

      {/* Secondary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month-over-Month Growth Bar Chart */}
        <BarDistributionChart
          title="Month-over-Month (MoM) Sales Growth (%)"
          subtitle="Percentage change in monthly sales volume (Green = Positive, Red = Negative)"
          data={momBarData}
          isPercentage={true}
          showZeroLine={true}
          height={300}
        />

        {/* Quarterly Sales Performance */}
        <BarDistributionChart
          title="Quarterly Aggregated Sales"
          subtitle="Total transaction volume rolled up by calendar quarters (Q1–Q4)"
          data={quarterlyBarData}
          height={300}
        />

        {/* Yearly Sales Performance */}
        <BarDistributionChart
          title="Yearly Total Revenue"
          subtitle="Annual revenue aggregates showing multi-year expansion"
          data={yearlyBarData}
          height={300}
        />

        {/* Sales Distribution Histogram */}
        <BarDistributionChart
          title="Distribution of Monthly Sales"
          subtitle="Frequency histogram of monthly revenue totals partitioned into volume brackets"
          data={distributionData}
          height={300}
        />
      </div>
    </div>
  );
};
