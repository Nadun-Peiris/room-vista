"use client";

import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import { useState, useRef, useEffect, useMemo } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter, useSearchParams } from "next/navigation";

// Import your new Sidebar component (Adjust the path as needed based on your folder structure)
import Sidebar from "./Sidebar"; 

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
};

type LoadedDesign = {
  _id: string;
  roomWidthFeet: number;
  roomHeightFeet: number;
  furniture: FurnitureItem[];
};

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("designId");

  /* ---------------- ROOM SIZE STATE ---------------- */
  const [roomWidthFeet, setRoomWidthFeet] = useState(12);
  const [roomHeightFeet, setRoomHeightFeet] = useState(10);

  const roomWidthInches = roomWidthFeet * 12;
  const roomHeightInches = roomHeightFeet * 12;

  const STAGE_WIDTH = roomWidthInches * PIXELS_PER_INCH;
  const STAGE_HEIGHT = roomHeightInches * PIXELS_PER_INCH;

  const GRID_SIZE = GRID_SIZE_INCHES * PIXELS_PER_INCH;

  /* ---------------- FURNITURE STATE ---------------- */
  const [furniture, setFurniture] = useState<FurnitureItem[]>([
    {
      id: "1",
      x: 120,
      y: 120,
      width: 120,
      height: 80,
      fill: "#059669", // Emerald-600
      rotation: 0,
    },
    {
      id: "2",
      x: 320,
      y: 120,
      width: 120,
      height: 80,
      fill: "#3b82f6", // Blue-500
      rotation: 0,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(designId);
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

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
    newHeight: number
  ) => {
    return furniture.some((item) => {
      if (item.id === id) return false;

      return (
        newX < item.x + item.width &&
        newX + newWidth > item.x &&
        newY < item.y + item.height &&
        newY + newHeight > item.y
      );
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
        x: Math.max(0, Math.min(item.x, STAGE_WIDTH - item.width)),
        y: Math.max(0, Math.min(item.y, STAGE_HEIGHT - item.height)),
      }))
    );
  }, [STAGE_WIDTH, STAGE_HEIGHT]);

  useEffect(() => {
    setCurrentDesignId(designId);
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
        setFurniture(data.furniture ?? []);
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

  const handleSaveDesign = async () => {
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
          title: "My Design",
          roomWidthFeet,
          roomHeightFeet,
          furniture,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save");
        return;
      }

      const data = await res.json();
      console.log("Saved design:", data);
      if (!isUpdate && data?._id) {
        setCurrentDesignId(data._id);
        router.replace(`/editor?designId=${data._id}`);
      }

      alert(isUpdate ? "Design updated successfully!" : "Design saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
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
            <span className="text-sm font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">
              Workspace <span className="text-gray-600 ml-1">{roomWidthFeet}ft × {roomHeightFeet}ft</span>
            </span>
            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveDesign}
                disabled={saving}
                className="h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Scrollable viewport keeps big rooms contained inside page */}
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50/50 p-4">
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
                    stroke="#cbd5e1"
                    strokeWidth={4}
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

                        const boundedX = Math.max(
                          0,
                          Math.min(newX, STAGE_WIDTH - item.width)
                        );
                        const boundedY = Math.max(
                          0,
                          Math.min(newY, STAGE_HEIGHT - item.height)
                        );

                        if (
                          isColliding(
                            item.id,
                            boundedX,
                            boundedY,
                            item.width,
                            item.height
                          )
                        ) {
                          return this.position();
                        }

                        return { x: boundedX, y: boundedY };
                      }}

                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedId(item.id);
                      }}

                      onDragEnd={(e) => {
                        const node = e.target;
                        const newX = snapToGrid(node.x());
                        const newY = snapToGrid(node.y());
                        const boundedX = Math.max(
                          0,
                          Math.min(newX, STAGE_WIDTH - item.width)
                        );
                        const boundedY = Math.max(
                          0,
                          Math.min(newY, STAGE_HEIGHT - item.height)
                        );

                        if (
                          isColliding(
                            item.id,
                            boundedX,
                            boundedY,
                            item.width,
                            item.height
                          )
                        ) {
                          node.position({ x: item.x, y: item.y });
                          return;
                        }

                        setFurniture((prev) =>
                          prev.map((f) =>
                            f.id === item.id
                              ? { ...f, x: boundedX, y: boundedY }
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

                        const newWidth = Math.max(40, node.width() * scaleX);
                        const newHeight = Math.max(40, node.height() * scaleY);

                        const newX = Math.max(
                          0,
                          Math.min(node.x(), STAGE_WIDTH - newWidth)
                        );
                        const newY = Math.max(
                          0,
                          Math.min(node.y(), STAGE_HEIGHT - newHeight)
                        );

                        if (
                          isColliding(
                            item.id,
                            newX,
                            newY,
                            newWidth,
                            newHeight
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
                                  rotation: node.rotation(),
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
          </div>

        </div>
      </div>
    </div>
  );
}
