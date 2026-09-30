import React, { useMemo, useRef, useState } from 'react';
import { Camera, Download, Maximize2, RotateCcw } from 'lucide-react';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

export interface ChartDataPoint {
  label: string; // e.g. "Jan 2016"
  subLabel?: string;
  actual?: number | null;
  movingAvg?: number | null;
  testActual?: number | null;
  forecast?: number | null;
  lowerCI?: number | null;
  upperCI?: number | null;
  isSplitPoint?: boolean;
}

interface InteractiveChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  height?: number;
  splitLabel?: string;
  showMovingAverage?: boolean;
  showConfidenceInterval?: boolean;
  currencySymbol?: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  subtitle,
  data,
  height = 360,
  splitLabel = 'Train / Test Split',
  showMovingAverage = true,
  showConfidenceInterval = true,
  currencySymbol = '$',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [rangePreset, setRangePreset] = useState<'all' | '24m' | '12m'>('all');
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeSeries, setActiveSeries] = useState({
    actual: true,
    movingAvg: true,
    testActual: true,
    forecast: true,
    ci: true,
  });

  // Filter data according to preset range
  const displayData = useMemo(() => {
    if (rangePreset === '12m') {
      return data.slice(-12);
    }
    if (rangePreset === '24m') {
      return data.slice(-24);
    }
    return data;
  }, [data, rangePreset]);

  // Calculate scales and coordinate mappings
  const margin = { top: 24, right: 30, bottom: 40, left: 65 };
  const viewBoxWidth = 860;
  const viewBoxHeight = height;

  const innerWidth = viewBoxWidth - margin.left - margin.right;
  const innerHeight = viewBoxHeight - margin.top - margin.bottom;

  const { minVal, maxVal, splitIndex } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let splitIdx = -1;

    displayData.forEach((d, idx) => {
      if (d.isSplitPoint) splitIdx = idx;
      [d.actual, d.movingAvg, d.testActual, d.forecast, d.lowerCI, d.upperCI].forEach((v) => {
        if (v !== undefined && v !== null && !isNaN(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      });
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;

    // Buffer
    const span = max - min || 1;
    min = Math.max(0, min - span * 0.08);
    max = max + span * 0.08;

    return { minVal: min, maxVal: max, splitIndex: splitIdx };
  }, [displayData]);

  const getX = (index: number) => {
    if (displayData.length <= 1) return margin.left;
    return margin.left + (index / (displayData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return margin.top + innerHeight / 2;
    return margin.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // Generate paths
  const generateLinePath = (getter: (d: ChartDataPoint) => number | null | undefined) => {
    const segments: string[] = [];
    let isDrawing = false;

    displayData.forEach((d, i) => {
      const v = getter(d);
      if (v !== null && v !== undefined && !isNaN(v)) {
        const x = getX(i);
        const y = getY(v);
        if (!isDrawing) {
          segments.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
          isDrawing = true;
        } else {
          segments.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
        }
      } else {
        isDrawing = false;
      }
    });

    return segments.join(' ');
  };

  // Area under historical actual line
  const generateAreaPath = () => {
    const points: { x: number; y: number }[] = [];
    displayData.forEach((d, i) => {
      if (d.actual !== null && d.actual !== undefined) {
        points.push({ x: getX(i), y: getY(d.actual) });
      }
    });
    if (points.length < 2) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = margin.top + innerHeight;
    const lineCommands = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return `${lineCommands} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`;
  };

  // Confidence interval polygon
  const generateCiPath = () => {
    const upperPoints: { x: number; y: number }[] = [];
    const lowerPoints: { x: number; y: number }[] = [];

    displayData.forEach((d, i) => {
      if (d.lowerCI !== null && d.lowerCI !== undefined && d.upperCI !== null && d.upperCI !== undefined) {
        upperPoints.push({ x: getX(i), y: getY(d.upperCI) });
        lowerPoints.push({ x: getX(i), y: getY(d.lowerCI) });
      }
    });

    if (upperPoints.length < 2) return '';

    const upperStr = upperPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const lowerStr = lowerPoints.reverse().map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return `${upperStr} ${lowerStr} Z`;
  };

  // Export SVG Snapshot
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_visualization.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Y-axis grid ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks: { val: number; y: number; label: string }[] = [];
    for (let i = 0; i <= count; i++) {
      const val = minVal + (i / count) * (maxVal - minVal);
      ticks.push({
        val,
        y: getY(val),
        label: formatCompactCurrency(val, currencySymbol),
      });
    }
    return ticks;
  }, [minVal, maxVal, currencySymbol, innerHeight, margin.top]);

  // X-axis label stride to prevent overlapping
  const xLabels = useMemo(() => {
    const stride = Math.ceil(displayData.length / 8);
    return displayData
      .map((d, i) => ({ index: i, x: getX(i), label: d.label }))
      .filter((_, i) => i % stride === 0 || i === displayData.length - 1);
  }, [displayData]);

  const activePoint = hoverIndex !== null ? displayData[hoverIndex] : null;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-sm space-y-3">
      {/* Header with Title and Range Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>

        {/* Range zoom buttons & Snapshot Download */}
        <div className="flex items-center gap-2">
          {data.length > 20 && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-mono">
              <button
                onClick={() => setRangePreset('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  rangePreset === 'all' ? 'bg-[#2563EB] text-white font-semibold shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRangePreset('24m')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  rangePreset === '24m' ? 'bg-[#2563EB] text-white font-semibold shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                24M
              </button>
              <button
                onClick={() => setRangePreset('12m')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  rangePreset === '12m' ? 'bg-[#2563EB] text-white font-semibold shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                12M
              </button>
            </div>
          )}

          <button
            onClick={handleExportSvg}
            title="Download SVG Vector Snapshot"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-xs shadow-xs"
          >
            <Camera className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline text-[11px]">Snapshot</span>
          </button>
        </div>
      </div>

      {/* Legend buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs border-b border-[#F1F5F9] pb-3">
        <button
          onClick={() => setActiveSeries((s) => ({ ...s, actual: !s.actual }))}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
            activeSeries.actual
              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8] font-medium'
              : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          <span>Actual Sales</span>
        </button>

        {showMovingAverage && (
          <button
            onClick={() => setActiveSeries((s) => ({ ...s, movingAvg: !s.movingAvg }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              activeSeries.movingAvg
                ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1] font-medium'
                : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
            <span>3M Moving Avg</span>
          </button>
        )}

        {displayData.some((d) => d.testActual !== undefined && d.testActual !== null) && (
          <button
            onClick={() => setActiveSeries((s) => ({ ...s, testActual: !s.testActual }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              activeSeries.testActual
                ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#334155] font-medium'
                : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#475569]" />
            <span>Holdout Test</span>
          </button>
        )}

        {displayData.some((d) => d.forecast !== undefined && d.forecast !== null) && (
          <button
            onClick={() => setActiveSeries((s) => ({ ...s, forecast: !s.forecast }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              activeSeries.forecast
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C] font-medium'
                : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
            <span>ARIMA Forecast</span>
          </button>
        )}

        {showConfidenceInterval && displayData.some((d) => d.lowerCI !== undefined && d.lowerCI !== null) && (
          <button
            onClick={() => setActiveSeries((s) => ({ ...s, ci: !s.ci }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              activeSeries.ci
                ? 'bg-[#FEF2F2]/60 border-[#FECACA] text-[#B91C1C] font-medium'
                : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
            }`}
          >
            <span className="h-2 w-3 rounded bg-[#DC2626]/20 border border-[#DC2626]/40" />
            <span>95% CI</span>
          </button>
        )}
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const svgX = (clientX / rect.width) * viewBoxWidth;
            if (svgX >= margin.left && svgX <= margin.left + innerWidth) {
              const relRatio = (svgX - margin.left) / innerWidth;
              const idx = Math.min(displayData.length - 1, Math.max(0, Math.round(relRatio * (displayData.length - 1))));
              setHoverIndex(idx);
            }
          }}
        >
          <defs>
            {/* Gradient for Historical Sales Area */}
            <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for Forecast CI Band */}
            <linearGradient id="forecastCiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={margin.left}
                y1={t.y}
                x2={margin.left + innerWidth}
                y2={t.y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={t.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-500"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Split Marker (Train / Test or Historical / Forecast Start) */}
          {splitIndex >= 0 && (
            <g>
              <line
                x1={getX(splitIndex)}
                y1={margin.top}
                x2={getX(splitIndex)}
                y2={margin.top + innerHeight}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x={getX(splitIndex) - 45}
                y={margin.top + 2}
                width={90}
                height={18}
                rx={4}
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <text
                x={getX(splitIndex)}
                y={margin.top + 14}
                textAnchor="middle"
                className="text-[9px] font-mono font-semibold fill-slate-700"
              >
                {splitLabel}
              </text>
            </g>
          )}

          {/* Confidence Band Polygon */}
          {showConfidenceInterval && activeSeries.ci && (
            <path d={generateCiPath()} fill="url(#forecastCiGrad)" />
          )}

          {/* Historical Actuals Area Fill */}
          {activeSeries.actual && (
            <path d={generateAreaPath()} fill="url(#actualSalesGrad)" />
          )}

          {/* Historical Actuals Line */}
          {activeSeries.actual && (
            <path
              d={generateLinePath((d) => d.actual)}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 3M Moving Average Line */}
          {showMovingAverage && activeSeries.movingAvg && (
            <path
              d={generateLinePath((d) => d.movingAvg)}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* Holdout Test Actuals Line & Points */}
          {activeSeries.testActual && (
            <path
              d={generateLinePath((d) => d.testActual)}
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Forecast Line */}
          {activeSeries.forecast && (
            <path
              d={generateLinePath((d) => d.forecast)}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {displayData.map((d, i) => {
            const x = getX(i);
            return (
              <g key={i}>
                {activeSeries.actual && d.actual !== null && d.actual !== undefined && (
                  <circle
                    cx={x}
                    cy={getY(d.actual)}
                    r={hoverIndex === i ? 5 : 2.5}
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                )}
                {activeSeries.testActual && d.testActual !== null && d.testActual !== undefined && (
                  <circle
                    cx={x}
                    cy={getY(d.testActual)}
                    r={hoverIndex === i ? 5 : 3.5}
                    fill="#475569"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
                {activeSeries.forecast && d.forecast !== null && d.forecast !== undefined && (
                  <circle
                    cx={x}
                    cy={getY(d.forecast)}
                    r={hoverIndex === i ? 5 : 3.5}
                    fill="#DC2626"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Hover Crosshair Line */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={margin.top + innerHeight}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* X-axis Ticks & Labels */}
          {xLabels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={margin.top + innerHeight + 20}
              textAnchor="middle"
              className="text-[10px] font-mono fill-[#64748B]"
            >
              {lbl.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[#CBD5E1] bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs font-mono"
            style={{
              left: `${Math.min(75, Math.max(10, (getX(hoverIndex) / viewBoxWidth) * 100))}%`,
              top: '12px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-sans font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1.5 flex items-center justify-between gap-4">
              <span>{activePoint.label}</span>
              {activePoint.subLabel && <span className="text-[10px] text-[#64748B]">{activePoint.subLabel}</span>}
            </p>

            <div className="space-y-1">
              {activePoint.actual !== undefined && activePoint.actual !== null && (
                <div className="flex items-center justify-between gap-3 text-[#2563EB]">
                  <span className="font-sans text-[#64748B]">Actual:</span>
                  <span className="font-bold">{formatCurrency(activePoint.actual, currencySymbol)}</span>
                </div>
              )}
              {activePoint.movingAvg !== undefined && activePoint.movingAvg !== null && (
                <div className="flex items-center justify-between gap-3 text-[#0284C7]">
                  <span className="font-sans text-[#64748B]">3M MA:</span>
                  <span>{formatCurrency(activePoint.movingAvg, currencySymbol)}</span>
                </div>
              )}
              {activePoint.testActual !== undefined && activePoint.testActual !== null && (
                <div className="flex items-center justify-between gap-3 text-[#475569]">
                  <span className="font-sans text-[#64748B]">Holdout Actual:</span>
                  <span className="font-bold">{formatCurrency(activePoint.testActual, currencySymbol)}</span>
                </div>
              )}
              {activePoint.forecast !== undefined && activePoint.forecast !== null && (
                <div className="flex items-center justify-between gap-3 text-[#DC2626]">
                  <span className="font-sans text-[#64748B]">Forecast:</span>
                  <span className="font-bold">{formatCurrency(activePoint.forecast, currencySymbol)}</span>
                </div>
              )}
              {activePoint.lowerCI !== undefined && activePoint.lowerCI !== null && (
                <div className="flex items-center justify-between gap-3 text-[#64748B] text-[11px] pt-1 border-t border-[#E2E8F0]">
                  <span>95% CI Range:</span>
                  <span className="text-[#0F172A] font-medium">
                    [{formatCurrency(activePoint.lowerCI, currencySymbol)} – {formatCurrency(activePoint.upperCI!, currencySymbol)}]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
