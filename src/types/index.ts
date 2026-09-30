export interface RawDataRecord {
  'Order Date': string;
  Sales: number | string;
  [key: string]: any;
}

export interface CleanedRecord {
  date: Date;
  dateStr: string;
  sales: number;
  originalRowIndex: number;
}

export interface DailySalesRecord {
  dateStr: string;
  sales: number;
}

export interface MonthlySalesRecord {
  monthStr: string; // "YYYY-MM"
  monthLabel: string; // "Jan 2017"
  year: number;
  monthNumber: number;
  monthName: string;
  quarter: number;
  quarterName: string;
  sales: number;
  momGrowthPct: number | null;
  rollingMean3M: number | null;
  rollingStd3M: number | null;
  rollingMin3M: number | null;
  rollingMax3M: number | null;
  lag1: number | null;
  lag2: number | null;
  lag3: number | null;
  isOutlier?: boolean;
}

export interface QuarterlySalesRecord {
  quarterStr: string; // "2017-Q1"
  quarterLabel: string; // "Q1 2017"
  year: number;
  quarter: number;
  sales: number;
}

export interface YearlySalesRecord {
  year: number;
  sales: number;
  growthPct?: number | null;
}

export interface DataQualityReport {
  rowsBeforeCleaning: number;
  rowsAfterCleaning: number;
  removedInvalidRows: number;
  duplicateRows: number;
  invalidDates: number;
  invalidSales: number;
  negativeSalesCount: number;
  missingValuesCount: number;
  totalScore: number; // 0 to 100
  breakdown: {
    dateValidity: number; // %
    salesValidity: number; // %
    missingValues: number; // %
    duplicates: number; // %
    outliers: number; // %
  };
  outlierMonthsCount: number;
  outlierThresholds: {
    q1: number;
    q3: number;
    iqr: number;
    lowerBound: number;
    upperBound: number;
  };
}

export interface ADFResult {
  title: string;
  adfStatistic: number;
  pValue: number;
  usedLag: number;
  observations: number;
  criticalValues: {
    '1%': number;
    '5%': number;
    '10%': number;
  };
  isStationary: boolean;
  differencingOrderD: number;
  interpretation: string;
}

export interface ACFPACFItem {
  lag: number;
  acf: number;
  pacf: number;
  confBound: number;
  isAcfSignificant: boolean;
  isPacfSignificant: boolean;
}

export interface ARIMAModelCandidate {
  p: number;
  d: number;
  q: number;
  orderStr: string;
  aic: number;
  bic: number;
  mae?: number;
  rmse?: number;
  mape?: number;
  isSelected?: boolean;
}

export interface AlternativeModel {
  name: string;
  type: string;
  parameters: string;
  mae: number;
  rmse: number;
  mape: number;
  aic?: number;
  bic?: number;
  description: string;
}

export interface ModelEvaluationMetrics {
  modelOrder: [number, number, number];
  orderStr: string;
  mae: number;
  rmse: number;
  mape: number;
  aic: number;
  bic: number;
  ljungBoxPValue: number;
  trainingObservations: number;
  testingObservations: number;
  forecastHorizon: number;
}

export interface TestForecastRecord {
  monthStr: string;
  monthLabel: string;
  actualSales: number;
  forecastSales: number;
  lowerCI: number;
  upperCI: number;
  absoluteError: number;
  percentageError: number;
}

export interface FutureForecastRecord {
  monthStr: string;
  monthLabel: string;
  forecastSales: number;
  lower95CI: number;
  upper95CI: number;
}

export interface ResidualPoint {
  index: number;
  dateStr: string;
  actual: number;
  fitted: number;
  residual: number;
  standardizedResidual: number;
  theoreticalQuantile?: number;
}

export interface ResidualDiagnostics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  ljungBoxLag: number;
  ljungBoxStatistic: number;
  ljungBoxPValue: number;
  hasResidualAutocorrelation: boolean;
  summaryText: string;
  points: ResidualPoint[];
  histogram: { binStart: number; binEnd: number; count: number; normalDensity: number }[];
  residualAcf: { lag: number; acf: number; confBound: number }[];
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface BusinessInsight {
  id: string;
  title: string;
  category: 'trend' | 'performance' | 'seasonality' | 'model' | 'risk';
  value: string;
  description: string;
  significance: 'positive' | 'warning' | 'neutral' | 'info';
}

export interface ProcessedSalesProject {
  datasetName: string;
  uploadedAt: string;
  currencySymbol: string;
  quality: DataQualityReport;
  monthlyData: MonthlySalesRecord[];
  filteredMonthlyData: MonthlySalesRecord[];
  dailyData: DailySalesRecord[];
  quarterlyData: QuarterlySalesRecord[];
  yearlyData: YearlySalesRecord[];
  finalPreparedRows: any[];
  correlationMatrix: CorrelationMatrix;
  adfOriginal: ADFResult;
  adfDifferenced: ADFResult;
  selectedDifferencingOrderD: number;
  acfPacfData: ACFPACFItem[];
  candidateModels: ARIMAModelCandidate[];
  selectedModelOrder: [number, number, number];
  alternativeModels: AlternativeModel[];
  trainData: MonthlySalesRecord[];
  testData: MonthlySalesRecord[];
  testEvaluation: {
    metrics: ModelEvaluationMetrics;
    records: TestForecastRecord[];
  };
  residuals: ResidualDiagnostics;
  futureForecast: {
    horizonMonths: number;
    records: FutureForecastRecord[];
    totalSales: number;
    averageMonthlySales: number;
    highestMonth: FutureForecastRecord;
    lowestMonth: FutureForecastRecord;
  };
  insights: BusinessInsight[];
  historicalStats: {
    totalSales: number;
    averageMonthlySales: number;
    medianMonthlySales: number;
    maxMonthlySales: number;
    minMonthlySales: number;
    stdDev: number;
    highestMonth: MonthlySalesRecord | null;
    lowestMonth: MonthlySalesRecord | null;
    averageGrowthPct: number;
    annualizedGrowthPct: number;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'data-management'
  | 'historical'
  | 'time-series'
  | 'stationarity'
  | 'acf-pacf'
  | 'arima-models'
  | 'model-performance'
  | 'residual-diagnostics'
  | 'future-forecast'
  | 'forecast-table'
  | 'business-insights'
  | 'report-generator'
  | 'export-center';

export interface GlobalFilterState {
  year: string; // 'all' or specific year '2016', etc.
  quarter: string; // 'all' or 'Q1', 'Q2', 'Q3', 'Q4'
  startDate: string;
  endDate: string;
}
