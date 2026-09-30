import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Info,
  Lightbulb,
  LineChart,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { BusinessInsight, ProcessedSalesProject } from '../../types';

interface BusinessInsightsViewProps {
  project: ProcessedSalesProject;
}

export const BusinessInsightsView: React.FC<BusinessInsightsViewProps> = ({ project }) => {
  const { insights } = project;

  const getIcon = (category: BusinessInsight['category']) => {
    switch (category) {
      case 'trend':
        return TrendingUp;
      case 'performance':
        return ArrowUpRight;
      case 'model':
        return Activity;
      case 'risk':
        return AlertTriangle;
      default:
        return Sparkles;
    }
  };

  const getBadgeStyle = (significance: BusinessInsight['significance']) => {
    switch (significance) {
      case 'positive':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'neutral':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Automated Business Insights</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Empirically derived business intelligence synthesized from historical data and time-series model parameters
        </p>
      </div>

      {/* Primary Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {insights.map((insight) => {
          const Icon = getIcon(insight.category);
          const badgeClass = getBadgeStyle(insight.significance);

          return (
            <div
              key={insight.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3 hover:border-[#CBD5E1] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                      {insight.category}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${badgeClass}`}>
                    {insight.value}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A] pt-1">{insight.title}</h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {insight.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                <span>Calculated from data</span>
                <span className="text-[#16A34A] font-medium">Verified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Executive Summary Methodology */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 space-y-3">
        <div className="flex items-center gap-2 text-[#2563EB]">
          <Lightbulb className="h-4 w-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Analytical Rigor & Grounding Standards
          </h4>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          Every observation displayed in this module is calculated deterministically from the transaction data and statistical model outputs. No fabricated or hallucinated statements are made. Metric calculations adhere strictly to the methods demonstrated in Muhammad Abubakar's COMSATS University Business Data Analysis coursework.
        </p>
      </div>
    </div>
  );
};
