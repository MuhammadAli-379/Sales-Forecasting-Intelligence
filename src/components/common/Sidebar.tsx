import React from 'react';
import {
  Activity,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GitBranch,
  GraduationCap,
  Layers,
  LineChart,
  PieChart,
  Radio,
  Sliders,
  Sparkles,
  Table,
  TrendingUp,
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  qualityScore: number;
  selectedOrderStr: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  qualityScore,
  selectedOrderStr,
}) => {
  const groups: NavGroup[] = [
    {
      groupName: 'Executive',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'business-insights', label: 'Business Insights', icon: Sparkles, badge: 'Auto' },
      ],
    },
    {
      groupName: 'Data Pipeline',
      items: [
        { id: 'data-management', label: 'Data & Quality', icon: Database, badge: `${qualityScore}%` },
        { id: 'historical', label: 'Historical Sales', icon: BarChart2 },
        { id: 'time-series', label: 'Time Series Lab', icon: Layers },
      ],
    },
    {
      groupName: 'Statistical Labs',
      items: [
        { id: 'stationarity', label: 'Stationarity (ADF)', icon: Radio },
        { id: 'acf-pacf', label: 'ACF / PACF Lab', icon: GitBranch },
        { id: 'arima-models', label: 'ARIMA Model Center', icon: Sliders, badge: selectedOrderStr },
      ],
    },
    {
      groupName: 'Forecasting & Validation',
      items: [
        { id: 'model-performance', label: 'Model Performance', icon: FileCheck },
        { id: 'residual-diagnostics', label: 'Residual Diagnostics', icon: Activity },
        { id: 'future-forecast', label: '12-Month Forecast', icon: LineChart },
        { id: 'forecast-table', label: 'Forecast Table', icon: Table },
      ],
    },
    {
      groupName: 'Outputs',
      items: [
        { id: 'report-generator', label: 'Report Generator', icon: FileText },
        { id: 'export-center', label: 'Export Center', icon: Download },
      ],
    },
  ];

  return (
    <aside
      className={`fixed lg:static top-16 left-0 bottom-0 z-20 flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                {group.groupName}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-semibold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isActive
                            ? 'bg-blue-100 text-[#1E40AF] border-[#93C5FD]'
                            : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* University & Academic Project Footer Card */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-[#2563EB] shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-bold text-[#0F172A] leading-tight">COMSATS University</p>
              <p className="text-[10px] text-[#64748B] leading-tight">Management Sciences</p>
            </div>
          </div>
          <div className="text-[10px] text-[#64748B] space-y-0.5 border-t border-[#E2E8F0] pt-2 font-mono">
            <div className="flex justify-between">
              <span>Student:</span>
              <span className="text-[#0F172A] font-semibold">M. Abubakar</span>
            </div>
            <div className="flex justify-between">
              <span>Reg No:</span>
              <span className="text-[#475569]">FA24-BBD-109</span>
            </div>
            <div className="flex justify-between">
              <span>Instructor:</span>
              <span className="text-[#475569]">Sir Usama Ali</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[#E2E8F0] flex justify-center text-[#2563EB]" title="COMSATS University Islamabad">
          <GraduationCap className="h-4 w-4" />
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <div className="p-2 border-t border-[#E2E8F0] flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg text-xs text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-[11px] font-medium">Collapse View</span>}
        </button>
      </div>
    </aside>
  );
};
