import React, { useState } from 'react';
import { ResidualPoint } from '../../types';

interface QQDiagnosticChartProps {
  title: string;
  subtitle: string;
  points: ResidualPoint[];
  height?: number;
}

export const QQDiagnosticChart: React.FC<QQDiagnosticChartProps> = ({
  title,
  subtitle,
  points,
  height = 300,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 55 };
  const viewBoxWidth = 500;
  const viewBoxHeight = height;
  const innerWidth = viewBoxWidth - margin.left - margin.right;
  const innerHeight = viewBoxHeight - margin.top - margin.bottom;

  // Domain for quantiles: typical standard normal quantiles span roughly -3 to +3
  const minVal = -3.2;
  const maxVal = 3.2;

  const getX = (val: number) => {
    return margin.left + ((val - minVal) / (maxVal - minVal)) * innerWidth;
  };

  const getY = (val: number) => {
    return margin.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // 45-degree reference diagonal line (y = x)
  const lineP1 = { x: getX(-3.0), y: getY(-3.0) };
  const lineP2 = { x: getX(3.0), y: getY(3.0) };

  const activePoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">{title}</h4>
          <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#DC2626]">
            <span className="h-0.5 w-4 bg-[#DC2626]" />
            <span>Normal Reference (45°)</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#2563EB]">
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
            <span>Sample Quantiles</span>
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Axis gridlines */}
          {[-2.0, -1.0, 0, 1.0, 2.0].map((v) => (
            <g key={v}>
              {/* Vertical gridline */}
              <line
                x1={getX(v)}
                y1={margin.top}
                x2={getX(v)}
                y2={margin.top + innerHeight}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Horizontal gridline */}
              <line
                x1={margin.left}
                y1={getY(v)}
                x2={margin.left + innerWidth}
                y2={getY(v)}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* X tick text */}
              <text
                x={getX(v)}
                y={margin.top + innerHeight + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {v.toFixed(0)}
              </text>
              {/* Y tick text */}
              <text
                x={margin.left - 8}
                y={getY(v) + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Theoretical 45-degree normal line */}
          <line
            x1={lineP1.x}
            y1={lineP1.y}
            x2={lineP2.x}
            y2={lineP2.y}
            stroke="#DC2626"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Scatter dots */}
          {points.map((pt, i) => {
            if (pt.theoreticalQuantile === undefined) return null;
            const cx = getX(pt.theoreticalQuantile);
            const cy = getY(pt.standardizedResidual);
            const isHovered = hoverIdx === i;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isHovered ? 5.5 : 3.5}
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                onMouseEnter={() => setHoverIdx(i)}
                className="cursor-pointer transition-all"
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={margin.left + innerWidth / 2}
            y={margin.top + innerHeight + 32}
            textAnchor="middle"
            className="text-[10px] font-sans fill-[#64748B]"
          >
            Theoretical Quantiles (Standard Normal)
          </text>
          <text
            x={-(margin.top + innerHeight / 2)}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[10px] font-sans fill-[#64748B]"
          >
            Sample Residual Quantiles
          </text>
        </svg>

        {/* Floating Tooltip */}
        {activePoint && hoverIdx !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[#CBD5E1] bg-white/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md"
            style={{
              left: `${Math.min(
                75,
                Math.max(20, (getX(activePoint.theoreticalQuantile!) / viewBoxWidth) * 100)
              )}%`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-sans font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1">
              Residual #{activePoint.index} ({activePoint.dateStr})
            </p>
            <div className="space-y-1 text-[#475569]">
              <div className="flex justify-between gap-3">
                <span className="text-[#64748B] font-sans">Sample Quantile:</span>
                <span className="font-bold text-[#2563EB]">{activePoint.standardizedResidual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#64748B] font-sans">Theoretical Q:</span>
                <span className="text-[#0F172A] font-medium">{activePoint.theoreticalQuantile?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-3 text-[#64748B] text-[11px] pt-1 border-t border-[#E2E8F0]">
                <span>Raw Residual:</span>
                <span className="text-[#0F172A] font-medium">${activePoint.residual.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
