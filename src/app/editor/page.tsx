"use client";

import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import { Suspense, useState, useRef, useEffect, useMemo, useCallback } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter, useSearchParams } from "next/navigation";

// Import your new Sidebar component (Adjust the path as needed based on your folder structure)
import Sidebar from "./Sidebar"; 
import ThreeDView from "./ThreeDView";

const GRID_SIZE_INCHES = 1;
const MAJOR_GRID_INTERVAL_INCHES = 12;
const PIXELS_PER_INCH = 5;

type FurnitureItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  heightFeet?: number;
  type?: string;
};

type LoadedDesign = {
  _id: string;
  title?: string;
  roomWidthFeet: number;
  roomHeightFeet: number;
  furniture: FurnitureItem[];
  roomShape?: string;
  wallColor?: string;
  floorColor?: string;
  lightIntensity?: number;
};

type FurnitureLibraryItem = {
  id: string;
  name: string;
  category: string;
  widthInches: number;
  depthInches: number;
  heightFeet: number;
  defaultColor: string;
};

const FURNITURE_LIBRARY: FurnitureLibraryItem[] = [
  {
    id: "sofa-3-seater",
    name: "3 Seater Sofa",
    category: "sofa",
    widthInches: 84,
    depthInches: 36,
    heightFeet: 2.5,
    defaultColor: "#059669",
  },
  {
    id: "queen-bed",
    name: "Queen Bed",
    category: "bed",
    widthInches: 60,
    depthInches: 80,
    heightFeet: 2,
    defaultColor: "#3b82f6",
  },
  {
    id: "coffee-table",
    name: "Coffee Table",
    category: "table",
    widthInches: 48,
    depthInches: 24,
    heightFeet: 1.5,
    defaultColor: "#f59e0b",
  },
];

type Point = { x: number; y: number };

const getRotatedCorners = (
  x: number,
  y: number,
  width: number,
  height: number,
  rotationDeg: number
): Point[] => {
  const theta = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const localCorners: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  return localCorners.map((point) => ({
    x: x + point.x * cos - point.y * sin,
    y: y + point.x * sin + point.y * cos,
  }));
};

const projectPolygon = (polygon: Point[], axis: Point) => {
  const axisLength = Math.hypot(axis.x, axis.y);
  if (axisLength === 0) return { min: 0, max: 0 };

  const normalizedAxis = { x: axis.x / axisLength, y: axis.y / axisLength };
  const dots = polygon.map((point) => point.x * normalizedAxis.x + point.y * normalizedAxis.y);

  return { min: Math.min(...dots), max: Math.max(...dots) };
};

const polygonsIntersect = (a: Point[], b: Point[]) => {
  const getAxes = (polygon: Point[]) =>
    polygon.map((point, i) => {
      const next = polygon[(i + 1) % polygon.length];
      const edge = { x: next.x - point.x, y: next.y - point.y };
      return { x: -edge.y, y: edge.x };
    });

  const axes = [...getAxes(a), ...getAxes(b)];

  for (const axis of axes) {
    const projectionA = projectPolygon(a, axis);
    const projectionB = projectPolygon(b, axis);
    if (projectionA.max <= projectionB.min || projectionB.max <= projectionA.min) {
      return false;
    }
  }

  return true;
};

const areFurnitureItemsOverlapping = (
  a: Pick<FurnitureItem, "x" | "y" | "width" | "height" | "rotation">,
  b: Pick<FurnitureItem, "x" | "y" | "width" | "height" | "rotation">
) => {
  const cornersA = getRotatedCorners(a.x, a.y, a.width, a.height, a.rotation);
  const cornersB = getRotatedCorners(b.x, b.y, b.width, b.height, b.rotation);
  return polygonsIntersect(cornersA, cornersB);
};

