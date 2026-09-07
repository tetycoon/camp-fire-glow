import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface NotificationItem {
  name: string;
  location: string;
  course: string;
  timeAgo: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  { name: "Suresh Kumar", location: "Chennai", course: "AI Masterclass", timeAgo: "2 mins ago" },
  { name: "Priya Ravichandran", location: "Madurai", course: "Claude Masterclass", timeAgo: "5 mins ago" },
  { name: "Karthik Raja", location: "Coimbatore", course: "TECH TYCOON Academy", timeAgo: "8 mins ago" },
  { name: "Ananya Sharma", location: "Bengaluru", course: "AI Masterclass", timeAgo: "12 mins ago" },
  { name: "Venkatesh Prasad", location: "Trichy", course: "Upscale Level-2 Workshop", timeAgo: "15 mins ago" },
  { name: "Meena Sundaram", location: "Salem", course: "Claude Masterclass", timeAgo: "18 mins ago" },
  { name: "Arun Prakash", location: "Chennai", course: "TECH TYCOON Academy", timeAgo: "22 mins ago" }
];

export default function SocialProofToast() {
  return (
    <div className="w-full bg-[#070b14] border-b border-emerald-500/30 text-white overflow-hidden py-2 text-xs relative z-50 shadow-md">
      {/* CSS Animation Keyframes for Smooth Right-to-Left Continuous Ticker */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-bar {
          display: flex;
          width: max-content;
          animation: ticker-scroll 32s linear infinite;
        }
        .animate-ticker-bar:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center gap-2 px-3.5 font-semibold text-emerald-400 shrink-0 absolute left-0 top-0 bottom-0 bg-[#070b14] z-20 border-r border-white/10 shadow-lg">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="uppercase tracking-widest font-black text-[11px] whitespace-nowrap text-emerald-400">
          LIVE REGISTRATIONS
        </span>
      </div>

      <div className="animate-ticker-bar pl-44">
        {/* Duplicate list to create seamless infinite right-to-left scrolling loop */}
        {[...NOTIFICATIONS, ...NOTIFICATIONS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 mx-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-bold text-white text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {item.name}
            </span>
            <span className="text-white/50 text-[11px]">from {item.location}</span>
            <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
              {item.course}
            </span>
            <span className="text-amber-400 font-mono text-[11px] font-semibold">{item.timeAgo}</span>
            <span className="text-white/20 ml-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
