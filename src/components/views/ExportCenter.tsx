import React from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  LineChart,
  Sliders,
  Table,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';

interface ExportCenterProps {
  project: ProcessedSalesProject;
}

interface ExportItem {
  id: string;
  title: string;
  filename: string;
  description: string;
  rowCount: number;
  icon: React.ComponentType<{ className?: string }>;
  getData: () => string;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ project }) => {
  const {
    dailyData,
    monthlyData,
    finalPreparedRows,
    candidateModels,
    testEvaluation,
    futureForecast,
    quality,
    historicalStats,
  } = project;

  // Helpers to generate CSV strings
  const getCleanedCsv = () => {
    const header = 'Order Date,Sales';
    const rows = dailyData.map((d) => `${d.dateStr},${d.sales}`);
    return [header, ...rows].join('\n');
  };

  const getDailySalesCsv = () => {
    const header = 'Date,Daily_Sales';
    const rows = dailyData.map((d) => `${d.dateStr},${d.sales}`);
    return [header, ...rows].join('\n');
  };

  const getMonthlySalesCsv = () => {
    const header = 'Month,Month_Label,Sales,MoM_Growth_Pct,Rolling_Mean_3M,Rolling_Std_3M,Lag_1,Lag_2,Lag_3';
    const rows = monthlyData.map(
      (m) =>
        `${m.monthStr},${m.monthLabel},${m.sales},${m.momGrowthPct ?? ''},${m.rollingMean3M ?? ''},${
          m.rollingStd3M ?? ''
        },${m.lag1 ?? ''},${m.lag2 ?? ''},${m.lag3 ?? ''}`
    );
    return [header, ...rows].join('\n');
  };

  const getFinalPreparedCsv = () => {
    if (finalPreparedRows.length === 0) return '';
    const headers = Object.keys(finalPreparedRows[0]).join(',');
    const rows = finalPreparedRows.map((r) => Object.values(r).join(','));
    return [headers, ...rows].join('\n');
  };

  const getModelComparisonCsv = () => {
    const header = 'Model,p,d,q,AIC,BIC';
    const rows = candidateModels.map((c) => `${c.orderStr},${c.p},${c.d},${c.q},${c.aic},${c.bic}`);
    return [header, ...rows].join('\n');
  };

  const getModelMetricsCsv = () => {
    const header = 'Metric,Value';
    const rows = [
      `Selected_Model,${testEvaluation.metrics.orderStr}`,
      `MAE,${testEvaluation.metrics.mae}`,
      `RMSE,${testEvaluation.metrics.rmse}`,
      `MAPE_Pct,${testEvaluation.metrics.mape}`,
      `AIC,${testEvaluation.metrics.aic}`,
      `BIC,${testEvaluation.metrics.bic}`,
      `Ljung_Box_p_value,${testEvaluation.metrics.ljungBoxPValue}`,
      `Training_Observations,${testEvaluation.metrics.trainingObservations}`,
      `Testing_Observations,${testEvaluation.metrics.testingObservations}`,
      `Forecast_Horizon,12`,
    ];
    return [header, ...rows].join('\n');
  };

  const getTestForecastCsv = () => {
    const header = 'Month,Actual_Sales,Forecast_Sales,Lower_95_CI,Upper_95_CI,Absolute_Error,Percentage_Error';
    const rows = testEvaluation.records.map(
      (r) =>
        `${r.monthStr},${r.actualSales},${r.forecastSales},${r.lowerCI},${r.upperCI},${r.absoluteError},${r.percentageError}`
    );
    return [header, ...rows].join('\n');
  };

  const getFutureForecastCsv = () => {
    const header = 'Month,Forecast_Sales,Lower_95_CI,Upper_95_CI';
    const rows = futureForecast.records.map((r) => `${r.monthStr},${r.forecastSales},${r.lower95CI},${r.upper95CI}`);
    return [header, ...rows].join('\n');
  };

  const getProjectSummaryCsv = () => {
    const header = 'Metric,Value';
    const rows = [
      `Original_Records,${quality.rowsBeforeCleaning}`,
      `Cleaned_Records,${quality.rowsAfterCleaning}`,
      `Invalid_Dates,${quality.invalidDates}`,
      `Invalid_Sales,${quality.invalidSales}`,
      `Duplicate_Rows,${quality.duplicateRows}`,
      `Daily_Observations,${dailyData.length}`,
      `Monthly_Observations,${monthlyData.length}`,
      `Total_Historical_Sales,${historicalStats.totalSales}`,
      `Average_Monthly_Sales,${historicalStats.averageMonthlySales}`,
      `Standard_Deviation,${historicalStats.stdDev}`,
      `Outlier_Months,${quality.outlierMonthsCount}`,
      `Selected_ARIMA_Model,ARIMA(${project.selectedModelOrder.join(',')})`,
      `Test_MAPE_Pct,${testEvaluation.metrics.mape}`,
      `12_Month_Total_Forecast,${futureForecast.totalSales}`,
    ];
    return [header, ...rows].join('\n');
  };

  const downloadFile = (item: ExportItem) => {
    const content = item.getData();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportItems: ExportItem[] = [
    {
      id: 'monthly-sales',
      title: 'Monthly Sales Dataset',
      filename: 'Monthly_Sales.csv',
      description: 'Monthly aggregated sales series with rolling mean, std dev, and lag features.',
      rowCount: monthlyData.length,
      icon: Table,
      getData: getMonthlySalesCsv,
    },
    {
      id: 'final-dataset',
      title: 'Final Forecasting Dataset',
      filename: 'Final_Prepared_Sales_Dataset.csv',
      description: 'Complete ML/time-series feature matrix with clean lag variables and zero NaNs.',
      rowCount: finalPreparedRows.length,
      icon: Database,
      getData: getFinalPreparedCsv,
    },
    {
      id: 'daily-sales',
      title: 'Daily Aggregated Sales',
      filename: 'Daily_Sales.csv',
      description: 'Day-level sales totals sorted chronologically after deduplication and cleaning.',
      rowCount: dailyData.length,
      icon: FileSpreadsheet,
      getData: getDailySalesCsv,
    },
    {
      id: 'arima-comparison',
      title: 'ARIMA Model Comparison',
      filename: 'ARIMA_Model_Comparison.csv',
      description: 'All 16 candidate ARIMA(p,d,q) specifications ranked by AIC and BIC.',
      rowCount: candidateModels.length,
      icon: Sliders,
      getData: getModelComparisonCsv,
    },
    {
      id: 'arima-metrics',
      title: 'Model Evaluation Metrics',
      filename: 'ARIMA_Model_Metrics.csv',
      description: 'Official test evaluation parameters including MAE, RMSE, MAPE, AIC, and BIC.',
      rowCount: 10,
      icon: Activity,
      getData: getModelMetricsCsv,
    },
    {
      id: 'test-forecast',
      title: 'Holdout Test Forecast Log',
      filename: 'ARIMA_Test_Forecast.csv',
      description: 'Out-of-sample actual vs forecast figures, confidence intervals, and percentage error.',
      rowCount: testEvaluation.records.length,
      icon: LineChart,
      getData: getTestForecastCsv,
    },
    {
      id: 'future-forecast',
      title: '12-Month Future Forecast',
      filename: 'ARIMA_12_Month_Forecast.csv',
      description: 'Forward monthly point estimates and 95% upper/lower confidence bounds.',
      rowCount: futureForecast.records.length,
      icon: LineChart,
      getData: getFutureForecastCsv,
    },
    {
      id: 'project-summary',
      title: 'Project Summary Report',
      filename: 'Project_Summary.csv',
      description: 'High-level synthesis of university coursework metrics and validation checks.',
      rowCount: 14,
      icon: FileText,
      getData: getProjectSummaryCsv,
    },
    {
      id: 'cleaned-sales',
      title: 'Cleaned Transaction Sales',
      filename: 'Cleaned_Sales.csv',
      description: 'Purged raw transaction records with validated datetime format and positive numbers.',
      rowCount: quality.rowsAfterCleaning,
      icon: Layers,
      getData: getCleanedCsv,
    },
  ];

  const downloadAll = () => {
    exportItems.forEach((item, index) => {
      setTimeout(() => {
        downloadFile(item);
      }, index * 200);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Export & Deliverables Center</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Download processed datasets, candidate comparisons, test evaluation logs, and forward projections in CSV format
          </p>
        </div>

        <button
          onClick={downloadAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download All Datasets (Batch)</span>
        </button>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exportItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4 hover:border-[#CBD5E1] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] leading-tight">{item.title}</h3>
                      <span className="text-[11px] font-mono text-[#2563EB] block mt-0.5 font-medium">
                        {item.filename}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs font-mono text-[#64748B]">
                  {item.rowCount} rows
                </span>

                <button
                  onClick={() => downloadFile(item)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors shadow-xs"
                >
                  <Download className="h-3 w-3 text-[#64748B]" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
