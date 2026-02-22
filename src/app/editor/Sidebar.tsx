"use client";

import Link from "next/link";

type FurnitureLibraryItem = {
  id: string;
  name: string;
  category: string;
  widthInches: number;
  depthInches: number;
  heightFeet: number;
  defaultColor: string;
};

interface SidebarProps {
  roomWidthFeet: number;
  roomHeightFeet: number;
  setRoomWidthFeet: (value: number) => void;
  setRoomHeightFeet: (value: number) => void;
  roomShape: string;
  setRoomShape: (value: string) => void;
  wallColor: string;
  setWallColor: (value: string) => void;
  floorColor: string;
  setFloorColor: (value: string) => void;
  lightIntensity: number;
  setLightIntensity: (value: number) => void;
  furnitureLibrary: FurnitureLibraryItem[];
  addFurnitureToRoom: (item: FurnitureLibraryItem) => void;
  viewMode: "2d" | "3d";
  setViewMode: (mode: "2d" | "3d") => void;
}

export default function Sidebar({
  roomWidthFeet,
  roomHeightFeet,
  setRoomWidthFeet,
  setRoomHeightFeet,
  roomShape,
  setRoomShape,
  wallColor,
  setWallColor,
  floorColor,
  setFloorColor,
  lightIntensity,
  setLightIntensity,
  furnitureLibrary,
  addFurnitureToRoom,
  viewMode,
  setViewMode,
}: SidebarProps) {
  return (
    <div className="relative z-10 w-80 bg-white/70 backdrop-blur-md border-r border-white/50 p-6 md:p-8 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen">

      {/* Logo / Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Room Vista
        </h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        
        {/* ROOM SIZE CONTROLS */}
        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Canvas Size (Feet)
          </h3>

          <div className="flex gap-3">
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

        {/* ROOM AESTHETICS CONTROLS */}
        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Room Appearance
          </h3>

          <div className="space-y-4">
            {/* Shape Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shape</label>
              <select
                value={roomShape}
                onChange={(e) => setRoomShape(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-semibold text-sm cursor-pointer"
              >
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
              </select>
            </div>

            {/* Wall Color - Hybrid Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wall Color</label>
              <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <input
                  type="color"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[6px] shadow-sm flex-shrink-0"
                />
                <input
                  type="text"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="w-full bg-transparent border-none text-gray-900 text-sm font-semibold focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Floor Color - Hybrid Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Floor Color</label>
              <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <input
                  type="color"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[6px] shadow-sm flex-shrink-0"
                />
                <input
                  type="text"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="w-full bg-transparent border-none text-gray-900 text-sm font-semibold focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Shading Intensity
              </label>

              <input
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full"
              />

              <div className="text-xs text-gray-500 mt-1">
                {lightIntensity.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Furniture Library
            </h3>

            <div className="space-y-2">
              {furnitureLibrary.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addFurnitureToRoom(item)}
                  className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION AREA */}
      <div className="mt-auto pt-6 border-t border-gray-200/50 space-y-3">
        {/* View Mode Toggle */}
        <button
          onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
          className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold p-3.5 rounded-xl transition-all shadow-lg shadow-gray-900/20 active:scale-95"
        >
          {viewMode === "2d" ? (
             <>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
               Enter 3D View
             </>
          ) : (
             <>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
               Back to 2D Blueprint
             </>
          )}
        </button>

        {/* Back to Dashboard Link */}
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