const getRotatedExtents = (width: number, height: number, rotationDeg: number) => {
  const corners = getRotatedCorners(0, 0, width, height, rotationDeg);
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("designId");
  const initialProjectName = searchParams.get("projectName")?.trim() || "";

  const addFurnitureToRoom = (item: FurnitureLibraryItem) => {
    const widthPx = item.widthInches * PIXELS_PER_INCH;
    const heightPx = item.depthInches * PIXELS_PER_INCH;
    const spacing = 10;
    const step = 20;

    setFurniture((prev) => {
      const maxX = Math.max(0, STAGE_WIDTH - widthPx);
      const maxY = Math.max(0, STAGE_HEIGHT - heightPx);

      const isSpotTaken = (x: number, y: number) =>
        prev.some((f) =>
          areFurnitureItemsOverlapping(
            { x: x - spacing / 2, y: y - spacing / 2, width: widthPx + spacing, height: heightPx + spacing, rotation: 0 },
            {
              x: f.x - spacing / 2,
              y: f.y - spacing / 2,
              width: f.width + spacing,
              height: f.height + spacing,
              rotation: f.rotation,
            }
          )
        );

      let x = 40;
      let y = 40;
      let found = false;

      for (let yy = 0; yy <= maxY && !found; yy += step) {
        for (let xx = 0; xx <= maxX; xx += step) {
          if (!isSpotTaken(xx, yy)) {
            x = xx;
            y = yy;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        x = Math.max(0, Math.min(40 + prev.length * 20, maxX));
        y = Math.max(0, Math.min(40 + prev.length * 20, maxY));
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          x,
          y,
          width: widthPx,
          height: heightPx,
          fill: item.defaultColor,
          rotation: 0,
          heightFeet: item.heightFeet,
          type: item.id,
        },
      ];
    });
  };

  /* ---------------- ROOM SIZE STATE ---------------- */
  const [roomWidthFeet, setRoomWidthFeet] = useState(12);
  const [roomHeightFeet, setRoomHeightFeet] = useState(10);

  const roomWidthInches = roomWidthFeet * 12;
  const roomHeightInches = roomHeightFeet * 12;

  const STAGE_WIDTH = roomWidthInches * PIXELS_PER_INCH;
  const STAGE_HEIGHT = roomHeightInches * PIXELS_PER_INCH;

  const GRID_SIZE = GRID_SIZE_INCHES * PIXELS_PER_INCH;

  const [roomShape, setRoomShape] = useState("rectangle");
  const [wallColor, setWallColor] = useState("#e2e8f0");
  const [floorColor, setFloorColor] = useState("#f3f4f6");

  /* ---------------- FURNITURE STATE ---------------- */
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [lightIntensity, setLightIntensity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(designId);
  const [projectName, setProjectName] = useState(initialProjectName || "Untitled Design");
  const [showNamePopup, setShowNamePopup] = useState(!designId && !initialProjectName);
  const [newProjectNameInput, setNewProjectNameInput] = useState(initialProjectName);
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("Design saved successfully!");
  const [showExitConfirmPopup, setShowExitConfirmPopup] = useState(false);
  const [renamingProject, setRenamingProject] = useState(false);
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const clampRotatedPosition = useCallback((
    x: number,
    y: number,
    width: number,
    height: number,
    rotationDeg: number
  ) => {
    const extents = getRotatedExtents(width, height, rotationDeg);
    const minAllowedX = -extents.minX;
    const maxAllowedX = STAGE_WIDTH - extents.maxX;
    const minAllowedY = -extents.minY;
    const maxAllowedY = STAGE_HEIGHT - extents.maxY;

    const fallbackX = (minAllowedX + maxAllowedX) / 2;
    const fallbackY = (minAllowedY + maxAllowedY) / 2;

    const nextX =
      minAllowedX > maxAllowedX
        ? fallbackX
        : Math.max(minAllowedX, Math.min(x, maxAllowedX));
    const nextY =
      minAllowedY > maxAllowedY
        ? fallbackY
        : Math.max(minAllowedY, Math.min(y, maxAllowedY));

    return { x: nextX, y: nextY };
  }, [STAGE_HEIGHT, STAGE_WIDTH]);

  /* ---------------- SNAP FUNCTION ---------------- */
  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  /* ---------------- COLLISION LOGIC ---------------- */
  const isColliding = (
    id: string,
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number,
    newRotation: number
  ) => {
    const nextItem = {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: newRotation,
    };

    return furniture.some((item) => {
      if (item.id === id) return false;
      return areFurnitureItemsOverlapping(nextItem, item);
    });
  };

  /* ---------------- TRANSFORMER ATTACH ---------------- */
  useEffect(() => {
    if (selectedId && shapeRef.current && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  useEffect(() => {
    // Keep existing shapes inside the new room bounds when room size changes.
    setFurniture((prev) =>
      prev.map((item) => ({
        ...item,
        ...clampRotatedPosition(
          item.x,
          item.y,
          item.width,
          item.height,
          item.rotation
        ),
      }))
    );
  }, [clampRotatedPosition]);

  useEffect(() => {
    setCurrentDesignId(designId);
    if (designId) {
      setShowNamePopup(false);
    }
  }, [designId]);

  useEffect(() => {
    const loadDesign = async () => {
      if (!designId) return;

      try {
        const user = await import("@/lib/firebase").then((m) => m.auth.currentUser);
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch(`/api/designs/${designId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to load design");
          return;
        }

        const data: LoadedDesign = await res.json();
        setRoomWidthFeet(data.roomWidthFeet);
        setRoomHeightFeet(data.roomHeightFeet);
        setProjectName(data.title?.trim() || "Untitled Design");
        setFurniture(data.furniture ?? []);
        setRoomShape(data.roomShape || "rectangle");
        setWallColor(data.wallColor || "#e2e8f0");
        setFloorColor(data.floorColor || "#f3f4f6");
        setLightIntensity(typeof data.lightIntensity === "number" ? data.lightIntensity : 1);
        setCurrentDesignId(data._id);
        setSelectedId(null);
      } catch (error) {
        console.error("Load design error:", error);
      }
    };

    loadDesign();
  }, [designId]);

  const checkDeselect = (e: KonvaEventObject<PointerEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setFurniture((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;

      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      e.preventDefault();
      setFurniture((prev) => prev.filter((item) => item.id !== selectedId));
      setSelectedId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const handleSaveDesign = async ({ showSuccessPopup = true }: { showSuccessPopup?: boolean } = {}) => {
    try {
      setSaving(true);

      const user = await import("@/lib/firebase").then((m) => m.auth.currentUser);
      if (!user) return;

      const token = await user.getIdToken();

      const isUpdate = Boolean(currentDesignId);
      const endpoint = isUpdate ? `/api/designs/${currentDesignId}` : "/api/designs";
      const method = isUpdate ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: projectName.trim() || "Untitled Design",
          roomWidthFeet,
          roomHeightFeet,
          roomShape,
          wallColor,
          floorColor,
          lightIntensity,
          furniture,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save");
        return;
      }

      const data = await res.json();
      console.log("Saved design:", data);
      setProjectName(data?.title?.trim() || projectName.trim() || "Untitled Design");
      if (!isUpdate && data?._id) {
        setCurrentDesignId(data._id);
        router.replace(`/editor?designId=${data._id}`);
      }

      if (showSuccessPopup) {
        setSaveSuccessMessage(
          isUpdate ? "Design updated successfully!" : "Design saved successfully!"
        );
        setShowSaveSuccessPopup(true);
      }
      return true;
    } catch (error) {
      console.error("Save error:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRequestExit = () => {
    setShowExitConfirmPopup(true);
  };

  const handleExitWithoutSave = () => {
    if (saving) return;
    setShowExitConfirmPopup(false);
    router.push("/dashboard");
  };

  const handleSaveAndExit = async () => {
    const saved = await handleSaveDesign({ showSuccessPopup: false });
    if (!saved) return;
    setShowExitConfirmPopup(false);
    router.push("/dashboard");
  };

  const handleConfirmProjectName = () => {
    const nextName = newProjectNameInput.trim();
    if (!nextName) return;
    setProjectName(nextName);
    setShowNamePopup(false);
  };

  const handleProjectNameSave = async (nextName: string) => {
    const normalizedName = nextName.trim();
    if (!normalizedName) return;

    if (!currentDesignId) {
      setProjectName(normalizedName);
      return;
    }

    try {
      setRenamingProject(true);
      const user = await import("@/lib/firebase").then((m) => m.auth.currentUser);
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch(`/api/designs/${currentDesignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: normalizedName }),
      });

      if (!res.ok) {
        alert("Failed to update project name.");
        return;
      }

      const data = await res.json();
      setProjectName(data?.title?.trim() || normalizedName);
    } catch (error) {
      console.error("Rename project error:", error);
      alert("Failed to update project name.");
    } finally {
      setRenamingProject(false);
    }
  };

  const clampedZoom = Math.max(0.3, Math.min(zoom, 2.5));
  const scaledStageWidth = STAGE_WIDTH * clampedZoom;
  const scaledStageHeight = STAGE_HEIGHT * clampedZoom;

  const verticalLineCount = Math.floor(STAGE_WIDTH / GRID_SIZE);
  const horizontalLineCount = Math.floor(STAGE_HEIGHT / GRID_SIZE);
  const verticalIndices = useMemo(
    () => Array.from({ length: verticalLineCount + 1 }, (_, i) => i),
    [verticalLineCount]
  );
  const horizontalIndices = useMemo(
    () => Array.from({ length: horizontalLineCount + 1 }, (_, i) => i),
    [horizontalLineCount]
  );

  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden font-sans flex">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      {/* IMPORTED SIDEBAR COMPONENT */}
      <Sidebar
        roomWidthFeet={roomWidthFeet}
        roomHeightFeet={roomHeightFeet}
        setRoomWidthFeet={setRoomWidthFeet}
        setRoomHeightFeet={setRoomHeightFeet}
        roomShape={roomShape}
        setRoomShape={setRoomShape}
        wallColor={wallColor}
        setWallColor={setWallColor}
        floorColor={floorColor}
        setFloorColor={setFloorColor}
        lightIntensity={lightIntensity}
        setLightIntensity={setLightIntensity}
        projectName={projectName}
        onSaveProjectName={handleProjectNameSave}
        renamingProject={renamingProject}
        furnitureLibrary={FURNITURE_LIBRARY}
        addFurnitureToRoom={addFurnitureToRoom}
        onRequestExit={handleRequestExit}
      />

      {/* CANVAS AREA */}
      <div 
        className="relative z-10 flex-1 min-w-0 min-h-0 p-6 md:p-8"
        onClick={() => setSelectedId(null)}
      >
        {/* Outer Container: Rounded corners and glass shadow */}
        <div className="h-full w-full bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden flex flex-col">

          {/* Canvas Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">
                Workspace <span className="text-gray-600 ml-1">{roomWidthFeet}ft × {roomHeightFeet}ft</span>
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.1).toFixed(2))))}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold hover:border-emerald-300 hover:text-emerald-700 transition"
                aria-label="Zoom out"
              >
                -
              </button>
              <span className="min-w-14 text-center text-xs font-bold text-gray-500">
                {Math.round(clampedZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold hover:border-emerald-300 hover:text-emerald-700 transition"
                aria-label="Zoom in"
              >
                +
              </button>
              {clampedZoom !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="inline-flex items-center justify-center p-1 text-gray-500 hover:text-emerald-700 transition-transform duration-200 hover:scale-110 hover:-rotate-12"
                  aria-label="Reset zoom"
                  title="Reset zoom"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v6h6M20 20v-6h-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 9A8 8 0 006.34 5.34L4 7m16 10l-2.34 1.66A8 8 0 013.99 15" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition"
              >
                {viewMode === "2d" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8l-9-5-9 5 9 5 9-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8v8l9 5 9-5V8" />
                    </svg>
                    Switch to 3D
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Switch to 2D
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSaveDesign();
                }}
                disabled={saving}
                className="h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedId}
                className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Delete Selected
              </button>
            </div>
          </div>

          {/* Scrollable viewport keeps big rooms contained inside page */}
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50/50 p-4">
            {viewMode === "2d" ? (
              <div style={{ width: scaledStageWidth, height: scaledStageHeight }}>
                <Stage
                  width={scaledStageWidth}
                  height={scaledStageHeight}
                  scaleX={clampedZoom}
                  scaleY={clampedZoom}
                  className="cursor-crosshair"
                  onPointerDown={checkDeselect}
                >
                  <Layer>
                  {/* ROOM FLOOR */}
                  <Rect
                    x={0}
                    y={0}
                    width={STAGE_WIDTH}
                    height={STAGE_HEIGHT}
                    fill={floorColor}
                  />

                  {/* VERTICAL GRID (1 inch spacing) */}
                  {verticalIndices.map((i) => {
                    const x = i * GRID_SIZE;
                    const inchesFromOrigin = i * GRID_SIZE_INCHES;
                    const isFootMark =
                      inchesFromOrigin % MAJOR_GRID_INTERVAL_INCHES === 0;
                    return (
                      <Line
                        key={`v-${i}`}
                        points={[x, 0, x, STAGE_HEIGHT]}
                        stroke={isFootMark ? "rgba(0,0,0,0.11)" : "rgba(0,0,0,0.04)"}
                        strokeWidth={isFootMark ? 1.3 : 1}
                      />
                    );
                  })}

                  {/* HORIZONTAL GRID (1 inch spacing) */}
                  {horizontalIndices.map((i) => {
                    const y = i * GRID_SIZE;
                    const inchesFromOrigin = i * GRID_SIZE_INCHES;
                    const isFootMark =
                      inchesFromOrigin % MAJOR_GRID_INTERVAL_INCHES === 0;
                    return (
                      <Line
                        key={`h-${i}`}
                        points={[0, y, STAGE_WIDTH, y]}
                        stroke={isFootMark ? "rgba(0,0,0,0.11)" : "rgba(0,0,0,0.04)"}
                        strokeWidth={isFootMark ? 1.3 : 1}
                      />
                    );
                  })}

                  {/* ROOM BORDER (Sharp Corners) */}
                  <Rect
                    x={0}
                    y={0}
                    width={STAGE_WIDTH}
                    height={STAGE_HEIGHT}
                    stroke={wallColor}
                    strokeWidth={6}
                  />

                  {/* FURNITURE */}
                  {furniture.map((item) => (
                    <Rect
                      key={item.id}
                      ref={item.id === selectedId ? shapeRef : null}
                      {...item}
                      draggable

                      // Sharp edges as requested
                      cornerRadius={0}
                      
                      // Dynamic Selection Shadow
                      shadowColor={item.id === selectedId ? "rgba(5, 150, 105, 0.4)" : "rgba(0, 0, 0, 0.15)"}
                      shadowBlur={item.id === selectedId ? 20 : 10}
                      shadowOffsetX={0}
                      shadowOffsetY={item.id === selectedId ? 12 : 6}

                      dragBoundFunc={function (pos) {
                        const newX = snapToGrid(pos.x);
                        const newY = snapToGrid(pos.y);
                        const bounded = clampRotatedPosition(
                          newX,
                          newY,
                          item.width,
                          item.height,
                          item.rotation
                        );

                        return {
                          x: snapToGrid(bounded.x),
                          y: snapToGrid(bounded.y),
                        };
                      }}

                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedId(item.id);
                      }}

                      onDragEnd={(e) => {
                        const node = e.target;
                        const newX = snapToGrid(node.x());
                        const newY = snapToGrid(node.y());
                        const bounded = clampRotatedPosition(
                          newX,
                          newY,
                          item.width,
                          item.height,
                          item.rotation
                        );

                        if (
                          isColliding(
                            item.id,
                            bounded.x,
                            bounded.y,
                            item.width,
                            item.height,
                            item.rotation
                          )
                        ) {
                          node.position({ x: item.x, y: item.y });
                          return;
                        }

                        setFurniture((prev) =>
                          prev.map((f) =>
                            f.id === item.id
                              ? {
                                  ...f,
                                  x: snapToGrid(bounded.x),
                                  y: snapToGrid(bounded.y),
                                }
                              : f
                          )
                        );
                      }}

                      onTransformEnd={() => {
                        const node = shapeRef.current;
                        if (!node) return;

                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);

                        const newWidth = Math.min(Math.max(40, node.width() * scaleX), STAGE_WIDTH);
                        const newHeight = Math.min(Math.max(40, node.height() * scaleY), STAGE_HEIGHT);
                        const rotation = node.rotation();
                        const bounded = clampRotatedPosition(
                          node.x(),
                          node.y(),
                          newWidth,
                          newHeight,
                          rotation
                        );
                        const newX = snapToGrid(bounded.x);
                        const newY = snapToGrid(bounded.y);

                        if (
                          isColliding(
                            item.id,
                            newX,
                            newY,
                            newWidth,
                            newHeight,
                            rotation
                          )
                        ) {
                          node.width(item.width);
                          node.height(item.height);
                          node.x(item.x);
                          node.y(item.y);
                          node.rotation(item.rotation);
                          return;
                        }

                        setFurniture((prev) =>
                          prev.map((f) =>
                            f.id === item.id
                              ? {
                                  ...f,
                                  x: snapToGrid(newX),
                                  y: snapToGrid(newY),
                                  width: newWidth,
                                  height: newHeight,
                                  rotation,
                                }
                              : f
                          )
                        );
                      }}
                    />
                  ))}

                  {/* CUSTOMIZED TRANSFORMER */}
                    {selectedId && (
                      <Transformer
                        ref={trRef}
                        rotateEnabled={true}
                        flipEnabled={false}
                        anchorStroke="#059669"
                        anchorFill="#ffffff"
                        anchorSize={10}
                        borderStroke="#059669"
                        borderDash={[5, 5]}
                        borderStrokeWidth={2}
                        padding={2}
                        boundBoxFunc={(oldBox, newBox) => {
                          if (newBox.width < 40 || newBox.height < 40) {
                            return oldBox;
                          }
                          return newBox;
                        }}
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            ) : (
              <ThreeDView
                roomWidthFeet={roomWidthFeet}
                roomHeightFeet={roomHeightFeet}
                furniture={furniture}
                wallColor={wallColor}
                floorColor={floorColor}
                lightIntensity={lightIntensity}
              />
            )}
          </div>

        </div>
      </div>

      {showNamePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">Name Your Project</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter a name before you start designing.
            </p>
            <input
              type="text"
              value={newProjectNameInput}
              onChange={(e) => setNewProjectNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmProjectName();
                }
              }}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              placeholder="My Living Room Concept"
              autoFocus
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleConfirmProjectName}
                disabled={!newProjectNameInput.trim()}
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">Project Saved</h3>
            <p className="mt-2 text-sm text-gray-600">{saveSuccessMessage}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSaveSuccessPopup(false)}
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">Leave Editor?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Do you want to save this design before going back to the dashboard?
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirmPopup(false)}
                disabled={saving}
                className="px-5 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExitWithoutSave}
                disabled={saving}
                className="px-5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
              >
                Don&apos;t Save
              </button>
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={saving}
                className="flex-1 min-w-[9.5rem] px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold whitespace-nowrap hover:bg-emerald-100 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save and Exit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-50" />}>
      <EditorPageContent />
    </Suspense>
  );
}
