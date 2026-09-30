import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Search,
  Table,
} from 'lucide-react';
import { FutureForecastRecord, ProcessedSalesProject } from '../../types';
import { formatCurrency } from '../../utils/timeSeriesEngine';

interface ForecastTableViewProps {
  project: ProcessedSalesProject;
}

export const ForecastTableView: React.FC<ForecastTableViewProps> = ({ project }) => {
  const { futureForecast, selectedModelOrder } = project;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'month' | 'forecast' | 'lower' | 'upper'>('month');
  const [sortAsc, setSortAsc] = useState(true);
  const [copied, setCopied] = useState(false);

  // Filter and sort
  const filteredRecords = useMemo(() => {
    let list = [...futureForecast.records];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) => r.monthLabel.toLowerCase().includes(q) || r.monthStr.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'month') diff = a.monthStr.localeCompare(b.monthStr);
      else if (sortField === 'forecast') diff = a.forecastSales - b.forecastSales;
      else if (sortField === 'lower') diff = a.lower95CI - b.lower95CI;
      else if (sortField === 'upper') diff = a.upper95CI - b.upper95CI;
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [futureForecast.records, searchTerm, sortField, sortAsc]);

  const handleSort = (field: 'month' | 'forecast' | 'lower' | 'upper') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const copyToClipboard = () => {
    const header = 'Month,Month_Label,Forecast_Sales,Lower_95_CI,Upper_95_CI';
    const rows = futureForecast.records.map(
      (r) => `${r.monthStr},${r.monthLabel},${r.forecastSales},${r.lower95CI},${r.upper95CI}`
    );
    const content = [header, ...rows].join('\n');

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadCsv = () => {
    const header = 'Month,Forecast_Sales,Lower_95_CI,Upper_95_CI';
    const rows = futureForecast.records.map(
      (r) => `${r.monthStr},${r.forecastSales},${r.lower95CI},${r.upper95CI}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ARIMA_12_Month_Forecast.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">12-Month Forecast Data Table</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Granular monthly predictions, lower and upper 95% confidence intervals, and interval width analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5 text-[#64748B]" />}
            <span>{copied ? 'Copied CSV' : 'Copy CSV'}</span>
          </button>
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by month or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#CBD5E1] bg-white py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div className="text-xs text-[#64748B] font-mono">
          Showing {filteredRecords.length} of {futureForecast.records.length} forecast months
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('month')}
                    className="flex items-center gap-1 hover:text-[#0F172A]"
                  >
                    <span>Forecast Month</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Calendar Period</th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('forecast')}
                    className="flex items-center gap-1 ml-auto hover:text-[#0F172A]"
                  >
                    <span>Forecast Sales</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('lower')}
                    className="flex items-center gap-1 ml-auto hover:text-[#0F172A]"
                  >
                    <span>Lower 95% Bound</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('upper')}
                    className="flex items-center gap-1 ml-auto hover:text-[#0F172A]"
                  >
                    <span>Upper 95% Bound</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Interval Width</th>
                <th className="py-3 px-4 text-center">Uncertainty Spread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {filteredRecords.map((r, idx) => {
                const intervalWidth = r.upper95CI - r.lower95CI;
                const spreadPct = (intervalWidth / r.forecastSales) * 100;

                return (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0F172A]">{r.monthStr}</td>
                    <td className="py-3 px-4 font-sans text-[#64748B]">{r.monthLabel}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#2563EB] text-sm">
                      {formatCurrency(r.forecastSales)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#64748B]">
                      {formatCurrency(r.lower95CI)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#64748B]">
                      {formatCurrency(r.upper95CI)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#475569]">
                      {formatCurrency(intervalWidth)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                        ±{(spreadPct / 2).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
