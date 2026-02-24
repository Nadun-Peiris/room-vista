"use client";

import { useMemo, useState } from "react";

type FurnitureLibraryItem = {
  id: string;
  name: string;
  category: string;
  widthInches: number;
  depthInches: number;
  heightFeet: number;
  defaultColor: string;
  thumbnailUrl?: string;
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
  selectedFurnitureName?: string | null;
  selectedFurnitureColor?: string | null;
  selectedFurnitureShade?: number | null;
  onSelectedFurnitureColorChange: (color: string) => void;
  onSelectedFurnitureShadeChange: (shade: number) => void;
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
  selectedFurnitureName,
  selectedFurnitureColor,
  selectedFurnitureShade,
  onSelectedFurnitureColorChange,
  onSelectedFurnitureShadeChange,
}: SidebarProps) {
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);
  const [activePanel, setActivePanel] = useState<"main" | "furniture">("main");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const furnitureCardImages: Record<string, string> = {
    "sofa-3-seater":
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    "queen-bed":
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    "coffee-table":
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=600&q=80",
  };

  const groupedFurniture = useMemo(() => {
    return furnitureLibrary.reduce<Record<string, FurnitureLibraryItem[]>>((acc, item) => {
      const category = item.category?.trim() || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [furnitureLibrary]);

  const categoryList = useMemo(
    () => Object.keys(groupedFurniture).sort((a, b) => a.localeCompare(b)),
    [groupedFurniture]
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? true),
    }));
  };

  const projectNameInputId = "project-name-input";
  const roomWidthInputId = "room-width-feet";
  const roomLengthInputId = "room-length-feet";
  const wallHeightInputId = "wall-height-feet";
  const selectedFurnitureColorTextId = "selected-furniture-color-text";
  const selectedFurnitureShadeId = "selected-furniture-shade";
  const roomShapeSelectId = "room-shape-select";
  const wallColorTextId = "wall-color-text";
  const floorColorTextId = "floor-color-text";
  const roomShadingId = "room-shading-intensity";

  return (
    <div className="relative z-10 w-80 bg-white/70 backdrop-blur-md border-r border-white/50 p-6 md:p-8 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen">
      {activePanel === "main" ? (
        <>
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
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  aria-label="Edit project name"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5zM14 6l4 4" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor={projectNameInputId} className="sr-only">
                  Project name
                </label>
                <input
                  id={projectNameInputId}
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
              <label htmlFor={roomWidthInputId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Width</label>
              <div className="relative">
                <input
                  id={roomWidthInputId}
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
              <label htmlFor={roomLengthInputId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Length</label>
              <div className="relative">
                <input
                  id={roomLengthInputId}
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
            <label htmlFor={wallHeightInputId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Wall Height</label>
            <div className="relative">
              <input
                id={wallHeightInputId}
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

        <div className="p-5 bg-white/60 border border-white/80 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Selected Furniture
          </h3>

          {!selectedFurnitureName ? (
            <p className="text-xs font-semibold text-gray-500">
              Select a furniture item on the canvas to customize its color.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-extrabold text-gray-900 truncate">
                {selectedFurnitureName}
              </p>
              <div className="flex flex-col gap-1">
                <label htmlFor={selectedFurnitureColorTextId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">
                  Color
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                  <input
                    type="color"
                    aria-label="Selected furniture color picker"
                    value={selectedFurnitureColor || "#64748b"}
                    onChange={(e) => onSelectedFurnitureColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[6px] shadow-sm flex-shrink-0"
                  />
                  <input
                    id={selectedFurnitureColorTextId}
                    type="text"
                    value={selectedFurnitureColor || "#64748b"}
                    onChange={(e) => onSelectedFurnitureColorChange(e.target.value)}
                    placeholder="#64748B"
                    maxLength={7}
                    className="w-full bg-transparent border-none text-gray-900 text-sm font-semibold focus:outline-none uppercase"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={selectedFurnitureShadeId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">
                  Shading
                </label>
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <input
                    id={selectedFurnitureShadeId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={typeof selectedFurnitureShade === "number" ? selectedFurnitureShade : 0.5}
                    onChange={(e) => onSelectedFurnitureShadeChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    {(typeof selectedFurnitureShade === "number" ? selectedFurnitureShade : 0.5).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <label htmlFor={roomShapeSelectId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Shape</label>
              <div className="relative">
                <select
                  id={roomShapeSelectId}
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
              <label htmlFor={wallColorTextId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Wall Color</label>
              <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <input
                  type="color"
                  aria-label="Wall color picker"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[6px] shadow-sm flex-shrink-0"
                />
                <input
                  id={wallColorTextId}
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
              <label htmlFor={floorColorTextId} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Floor Color</label>
              <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <input
                  type="color"
                  aria-label="Floor color picker"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[6px] shadow-sm flex-shrink-0"
                />
                <input
                  id={floorColorTextId}
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
              <label htmlFor={roomShadingId} className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                Shading Intensity
              </label>

              <input
                id={roomShadingId}
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

          <div className="flex-1 overflow-y-auto pr-2 pb-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {categoryList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/60 border border-white/80 text-sm font-semibold text-gray-500">
                No furniture items available.
              </div>
            ) : (
              categoryList.map((category) => {
                const isOpen = expandedCategories[category] ?? true;
                const items = groupedFurniture[category];

                return (
                  <div key={category} className="bg-white/70 border border-white/80 rounded-2xl shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/70 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`category-${category}`}
                    >
                      <span className="text-sm font-extrabold text-gray-900 capitalize">
                        {category} ({items.length})
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div id={`category-${category}`} className="px-3 pb-3 space-y-2">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => addFurnitureToRoom(item)}
                            className="w-full text-left p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                          >
                            <div
                              className="w-full h-24 rounded-lg mb-2 bg-cover bg-center shadow-sm"
                              style={{
                                backgroundImage: `url(${item.thumbnailUrl || furnitureCardImages[item.id] || "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=600&q=80"})`,
                              }}
                              aria-hidden="true"
                            />
                            <p className="text-sm font-extrabold text-gray-900">{item.name}</p>
                            <p className="text-xs font-semibold text-gray-500 capitalize">
                              {item.widthInches}&quot; × {item.depthInches}&quot;
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </>
      )}
    </div>
  );
}
