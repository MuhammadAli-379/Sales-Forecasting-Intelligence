import React, { useState } from 'react';
import { formatNumber } from '../../utils/timeSeriesEngine';

interface AcfPacfChartProps {
  title: string;
  subtitle: string;
  type: 'ACF' | 'PACF';
  data: {
    lag: number;
    value: number;
    confBound: number;
    isSignificant: boolean;
  }[];
  height?: number;
}

export const AcfPacfChart: React.FC<AcfPacfChartProps> = ({
  title,
  subtitle,
  type,
  data,
  height = 280,
}) => {
  const [hoverLag, setHoverLag] = useState<number | null>(null);

  const margin = { top: 20, right: 30, bottom: 35, left: 55 };
  const viewBoxWidth = 650;
  const viewBoxHeight = height;
  const innerWidth = viewBoxWidth - margin.left - margin.right;
  const innerHeight = viewBoxHeight - margin.top - margin.bottom;

  // Correlation scale from -1.0 to 1.0 (or -0.6 to 1.0)
  const minY = -1.0;
  const maxY = 1.0;

  const getY = (val: number) => {
    return margin.top + innerHeight - ((val - minY) / (maxY - minY)) * innerHeight;
  };

  const zeroY = getY(0);
  const confBound = data[0]?.confBound || 0.28;
  const upperCiY = getY(confBound);
  const lowerCiY = getY(-confBound);

  const slotWidth = innerWidth / data.length;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">{title}</h4>
          <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#2563EB]">
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
            <span>{type} Value</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#64748B]">
            <span className="h-0.5 w-3 bg-[#3B82F6]" />
            <span>±{confBound.toFixed(3)} 95% CI</span>
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverLag(null)}
        >
          <defs>
            {/* Shaded confidence interval band */}
            <linearGradient id="ciZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Shaded 95% confidence interval ribbon */}
          <rect
            x={margin.left}
            y={upperCiY}
            width={innerWidth}
            height={lowerCiY - upperCiY}
            fill="url(#ciZoneGrad)"
          />

          {/* Upper & Lower Confidence Bounds (Dashed blue) */}
          <line
            x1={margin.left}
            y1={upperCiY}
            x2={margin.left + innerWidth}
            y2={upperCiY}
            stroke="#3B82F6"
            strokeDasharray="4 3"
            strokeWidth="1.2"
          />
          <line
            x1={margin.left}
            y1={lowerCiY}
            x2={margin.left + innerWidth}
            y2={lowerCiY}
            stroke="#3B82F6"
            strokeDasharray="4 3"
            strokeWidth="1.2"
          />

          {/* Zero baseline */}
          <line
            x1={margin.left}
            y1={zeroY}
            x2={margin.left + innerWidth}
            y2={zeroY}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Y-axis ticks */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((val) => (
            <g key={val}>
              <line
                x1={margin.left}
                y1={getY(val)}
                x2={margin.left + innerWidth}
                y2={getY(val)}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <text
                x={margin.left - 10}
                y={getY(val) + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Lollipop stems and dots */}
          {data.map((d, i) => {
            const x = margin.left + i * slotWidth + slotWidth / 2;
            const y = getY(d.value);
            const isHovered = hoverLag === d.lag;
            const isSig = d.isSignificant;

            return (
              <g
                key={d.lag}
                onMouseEnter={() => setHoverLag(d.lag)}
                className="cursor-pointer"
              >
                {/* Stem */}
                <line
                  x1={x}
                  y1={zeroY}
                  x2={x}
                  y2={y}
                  stroke={isSig ? '#2563EB' : '#94A3B8'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : isSig ? 4.5 : 3.5}
                  fill={isSig ? '#2563EB' : '#94A3B8'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {/* X axis tick */}
                <text
                  x={x}
                  y={margin.top + innerHeight + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isHovered ? 'fill-[#2563EB] font-bold' : 'fill-[#64748B]'
                  }`}
                >
                  {d.lag}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverLag !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[#CBD5E1] bg-white/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md"
            style={{
              left: `${Math.min(
                80,
                Math.max(
                  15,
                  ((margin.left + (hoverLag - 1) * slotWidth + slotWidth / 2) / viewBoxWidth) * 100
                )
              )}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-sans font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1">
              Lag {hoverLag}
            </p>
            {(() => {
              const item = data.find((d) => d.lag === hoverLag);
              if (!item) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[#475569]">
                    <span className="font-sans text-[#64748B]">{type} Value:</span>
                    <span className="font-bold text-[#2563EB]">{item.value.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[#64748B] text-[11px]">
                    <span>95% Critical Bound:</span>
                    <span className="font-medium text-[#0F172A]">±{item.confBound.toFixed(4)}</span>
                  </div>
                  <div className="pt-1 text-[11px] font-sans">
                    {item.isSignificant ? (
                      <span className="text-[#16A34A] font-semibold">
                        ✓ Statistically significant (exceeds CI)
                      </span>
                    ) : (
                      <span className="text-[#64748B]">Within white-noise confidence bound</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
