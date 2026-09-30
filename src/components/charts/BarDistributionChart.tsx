import React, { useState } from 'react';
import { formatCompactCurrency, formatCurrency, formatNumber } from '../../utils/timeSeriesEngine';

export interface BarDataPoint {
  label: string;
  value: number;
  secondaryValue?: number; // e.g. normal density overlay
  color?: string;
  tooltipText?: string;
}

interface BarDistributionChartProps {
  title: string;
  subtitle?: string;
  data: BarDataPoint[];
  height?: number;
  isPercentage?: boolean;
  currencySymbol?: string;
  showZeroLine?: boolean;
  hasNormalDensityOverlay?: boolean;
}

export const BarDistributionChart: React.FC<BarDistributionChartProps> = ({
  title,
  subtitle,
  data,
  height = 320,
  isPercentage = false,
  currencySymbol = '$',
  showZeroLine = false,
  hasNormalDensityOverlay = false,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const margin = { top: 20, right: 25, bottom: 40, left: 60 };
  const viewBoxWidth = 800;
  const viewBoxHeight = height;
  const innerWidth = viewBoxWidth - margin.left - margin.right;
  const innerHeight = viewBoxHeight - margin.top - margin.bottom;

  let minVal = Math.min(0, ...data.map((d) => d.value));
  let maxVal = Math.max(0, ...data.map((d) => d.value));

  if (hasNormalDensityOverlay) {
    const maxSec = Math.max(...data.map((d) => d.secondaryValue || 0));
    maxVal = Math.max(maxVal, maxSec);
  }

  const span = maxVal - minVal || 1;
  minVal = minVal < 0 ? minVal - span * 0.05 : 0;
  maxVal = maxVal + span * 0.08;

  const getY = (val: number) => {
    return margin.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  const zeroY = getY(0);
  const barWidth = Math.max(8, (innerWidth / data.length) * 0.68);
  const slotWidth = innerWidth / data.length;

  // Normal curve line path if overlay enabled
  let normalCurvePath = '';
  if (hasNormalDensityOverlay) {
    const points = data
      .filter((d) => d.secondaryValue !== undefined)
      .map((d, i) => {
        const x = margin.left + i * slotWidth + slotWidth / 2;
        const y = getY(d.secondaryValue!);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      });
    normalCurvePath = points.join(' ');
  }

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
    const val = minVal + ratio * (maxVal - minVal);
    return {
      val,
      y: getY(val),
      label: isPercentage
        ? `${val.toFixed(1)}%`
        : hasNormalDensityOverlay
        ? formatNumber(val, 1)
        : formatCompactCurrency(val, currencySymbol),
    };
  });

  // Stride for X-axis labels
  const stride = Math.ceil(data.length / 10);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>

        {hasNormalDensityOverlay && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#2563EB]">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#2563EB]" />
              <span>Residual Count</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#DC2626]">
              <span className="h-0.5 w-4 bg-[#DC2626]" />
              <span>Normal PDF</span>
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Grid lines */}
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
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Zero baseline */}
          {showZeroLine && minVal < 0 && (
            <line
              x1={margin.left}
              y1={zeroY}
              x2={margin.left + innerWidth}
              y2={zeroY}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          )}

          {/* Bars */}
          {data.map((d, i) => {
            const x = margin.left + i * slotWidth + (slotWidth - barWidth) / 2;
            const y = d.value >= 0 ? getY(d.value) : zeroY;
            const h = Math.abs(getY(d.value) - zeroY);
            const isHovered = hoverIdx === i;

            // Default color logic
            let fill = d.color || '#2563EB';
            if (!d.color) {
              if (isPercentage) {
                fill = d.value >= 0 ? '#16A34A' : '#DC2626';
              }
            }

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                className="cursor-pointer transition-opacity"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, h)}
                  rx={2}
                  fill={fill}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Normal density overlay line */}
          {hasNormalDensityOverlay && normalCurvePath && (
            <path
              d={normalCurvePath}
              fill="none"
              stroke="#DC2626"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % stride !== 0 && i !== data.length - 1) return null;
            const x = margin.left + i * slotWidth + slotWidth / 2;
            return (
              <text
                key={i}
                x={x}
                y={margin.top + innerHeight + 18}
                textAnchor="middle"
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIdx !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[#CBD5E1] bg-white/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md"
            style={{
              left: `${Math.min(
                80,
                Math.max(
                  15,
                  ((margin.left + hoverIdx * slotWidth + slotWidth / 2) / viewBoxWidth) * 100
                )
              )}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-sans font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1">
              {data[hoverIdx].label}
            </p>
            <div className="flex items-center justify-between gap-3 text-[#475569]">
              <span className="font-sans text-[#64748B]">Value:</span>
              <span className="font-bold text-[#2563EB]">
                {isPercentage
                  ? `${data[hoverIdx].value >= 0 ? '+' : ''}${data[hoverIdx].value.toFixed(2)}%`
                  : hasNormalDensityOverlay
                  ? `${data[hoverIdx].value} residuals`
                  : formatCurrency(data[hoverIdx].value, currencySymbol)}
              </span>
            </div>
            {data[hoverIdx].secondaryValue !== undefined && (
              <div className="flex items-center justify-between gap-3 text-[#DC2626] text-[11px] pt-1 border-t border-[#E2E8F0]">
                <span className="font-sans text-[#64748B]">Normal Density:</span>
                <span>{data[hoverIdx].secondaryValue?.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
