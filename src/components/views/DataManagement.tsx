import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { generateSampleCsvContent } from '../../data/defaultDataset';
import { formatCurrency, formatNumber } from '../../utils/timeSeriesEngine';

interface DataManagementProps {
  project: ProcessedSalesProject;
  onFileUpload: (content: string, fileName: string) => void;
  onResetToSample: () => void;
  isProcessing: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  project,
  onFileUpload,
  onResetToSample,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'monthly' | 'cleaned' | 'quality'>('monthly');

  const { quality, monthlyData, dailyData } = project;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csv = generateSampleCsvContent();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sales Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Upload Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Data Management & Validation</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dataset ingestion, automated format inspection, cleaning routines, and quality scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Download Sample CSV</span>
          </button>
          <button
            onClick={onResetToSample}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-xs font-medium text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Reset Default Data</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragActive
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:bg-[#F8FAFC]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] mb-3">
          <Upload className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#0F172A]">Upload New Sales CSV Dataset</h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
          Drag and drop your file here, or click to browse. Expects <code className="text-[#1D4ED8] font-mono bg-[#EFF6FF] px-1 py-0.5 rounded">Order Date</code> and <code className="text-[#1D4ED8] font-mono bg-[#EFF6FF] px-1 py-0.5 rounded">Sales</code> columns.
        </p>
      </div>

      {/* Overall Data Quality Score Card & Metric Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Quality Gauge */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
              <span className="font-semibold uppercase tracking-wider">Data Quality Score</span>
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-[#0F172A] tabular-nums">
                {quality.totalScore}%
              </span>
              <span className="text-xs text-[#16A34A] font-semibold">High Fidelity</span>
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Dynamic validation computed across schema, date parsing, numeric checks, deduplication, and outlier bounds.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex justify-between font-mono">
            <span>Raw Records: {quality.rowsBeforeCleaning}</span>
            <span>Cleaned: {quality.rowsAfterCleaning}</span>
          </div>
        </div>

        {/* Breakdown Card: Dates & Sales Validity */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Schema & Types</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#475569] mb-1">
                <span>Date Validity:</span>
                <span className="font-mono text-[#16A34A] font-semibold">{quality.breakdown.dateValidity}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${quality.breakdown.dateValidity}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#475569] mb-1">
                <span>Sales Numerical Validity:</span>
                <span className="font-mono text-[#2563EB] font-semibold">{quality.breakdown.salesValidity}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${quality.breakdown.salesValidity}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9] space-y-1">
            <div className="flex justify-between">
              <span>Invalid dates removed:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{quality.invalidDates}</span>
            </div>
            <div className="flex justify-between">
              <span>Invalid sales removed:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{quality.invalidSales}</span>
            </div>
          </div>
        </div>

        {/* Breakdown Card: Duplicates & Missing Values */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Completeness & Hygiene</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#475569] mb-1">
                <span>Missing Values Index:</span>
                <span className="font-mono text-[#16A34A] font-semibold">{quality.breakdown.missingValues}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${quality.breakdown.missingValues}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#475569] mb-1">
                <span>Deduplication Score:</span>
                <span className="font-mono text-[#0284C7] font-semibold">{quality.breakdown.duplicates}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full bg-[#0284C7] rounded-full" style={{ width: `${quality.breakdown.duplicates}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9] space-y-1">
            <div className="flex justify-between">
              <span>Duplicates purged:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{quality.duplicateRows}</span>
            </div>
            <div className="flex justify-between">
              <span>Negative records:</span>
              <span className="font-mono text-[#0F172A] font-semibold">{quality.negativeSalesCount}</span>
            </div>
          </div>
        </div>

        {/* Breakdown Card: Outlier Detection (IQR) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Outlier Detection (IQR)</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#475569] mb-1">
                <span>Outlier Cleanliness:</span>
                <span className="font-mono text-[#7C3AED] font-semibold">{quality.breakdown.outliers}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${quality.breakdown.outliers}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Q1 (25%):</span>
              <span className="text-[#0F172A] font-semibold">${quality.outlierThresholds.q1.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Q3 (75%):</span>
              <span className="text-[#0F172A] font-semibold">${quality.outlierThresholds.q3.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Outlier Months:</span>
              <span className={quality.outlierMonthsCount > 0 ? 'text-[#D97706] font-semibold' : 'text-[#16A34A] font-semibold'}>
                {quality.outlierMonthsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Inspection Tabs & Tables */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Processed Dataset Inspector</h3>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'monthly' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Monthly Series ({monthlyData.length} rows)
            </button>
            <button
              onClick={() => setActiveTab('cleaned')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'cleaned' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Daily Aggregation ({dailyData.length} rows)
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {activeTab === 'monthly' ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Label</th>
                  <th className="py-2.5 px-3 text-right">Sales Volume</th>
                  <th className="py-2.5 px-3 text-right">MoM Growth</th>
                  <th className="py-2.5 px-3 text-right">3M Rolling Mean</th>
                  <th className="py-2.5 px-3 text-right">Lag-1</th>
                  <th className="py-2.5 px-3 text-right">Lag-2</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {monthlyData.slice(0, 14).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#0F172A]">{row.monthStr}</td>
                    <td className="py-2 px-3 text-[#64748B] font-sans">{row.monthLabel}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#2563EB]">
                      {formatCurrency(row.sales)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right ${
                        row.momGrowthPct === null
                          ? 'text-[#94A3B8]'
                          : row.momGrowthPct >= 0
                          ? 'text-[#16A34A]'
                          : 'text-[#DC2626]'
                      }`}
                    >
                      {row.momGrowthPct !== null ? `${row.momGrowthPct >= 0 ? '+' : ''}${row.momGrowthPct}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-[#475569]">
                      {row.rollingMean3M !== null ? formatCurrency(row.rollingMean3M) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-[#64748B]">
                      {row.lag1 !== null ? formatCurrency(row.lag1) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-[#64748B]">
                      {row.lag2 !== null ? formatCurrency(row.lag2) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.isOutlier ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-sans font-medium">
                          Outlier
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#64748B] font-sans">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Daily Sales Total</th>
                  <th className="py-2.5 px-3">Quality Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {dailyData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#0F172A]">{row.dateStr}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#2563EB]">
                      {formatCurrency(row.sales)}
                    </td>
                    <td className="py-2 px-3 text-[#16A34A] flex items-center gap-1.5 font-sans font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Valid numeric observation</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
