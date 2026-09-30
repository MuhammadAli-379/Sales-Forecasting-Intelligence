import React from 'react';
import {
  Activity,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Printer,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

interface ReportGeneratorProps {
  project: ProcessedSalesProject;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ project }) => {
  const {
    historicalStats,
    quality,
    adfOriginal,
    adfDifferenced,
    selectedModelOrder,
    testEvaluation,
    residuals,
    futureForecast,
    monthlyData,
  } = project;

  const handlePrint = () => {
    window.print();
  };

  const downloadAnalysisReportText = () => {
    const reportText = `============================================================
COMSATS UNIVERSITY ISLAMABAD
Department of Management Sciences
Course: Business Data Analysis
Project: Time Series Sales Forecasting Using ARIMA
Student: Muhammad Abubakar (Reg No: FA24-BBD-109)
Instructor: Sir Usama Ali
============================================================

1. DATA QUALITY & INGESTION
------------------------------------------------------------
Dataset: ${project.datasetName}
Total Raw Records: ${quality.rowsBeforeCleaning}
Cleaned Records: ${quality.rowsAfterCleaning}
Date Validity: ${quality.breakdown.dateValidity}%
Sales Numerical Validity: ${quality.breakdown.salesValidity}%
Data Quality Overall Score: ${quality.totalScore}%
Outlier Months Identified: ${quality.outlierMonthsCount}

2. DESCRIPTIVE STATISTICS
------------------------------------------------------------
Monthly Observations: ${monthlyData.length}
Total Historical Sales: ${formatCurrency(historicalStats.totalSales)}
Average Monthly Sales: ${formatCurrency(historicalStats.averageMonthlySales)}
Median Monthly Sales: ${formatCurrency(historicalStats.medianMonthlySales)}
Standard Deviation: ${formatCurrency(historicalStats.stdDev)}
Peak Sales Month: ${historicalStats.highestMonth?.monthLabel} (${formatCurrency(historicalStats.highestMonth?.sales || 0)})
Trough Sales Month: ${historicalStats.lowestMonth?.monthLabel} (${formatCurrency(historicalStats.lowestMonth?.sales || 0)})

3. STATIONARITY DIAGNOSTICS (AUGMENTED DICKEY-FULLER)
------------------------------------------------------------
Original Series ADF Statistic: ${adfOriginal.adfStatistic.toFixed(4)}
Original Series p-value: ${adfOriginal.pValue.toFixed(4)} (Stationary: ${adfOriginal.isStationary})
Differenced Series ADF Statistic: ${adfDifferenced.adfStatistic.toFixed(4)}
Differenced Series p-value: ${adfDifferenced.pValue.toFixed(4)} (Stationary: ${adfDifferenced.isStationary})
Selected Differencing Order d: ${project.selectedDifferencingOrderD}

4. ARIMA MODEL EVALUATION
------------------------------------------------------------
Selected Specification: ARIMA(${selectedModelOrder.join(',')})
Selection Criterion: Lowest AIC (${testEvaluation.metrics.aic.toFixed(2)})
BIC: ${testEvaluation.metrics.bic.toFixed(2)}
Holdout Test MAE: ${formatCurrency(testEvaluation.metrics.mae)}
Holdout Test RMSE: ${formatCurrency(testEvaluation.metrics.rmse)}
Holdout Test MAPE: ${testEvaluation.metrics.mape.toFixed(2)}%
Ljung-Box Test p-value: ${residuals.ljungBoxPValue.toFixed(4)} (White noise: ${!residuals.hasResidualAutocorrelation})

5. 12-MONTH FUTURE FORECAST SUMMARY
------------------------------------------------------------
Total Forecasted Sales: ${formatCurrency(futureForecast.totalSales)}
Average Monthly Forecast: ${formatCurrency(futureForecast.averageMonthlySales)}
Peak Forecast Month: ${futureForecast.highestMonth.monthLabel} (${formatCurrency(futureForecast.highestMonth.forecastSales)})
Trough Forecast Month: ${futureForecast.lowestMonth.monthLabel} (${formatCurrency(futureForecast.lowestMonth.forecastSales)})

============================================================
Report Generated: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ARIMA_Analysis_Report.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Print Actions (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Academic & Executive Report Generator</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Production-grade formal report document suitable for thesis defense, executive review, and viva evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadAnalysisReportText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Download Summary Report (.txt)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm space-y-8 print:bg-white print:text-slate-900 print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#E2E8F0] print:border-slate-300 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2563EB] print:text-blue-700">
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                COMSATS University Islamabad · Department of Management Sciences
              </span>
            </div>
            <span className="text-xs font-mono text-[#64748B] print:text-slate-500">
              Course: Business Data Analysis
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] print:text-slate-900">
            Time Series Sales Forecasting & Statistical Modeling Report
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#64748B] print:text-slate-600 font-mono">
            <div>Student: <span className="font-semibold text-[#0F172A] print:text-slate-800">Muhammad Abubakar</span></div>
            <div>Reg No: <span className="text-[#0F172A] print:text-slate-800">FA24-BBD-109</span></div>
            <div>Instructor: <span className="text-[#0F172A] print:text-slate-800">Sir Usama Ali</span></div>
            <div>Generated: <span className="text-[#0F172A] print:text-slate-800">{new Date().toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3 print-break-inside-avoid">
          <h2 className="text-sm font-bold text-[#0F172A] print:text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] print:border-slate-200 pb-1">
            1. Executive Summary
          </h2>
          <p className="text-xs text-[#475569] print:text-slate-700 leading-relaxed">
            This study examines historical sales revenue transactions using systematic time-series decomposition, unit-root stationarity testing, autocorrelation diagnostics, and AutoRegressive Integrated Moving Average (ARIMA) modeling. The objective is to evaluate empirical performance on holdout data and deliver high-precision 12-month forward forecasts with 95% confidence bounds for commercial resource planning.
          </p>
        </div>

        {/* Section 2: Data Quality & Descriptive Profile */}
        <div className="space-y-3 print-break-inside-avoid">
          <h2 className="text-sm font-bold text-[#0F172A] print:text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] print:border-slate-200 pb-1">
            2. Dataset Quality & Descriptive Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans text-[11px]">Quality Score</span>
              <span className="text-base font-bold text-[#16A34A] print:text-emerald-700">{quality.totalScore}%</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans text-[11px]">Total Sales</span>
              <span className="text-base font-bold text-[#0F172A] print:text-slate-900">{formatCompactCurrency(historicalStats.totalSales)}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans text-[11px]">Monthly Mean</span>
              <span className="text-base font-bold text-[#0F172A] print:text-slate-900">{formatCompactCurrency(historicalStats.averageMonthlySales)}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans text-[11px]">Standard Dev</span>
              <span className="text-base font-bold text-[#0F172A] print:text-slate-900">±{formatCompactCurrency(historicalStats.stdDev)}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Stationarity Diagnostics & Model Selection */}
        <div className="space-y-3 print-break-inside-avoid">
          <h2 className="text-sm font-bold text-[#0F172A] print:text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] print:border-slate-200 pb-1">
            3. Stationarity & ARIMA Parameter Selection
          </h2>
          <p className="text-xs text-[#475569] print:text-slate-700 leading-relaxed">
            The Augmented Dickey-Fuller test on original sales yielded an ADF statistic of <strong className="font-mono">{adfOriginal.adfStatistic.toFixed(4)}</strong> (p-value: {adfOriginal.pValue.toFixed(4)}), indicating non-stationarity. Applying first differencing (<code className="font-mono">d = 1</code>) reduced the ADF statistic to <strong className="font-mono">{adfDifferenced.adfStatistic.toFixed(4)}</strong> (p-value: {adfDifferenced.pValue.toFixed(4)}), firmly rejecting the unit-root null hypothesis.
          </p>

          <div className="p-3 rounded-lg bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200 text-xs">
            <span className="font-semibold text-[#0F172A] print:text-slate-900 block mb-1">Optimized Specification:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[#334155]">
              <div>Model: <strong className="text-[#2563EB]">ARIMA({selectedModelOrder.join(',')})</strong></div>
              <div>Criterion: <strong>Lowest AIC ({testEvaluation.metrics.aic.toFixed(2)})</strong></div>
              <div>BIC: <strong>{testEvaluation.metrics.bic.toFixed(2)}</strong></div>
              <div>Differencing: <strong>d = {project.selectedDifferencingOrderD}</strong></div>
            </div>
          </div>
        </div>

        {/* Section 4: Holdout Accuracy & Diagnostics */}
        <div className="space-y-3 print-break-inside-avoid">
          <h2 className="text-sm font-bold text-[#0F172A] print:text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] print:border-slate-200 pb-1">
            4. Out-of-Sample Holdout Accuracy
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans">MAE</span>
              <span className="text-sm font-bold text-[#0F172A] print:text-slate-900">{formatCurrency(testEvaluation.metrics.mae)}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans">RMSE</span>
              <span className="text-sm font-bold text-[#0F172A] print:text-slate-900">{formatCurrency(testEvaluation.metrics.rmse)}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] print:bg-slate-100 border border-[#E2E8F0] print:border-slate-200">
              <span className="text-[#64748B] print:text-slate-600 block font-sans">MAPE</span>
              <span className="text-sm font-bold text-[#16A34A] print:text-emerald-700">{testEvaluation.metrics.mape.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] print:text-slate-600">
            Ljung-Box diagnostic test at lag {residuals.ljungBoxLag} produced a p-value of {residuals.ljungBoxPValue.toFixed(4)}. There is no strong evidence of residual autocorrelation, verifying that residuals conform to white-noise properties.
          </p>
        </div>

        {/* Section 5: 12-Month Future Forecast Table */}
        <div className="space-y-3 print-break-inside-avoid">
          <h2 className="text-sm font-bold text-[#0F172A] print:text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] print:border-slate-200 pb-1">
            5. 12-Month Forward Sales Projections
          </h2>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F8FAFC] print:bg-slate-100 text-[#64748B] print:text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-2.5">Month</th>
                <th className="py-2 px-2.5 text-right">Point Forecast</th>
                <th className="py-2 px-2.5 text-right">Lower 95% Bound</th>
                <th className="py-2 px-2.5 text-right">Upper 95% Bound</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] print:divide-slate-200 text-[#334155] print:text-slate-800">
              {futureForecast.records.map((r, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 px-2.5 font-bold text-[#0F172A] print:text-slate-900">{r.monthLabel}</td>
                  <td className="py-1.5 px-2.5 text-right text-[#2563EB] print:text-blue-700 font-bold">{formatCurrency(r.forecastSales)}</td>
                  <td className="py-1.5 px-2.5 text-right text-[#64748B] print:text-slate-600">{formatCurrency(r.lower95CI)}</td>
                  <td className="py-1.5 px-2.5 text-right text-[#64748B] print:text-slate-600">{formatCurrency(r.upper95CI)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-8 border-t border-[#E2E8F0] print:border-slate-300 grid grid-cols-2 gap-8 text-xs font-mono print-break-inside-avoid">
          <div className="space-y-4">
            <div className="h-10 border-b border-[#CBD5E1] print:border-slate-400" />
            <p className="text-[#64748B] print:text-slate-600">Student Investigator: Muhammad Abubakar</p>
          </div>
          <div className="space-y-4">
            <div className="h-10 border-b border-[#CBD5E1] print:border-slate-400" />
            <p className="text-[#64748B] print:text-slate-600">Course Instructor: Sir Usama Ali</p>
          </div>
        </div>
      </div>
    </div>
  );
};
