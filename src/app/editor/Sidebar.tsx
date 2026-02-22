"use client";

import Link from "next/link";

interface SidebarProps {
  roomWidthFeet: number;
  roomHeightFeet: number;
  setRoomWidthFeet: (value: number) => void;
  setRoomHeightFeet: (value: number) => void;
}

export default function Sidebar({
  roomWidthFeet,
  roomHeightFeet,
  setRoomWidthFeet,
  setRoomHeightFeet,
}: SidebarProps) {
  return (
    <div className="relative z-10 w-80 bg-white/70 backdrop-blur-md border-r border-white/50 p-8 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen">

      {/* Logo / Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Room Vista
        </h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4">
        {/* ROOM SIZE CONTROLS */}
        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Canvas Size (Feet)
          </h3>

          <div className="flex gap-3">
            {/* Width Input */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Width</label>
              <div className="relative">
                <input
                  type="number"
                  value={roomWidthFeet}
                  onChange={(e) => setRoomWidthFeet(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-semibold pr-8"
                  placeholder="12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
              </div>
            </div>

            {/* Height Input */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Height</label>
              <div className="relative">
                <input
                  type="number"
                  value={roomHeightFeet}
                  onChange={(e) => setRoomHeightFeet(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-semibold pr-8"
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
              </div>
            </div>
          </div>
        </div>

        {/* FUTURE TOOLS AREA */}
        <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-medium text-sm bg-white/30 text-center">
          + Furniture Library coming soon
        </div>
      </div>

      {/* Back to Dashboard Link */}
      <div className="mt-auto pt-6 border-t border-gray-200/50">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 font-bold p-3.5 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
      </div>

    </div>
  );
}