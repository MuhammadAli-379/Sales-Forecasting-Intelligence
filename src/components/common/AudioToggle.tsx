import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        !isMuted
          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8] shadow-xs'
          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
      }`}
      title={isMuted ? 'Enable spatial sound & sonification (M)' : 'Mute spatial audio (M)'}
      aria-label={isMuted ? 'Enable spatial sound' : 'Mute spatial sound'}
    >
      {!isMuted ? (
        <>
          <Volume2 className="h-3.5 w-3.5 text-[#2563EB]" />
          <div className="flex items-end gap-0.5 h-3 w-3 overflow-hidden">
            <motion.span
              animate={{ height: ['30%', '90%', '40%'] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
              className="w-0.5 bg-[#2563EB] rounded-full"
            />
            <motion.span
              animate={{ height: ['70%', '30%', '100%'] }}
              transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
              className="w-0.5 bg-[#2563EB] rounded-full"
            />
            <motion.span
              animate={{ height: ['40%', '100%', '50%'] }}
              transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
              className="w-0.5 bg-[#2563EB] rounded-full"
            />
          </div>
          <span className="hidden xl:inline text-[11px] font-mono">Audio On</span>
        </>
      ) : (
        <>
          <VolumeX className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span className="hidden xl:inline text-[11px] font-mono">Audio Muted</span>
        </>
      )}
    </button>
  );
};
