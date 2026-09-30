import React from 'react';
import { Calendar, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { GlobalFilterState } from '../../types';

interface GlobalFilterBarProps {
  years: number[];
  filterState: GlobalFilterState;
  onFilterChange: (filters: Partial<GlobalFilterState>) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  years,
  filterState,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  const isFiltered = filterState.year !== 'all' || filterState.quarter !== 'all';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 sm:px-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
          <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Filters:</span>
        </div>

        {/* Year Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => onFilterChange({ year: 'all' })}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterState.year === 'all'
                ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            All Years
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => onFilterChange({ year: String(y) })}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filterState.year === String(y)
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Quarter Filter Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          {['all', '1', '2', '3', '4'].map((q) => (
            <button
              key={q}
              onClick={() => onFilterChange({ quarter: q })}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filterState.quarter === q
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {q === 'all' ? 'All Qtrs' : `Q${q}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-[#64748B]">
          Showing <span className="font-mono font-bold text-[#0F172A]">{filteredCount}</span> of{' '}
          <span className="font-mono text-[#64748B]">{totalCount}</span> months
        </span>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors shadow-xs"
          >
            <RotateCcw className="h-3 w-3 text-[#64748B]" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
