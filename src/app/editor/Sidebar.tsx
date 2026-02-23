"use client";

import { useState } from "react";

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
  roomLengthFeet: number;
  wallHeightFeet: number;
  setRoomWidthFeet: (value: number) => void;
  setRoomLengthFeet: (value: number) => void;
  setWallHeightFeet: (value: number) => void;
  roomShape: string;
  setRoomShape: (value: string) => void;
  wallColor: string;
  setWallColor: (value: string) => void;
  floorColor: string;
  setFloorColor: (value: string) => void;
  lightIntensity: number;
  setLightIntensity: (value: number) => void;
  projectName: string;
  onSaveProjectName: (name: string) => void | Promise<void>;
  renamingProject: boolean;
  furnitureLibrary: FurnitureLibraryItem[];
  addFurnitureToRoom: (item: FurnitureLibraryItem) => void;
  onRequestExit: () => void;
}

export default function Sidebar({
  roomWidthFeet,
  roomLengthFeet,
  wallHeightFeet,
  setRoomWidthFeet,
  setRoomLengthFeet,
  setWallHeightFeet,
  roomShape,
  setRoomShape,
  wallColor,
  setWallColor,
  floorColor,
  setFloorColor,
  lightIntensity,
  setLightIntensity,
  projectName,
  onSaveProjectName,
  renamingProject,
  furnitureLibrary,
  addFurnitureToRoom,
  onRequestExit,
}: SidebarProps) {
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);
  const [activePanel, setActivePanel] = useState<"main" | "furniture">("main");

  const furnitureCardImages: Record<string, string> = {
    "sofa-3-seater":
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    "queen-bed":
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    "coffee-table":
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=600&q=80",
  };

  return (
    <div className="relative z-10 w-80 bg-white/70 backdrop-blur-md border-r border-white/50 p-6 md:p-8 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen">
      {activePanel === "main" ? (
        <>
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

          <div className="group mb-5 p-3 bg-white/70 border border-white/80 rounded-2xl shadow-sm">
            {!editingProjectName ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-gray-900 truncate">
                  {projectName || "Untitled Design"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProjectNameDraft(projectName);
                    setEditingProjectName(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100"
                  aria-label="Edit project name"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5zM14 6l4 4" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={projectNameDraft}
                  onChange={(e) => setProjectNameDraft(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!projectNameDraft.trim()) return;
                      await onSaveProjectName(projectNameDraft);
                      setEditingProjectName(false);
                    }}
                    disabled={renamingProject || !projectNameDraft.trim()}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {renamingProject ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectNameDraft(projectName);
                      setEditingProjectName(false);
                    }}
                    disabled={renamingProject}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        
        {/* ROOM SIZE CONTROLS */}
        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Room Size (Feet)
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
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Length</label>
              <div className="relative">
                <input
                  type="number"
                  value={roomLengthFeet}
                  onChange={(e) => setRoomLengthFeet(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-semibold pr-8"
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wall Height</label>
            <div className="relative">
              <input
                type="number"
                value={wallHeightFeet}
                onChange={(e) => setWallHeightFeet(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-semibold pr-8"
                placeholder="9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
            </div>
          </div>
        </div>

            <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setActivePanel("furniture")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition"
              >
                Add Furniture +
              </button>
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
              <div className="relative">
                <select
                  value={roomShape}
                  onChange={(e) => setRoomShape(e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-semibold text-sm cursor-pointer appearance-none"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="square">Square</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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

          </div>
          {/* BOTTOM ACTION AREA */}
          <div className="mt-auto pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onRequestExit}
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 font-bold p-3.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 p-3 bg-white/70 border border-white/80 rounded-2xl shadow-sm">
            <div className="relative h-8 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setActivePanel("main")}
                className="absolute left-0 flex items-center justify-center h-8 w-8 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 rounded-lg transition shadow-sm active:scale-95"
                aria-label="Back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Furniture</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {furnitureLibrary.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addFurnitureToRoom(item)}
                className="w-full text-left p-3.5 bg-white/70 border border-white/80 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition"
              >
                <div
                  className="w-full h-28 rounded-xl mb-3 bg-cover bg-center shadow-sm"
                  style={{
                    backgroundImage: `url(${furnitureCardImages[item.id] || "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=600&q=80"})`,
                  }}
                  aria-hidden="true"
                />
                <p className="text-sm font-extrabold text-gray-900">{item.name}</p>
                <p className="text-xs font-semibold text-gray-500 capitalize">{item.category}</p>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onRequestExit}
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 font-bold p-3.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
