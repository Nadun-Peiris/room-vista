"use client";

import { Stage, Layer, Rect, Line, Transformer, Text } from "react-konva";
import { Suspense, useState, useRef, useEffect, useMemo, useCallback } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import FeedbackDialog from "@/components/FeedbackDialog";

// Import your new Sidebar component (Adjust the path as needed based on your folder structure)
import Sidebar from "./Sidebar"; 
import ThreeDView from "./ThreeDView";

const GRID_SIZE_INCHES = 1;
const MAJOR_GRID_INTERVAL_INCHES = 12;
const PIXELS_PER_INCH = 5;
const RULER_SIZE = 32;

type FurnitureItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  heightFeet?: number;
  shadeIntensity?: number;
  type?: string;
  modelUrl?: string;
};

type LoadedDesign = {
  _id: string;
  title?: string;
  roomWidthFeet: number;
  roomHeightFeet?: number;
  roomLengthFeet?: number;
  wallHeightFeet?: number;
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
  modelUrl?: string;
  thumbnailUrl?: string;
};

type FurnitureApiItem = {
  _id?: string;
  name?: string;
  category?: string;
  widthInches?: number | string;
  depthInches?: number | string;
  heightFeet?: number | string;
  modelUrl?: string;
  thumbnailUrl?: string;
};

type FurnitureSnapshot = {
  furniture: FurnitureItem[];
  selectedId: string | null;
};

const cloneFurnitureItems = (items: FurnitureItem[]) => items.map((item) => ({ ...item }));

const serializeDesignSnapshot = ({
  title,
  roomWidthFeet,
  roomLengthFeet,
  wallHeightFeet,
  roomShape,
  wallColor,
  floorColor,
  lightIntensity,
  furniture,
}: {
  title: string;
  roomWidthFeet: number;
  roomLengthFeet: number;
  wallHeightFeet: number;
  roomShape: string;
  wallColor: string;
  floorColor: string;
  lightIntensity: number;
  furniture: FurnitureItem[];
}) =>
  JSON.stringify({
    title,
    roomWidthFeet,
    roomLengthFeet,
    wallHeightFeet,
    roomShape,
    wallColor,
    floorColor,
    lightIntensity,
    furniture,
  });

const sanitizeFurnitureForSave = (items: FurnitureItem[]): FurnitureItem[] =>
  items
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      x: Number.isFinite(item.x) ? item.x : 0,
      y: Number.isFinite(item.y) ? item.y : 0,
      width: Number.isFinite(item.width) ? item.width : 0,
      height: Number.isFinite(item.height) ? item.height : 0,
      fill: typeof item.fill === "string" ? item.fill : "#64748b",
      rotation: Number.isFinite(item.rotation) ? item.rotation : 0,
      ...(typeof item.type === "string" ? { type: item.type } : {}),
      ...(Number.isFinite(item.heightFeet) ? { heightFeet: item.heightFeet } : {}),
      ...(Number.isFinite(item.shadeIntensity) ? { shadeIntensity: item.shadeIntensity } : {}),
      ...(typeof item.modelUrl === "string" ? { modelUrl: item.modelUrl } : {}),
    }))
    .filter((item) => item.width > 0 && item.height > 0);

const parseErrorResponse = async (res: Response) => {
  const raw = await res.text();
  if (!raw) return "<empty response body>";
  try {
    const parsed = JSON.parse(raw) as { error?: string; details?: string };
    if (parsed.details) return `${parsed.error || "Error"}: ${parsed.details}`;
    if (parsed.error) return parsed.error;
  } catch {
    // Keep raw body if not JSON.
  }
  return raw;
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

const CATEGORY_COLORS: Record<string, string> = {
  seating: "#059669",
  sofa: "#059669",
  beds: "#3b82f6",
  bed: "#3b82f6",
  tables: "#f59e0b",
  table: "#f59e0b",
  storage: "#0ea5e9",
  decor: "#8b5cf6",
};

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
    const beforeSnapshot = createSnapshot();

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
          shadeIntensity: 0.5,
          type: item.id,
          modelUrl: item.modelUrl,
        },
      ];
    });
    pushUndoSnapshot(beforeSnapshot);
  };

  /* ---------------- ROOM SIZE STATE ---------------- */
  const [roomWidthFeet, setRoomWidthFeet] = useState(12);
  const [roomLengthFeet, setRoomLengthFeet] = useState(10);
  const [wallHeightFeet, setWallHeightFeet] = useState(9);

  const roomWidthInches = roomWidthFeet * 12;
  const roomLengthInches = roomLengthFeet * 12;

  const STAGE_WIDTH = roomWidthInches * PIXELS_PER_INCH;
  const STAGE_HEIGHT = roomLengthInches * PIXELS_PER_INCH;

  const GRID_SIZE = GRID_SIZE_INCHES * PIXELS_PER_INCH;

  const [roomShape, setRoomShape] = useState("rectangle");
  const [wallColor, setWallColor] = useState("#e2e8f0");
  const [floorColor, setFloorColor] = useState("#f3f4f6");

  /* ---------------- FURNITURE STATE ---------------- */
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [furnitureLibrary, setFurnitureLibrary] = useState<FurnitureLibraryItem[]>(FURNITURE_LIBRARY);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [lightIntensity, setLightIntensity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(designId);
  const [projectName, setProjectName] = useState(initialProjectName || "Untitled Design");
  const [showNamePopup, setShowNamePopup] = useState(!designId && !initialProjectName);
  const [newProjectNameInput, setNewProjectNameInput] = useState(initialProjectName);
  const [feedbackPopup, setFeedbackPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });
  const [showExitConfirmPopup, setShowExitConfirmPopup] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [renamingProject, setRenamingProject] = useState(false);
  const [liveRotation, setLiveRotation] = useState<{ id: string; angle: number } | null>(null);
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const undoStackRef = useRef<FurnitureSnapshot[]>([]);
  const redoStackRef = useRef<FurnitureSnapshot[]>([]);
  const [, setHistoryTick] = useState(0);
  const openFeedbackPopup = useCallback((title: string, message: string) => {
    setFeedbackPopup({ open: true, title, message });
  }, []);
  const createSnapshot = useCallback(
    (): FurnitureSnapshot => ({
      furniture: cloneFurnitureItems(furniture),
      selectedId,
    }),
    [furniture, selectedId]
  );
  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setHistoryTick((v) => v + 1);
  }, []);
  const pushUndoSnapshot = useCallback((snapshot: FurnitureSnapshot) => {
    const nextUndo = [...undoStackRef.current, snapshot];
    if (nextUndo.length > 100) nextUndo.shift();
    undoStackRef.current = nextUndo;
    redoStackRef.current = [];
    setHistoryTick((v) => v + 1);
  }, []);
  const applySnapshot = useCallback((snapshot: FurnitureSnapshot) => {
    setFurniture(cloneFurnitureItems(snapshot.furniture));
    setSelectedId(snapshot.selectedId);
    setLiveRotation(null);
  }, []);
  const handleUndo = useCallback(() => {
    const previous = undoStackRef.current.at(-1);
    if (!previous) return;
    const current = createSnapshot();
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    const nextRedo = [...redoStackRef.current, current];
    if (nextRedo.length > 100) nextRedo.shift();
    redoStackRef.current = nextRedo;
    applySnapshot(previous);
    setHistoryTick((v) => v + 1);
  }, [applySnapshot, createSnapshot]);
  const handleRedo = useCallback(() => {
    const next = redoStackRef.current.at(-1);
    if (!next) return;
    const current = createSnapshot();
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    const nextUndo = [...undoStackRef.current, current];
    if (nextUndo.length > 100) nextUndo.shift();
    undoStackRef.current = nextUndo;
    applySnapshot(next);
    setHistoryTick((v) => v + 1);
  }, [applySnapshot, createSnapshot]);
  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const handleRoomWidthFeetChange = (value: number) => {
    const safeValue = value || 0;
    if (roomShape === "square") {
      setRoomWidthFeet(safeValue);
      setRoomLengthFeet(safeValue);
      return;
    }
    setRoomWidthFeet(safeValue);
  };

  const handleRoomLengthFeetChange = (value: number) => {
    const safeValue = value || 0;
    if (roomShape === "square") {
      setRoomWidthFeet(safeValue);
      setRoomLengthFeet(safeValue);
      return;
    }
    setRoomLengthFeet(safeValue);
  };

  const handleRoomShapeChange = (value: string) => {
    setRoomShape(value);
    if (value === "square" && roomLengthFeet !== roomWidthFeet) {
      setRoomLengthFeet(roomWidthFeet);
    }
  };

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
    if (!designId) return;
    let isMounted = true;

    const loadDesign = async (user: { getIdToken: () => Promise<string> } | null) => {
      if (!user || !isMounted) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/designs/${designId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to load design");
          openFeedbackPopup("Load Failed", "Unable to load this design right now.");
          return;
        }

        const data: LoadedDesign = await res.json();
        const loadedLength =
          typeof data.roomLengthFeet === "number"
            ? data.roomLengthFeet
            : (data.roomHeightFeet ?? 10);
        const loadedWallHeight = data.wallHeightFeet ?? 9;

        setRoomWidthFeet(data.roomWidthFeet);
        setRoomLengthFeet(loadedLength);
        setWallHeightFeet(loadedWallHeight);
        setProjectName(data.title?.trim() || "Untitled Design");
        setFurniture(data.furniture ?? []);
        setRoomShape(data.roomShape || "rectangle");
        setWallColor(data.wallColor || "#e2e8f0");
        setFloorColor(data.floorColor || "#f3f4f6");
        setLightIntensity(typeof data.lightIntensity === "number" ? data.lightIntensity : 1);
        setCurrentDesignId(data._id);
        setSelectedId(null);
        clearHistory();
        setLastSavedSnapshot(
          serializeDesignSnapshot({
            title: data.title?.trim() || "Untitled Design",
            roomWidthFeet: data.roomWidthFeet,
            roomLengthFeet: loadedLength,
            wallHeightFeet: loadedWallHeight,
            roomShape: data.roomShape || "rectangle",
            wallColor: data.wallColor || "#e2e8f0",
            floorColor: data.floorColor || "#f3f4f6",
            lightIntensity:
              typeof data.lightIntensity === "number" ? data.lightIntensity : 1,
            furniture: data.furniture ?? [],
          })
        );
      } catch (error) {
        console.error("Load design error:", error);
        openFeedbackPopup("Load Failed", "Unable to load this design right now.");
      }
    };

    void loadDesign(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void loadDesign(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clearHistory, designId, openFeedbackPopup]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initFurnitureLibrary = async () => {
      try {
        const firebase = await import("@/lib/firebase");
        const authModule = await import("firebase/auth");

        const loadFurnitureForUser = async (user: { getIdToken: () => Promise<string> } | null) => {
          if (!user || !isMounted) return;

          const token = await user.getIdToken();
          const res = await fetch("/api/furniture", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok || !isMounted) {
            return;
          }

          const data = await res.json();
          if (!Array.isArray(data) || !isMounted) return;

          const mapped: FurnitureLibraryItem[] = data.map((item: FurnitureApiItem) => {
            const category = (item.category || "decor").toString().toLowerCase();
            return {
              id: item._id || crypto.randomUUID(),
              name: item.name || "Untitled Furniture",
              category,
              widthInches: Number(item.widthInches) || 0,
              depthInches: Number(item.depthInches) || 0,
              heightFeet: Number(item.heightFeet) || 0,
              defaultColor: CATEGORY_COLORS[category] || "#64748b",
              modelUrl: item.modelUrl,
              thumbnailUrl: item.thumbnailUrl,
            };
          });

          if (mapped.length > 0) {
            setFurnitureLibrary(mapped);
          }
        };

        await loadFurnitureForUser(firebase.auth.currentUser);
        unsubscribe = authModule.onAuthStateChanged(firebase.auth, loadFurnitureForUser);
      } catch (error) {
        console.error("Load furniture library error:", error);
        openFeedbackPopup(
          "Library Load Failed",
          "Unable to load furniture library. Please refresh and try again."
        );
      }
    };

    initFurnitureLibrary();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [openFeedbackPopup]);

  const checkDeselect = (e: KonvaEventObject<PointerEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const beforeSnapshot = createSnapshot();
    setFurniture((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId(null);
    setLiveRotation(null);
    pushUndoSnapshot(beforeSnapshot);
  };

  const selectedFurniture = useMemo(
    () => furniture.find((item) => item.id === selectedId) ?? null,
    [furniture, selectedId]
  );

  const handleSelectedFurnitureColorChange = useCallback((color: string) => {
    if (!selectedId) return;
    const selected = furniture.find((item) => item.id === selectedId);
    if (!selected || selected.fill === color) return;
    const beforeSnapshot = createSnapshot();
    setFurniture((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, fill: color }
          : item
      )
    );
    pushUndoSnapshot(beforeSnapshot);
  }, [createSnapshot, furniture, pushUndoSnapshot, selectedId]);

  const handleSelectedFurnitureShadeChange = useCallback((shade: number) => {
    if (!selectedId) return;
    const clampedShade = Math.max(0, Math.min(1, shade));
    const selected = furniture.find((item) => item.id === selectedId);
    const selectedShade = typeof selected?.shadeIntensity === "number" ? selected.shadeIntensity : 0.5;
    if (!selected || selectedShade === clampedShade) return;
    const beforeSnapshot = createSnapshot();
    setFurniture((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, shadeIntensity: clampedShade }
          : item
      )
    );
    pushUndoSnapshot(beforeSnapshot);
  }, [createSnapshot, furniture, pushUndoSnapshot, selectedId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      const key = e.key.toLowerCase();
      const isMetaOrCtrl = e.metaKey || e.ctrlKey;
      if (isMetaOrCtrl && key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (isMetaOrCtrl && key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!selectedId) return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;

      e.preventDefault();
      const beforeSnapshot = createSnapshot();
      setFurniture((prev) => prev.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      setLiveRotation(null);
      pushUndoSnapshot(beforeSnapshot);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createSnapshot, handleRedo, handleUndo, pushUndoSnapshot, selectedId]);

  const handleSaveDesign = async ({ showSuccessPopup = true }: { showSuccessPopup?: boolean } = {}) => {
    try {
      setSaving(true);

      const user = await import("@/lib/firebase").then((m) => m.auth.currentUser);
      if (!user) {
        console.error("Save blocked: user not authenticated");
        return false;
      }

      let token = await user.getIdToken();

      const isUpdate = Boolean(currentDesignId);
      const payload = {
        title: projectName.trim() || "Untitled Design",
        roomWidthFeet,
        roomHeightFeet: roomLengthFeet,
        roomLengthFeet,
        wallHeightFeet,
        roomShape,
        wallColor,
        floorColor,
        lightIntensity,
        furniture: sanitizeFurnitureForSave(furniture),
      };

      const sendSaveRequest = async (
        method: "PATCH" | "POST",
        endpoint: string,
        authToken: string
      ) =>
        fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

      let endpoint = isUpdate ? `/api/designs/${currentDesignId}` : "/api/designs";
      let method: "PATCH" | "POST" = isUpdate ? "PATCH" : "POST";
      let res = await sendSaveRequest(method, endpoint, token);

      // If update fails for any reason, attempt create as a recovery path.
      if (!res.ok && isUpdate) {
        method = "POST";
        endpoint = "/api/designs";
        res = await sendSaveRequest(method, endpoint, token);
      }

      // If auth is stale, refresh token and retry once.
      if (!res.ok && (res.status === 401 || res.status === 403)) {
        token = await user.getIdToken(true);
        res = await sendSaveRequest(method, endpoint, token);
      }

      if (!res.ok) {
        const errorText = await parseErrorResponse(res);
        throw new Error(
          `Save failed (${res.status} ${res.statusText}) ${method} ${endpoint}: ${errorText}`
        );
      }

      const data = await res.json();
      console.log("Saved design:", data);
      const savedTitle = data?.title?.trim() || projectName.trim() || "Untitled Design";
      setProjectName(savedTitle);
      if (!isUpdate && data?._id) {
        setCurrentDesignId(data._id);
        router.replace(`/editor?designId=${data._id}`);
      }
      setLastSavedSnapshot(
        serializeDesignSnapshot({
          title: savedTitle,
          roomWidthFeet,
          roomLengthFeet,
          wallHeightFeet,
          roomShape,
          wallColor,
          floorColor,
          lightIntensity,
          furniture,
        })
      );

      if (showSuccessPopup) {
        openFeedbackPopup(
          "Project Saved",
          isUpdate ? "Design updated successfully!" : "Design saved successfully!"
        );
      }
      return true;
    } catch (error) {
      console.error("Save error:", error);
      openFeedbackPopup(
        "Save Failed",
        error instanceof Error ? error.message : "Failed to save design."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRequestExit = () => {
    if (!hasUnsavedChanges) {
      router.push("/dashboard");
      return;
    }
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
        setFeedbackPopup({
          open: true,
          title: "Rename Failed",
          message: "Failed to update project name.",
        });
        return;
      }

      const data = await res.json();
      const updatedTitle = data?.title?.trim() || normalizedName;
      setProjectName(updatedTitle);
      setLastSavedSnapshot(
        serializeDesignSnapshot({
          title: updatedTitle,
          roomWidthFeet,
          roomLengthFeet,
          wallHeightFeet,
          roomShape,
          wallColor,
          floorColor,
          lightIntensity,
          furniture,
        })
      );
    } catch (error) {
      console.error("Rename project error:", error);
      setFeedbackPopup({
        open: true,
        title: "Rename Failed",
        message: "Failed to update project name.",
      });
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
  const currentSnapshot = useMemo(
    () =>
      serializeDesignSnapshot({
        title: projectName.trim() || "Untitled Design",
        roomWidthFeet,
        roomLengthFeet,
        wallHeightFeet,
        roomShape,
        wallColor,
        floorColor,
        lightIntensity,
        furniture,
      }),
    [
      projectName,
      roomWidthFeet,
      roomLengthFeet,
      wallHeightFeet,
      roomShape,
      wallColor,
      floorColor,
      lightIntensity,
      furniture,
    ]
  );
  const hasUnsavedChanges = lastSavedSnapshot === null || currentSnapshot !== lastSavedSnapshot;

  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden font-sans flex">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      {/* IMPORTED SIDEBAR COMPONENT */}
      <Sidebar
        roomWidthFeet={roomWidthFeet}
        roomLengthFeet={roomLengthFeet}
        wallHeightFeet={wallHeightFeet}
        setRoomWidthFeet={handleRoomWidthFeetChange}
        setRoomLengthFeet={handleRoomLengthFeetChange}
        setWallHeightFeet={setWallHeightFeet}
        roomShape={roomShape}
        setRoomShape={handleRoomShapeChange}
        wallColor={wallColor}
        setWallColor={setWallColor}
        floorColor={floorColor}
        setFloorColor={setFloorColor}
        lightIntensity={lightIntensity}
        setLightIntensity={setLightIntensity}
        projectName={projectName}
        onSaveProjectName={handleProjectNameSave}
        renamingProject={renamingProject}
        furnitureLibrary={furnitureLibrary}
        addFurnitureToRoom={addFurnitureToRoom}
        selectedFurnitureName={selectedFurniture
          ? selectedFurniture.type
            ? furnitureLibrary.find((libItem) => libItem.id === selectedFurniture.type)?.name ||
              "Selected Furniture"
            : "Selected Furniture"
          : null}
        selectedFurnitureColor={selectedFurniture?.fill ?? null}
        selectedFurnitureShade={
          typeof selectedFurniture?.shadeIntensity === "number"
            ? selectedFurniture.shadeIntensity
            : null
        }
        onSelectedFurnitureColorChange={handleSelectedFurnitureColorChange}
        onSelectedFurnitureShadeChange={handleSelectedFurnitureShadeChange}
        onRequestExit={handleRequestExit}
      />

      {/* CANVAS AREA */}
      <div 
        className="relative z-10 flex-1 min-w-0 min-h-0 p-6 md:p-8"
        onClick={() => {
          if (viewMode === "2d") {
            setSelectedId(null);
          }
        }}
      >
        {/* Outer Container: Rounded corners and glass shadow */}
        <div className="h-full w-full bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden flex flex-col">

          {/* Canvas Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">
                Workspace <span className="text-gray-600 ml-1">{roomWidthFeet}ft × {roomLengthFeet}ft</span>
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
                onClick={handleUndo}
                disabled={!canUndo}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                aria-label="Undo"
                title="Undo (Ctrl/Cmd+Z)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M9 14L4 9l5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M20 19v-4a6 6 0 00-6-6H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                aria-label="Redo"
                title="Redo (Ctrl+Y / Cmd+Shift+Z)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M15 14l5-5-5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M4 19v-4a6 6 0 016-6h10" />
                </svg>
              </button>
              {selectedId && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                >
                  Delete Selected
                </button>
              )}
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
            </div>
          </div>

          {/* Scrollable viewport keeps big rooms contained inside page */}
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50/50 p-4">
            {viewMode === "2d" ? (
              <div
                className="relative"
                style={{
                  width: scaledStageWidth + RULER_SIZE,
                  height: scaledStageHeight + RULER_SIZE,
                }}
              >
                <div
                  className="absolute left-0 top-0 border border-gray-200 bg-gradient-to-br from-white to-gray-100"
                  style={{ width: RULER_SIZE, height: RULER_SIZE }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    ft
                  </span>
                </div>

                <div
                  className="absolute top-0 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50"
                  style={{ left: RULER_SIZE, width: scaledStageWidth, height: RULER_SIZE }}
                >
                  {Array.from({ length: verticalLineCount + 1 }, (_, i) => {
                    const x = i * GRID_SIZE * clampedZoom;
                    const isMajor = i % MAJOR_GRID_INTERVAL_INCHES === 0;
                    const isHalf = i % (MAJOR_GRID_INTERVAL_INCHES / 2) === 0;
                    const feet = i / MAJOR_GRID_INTERVAL_INCHES;
                    return (
                      <div key={`ruler-top-${i}`}>
                        <div
                          className="absolute bg-gray-500/90"
                          style={{
                            left: x,
                            bottom: 0,
                            width: 1,
                            height: isMajor ? 16 : isHalf ? 10 : 6,
                          }}
                        />
                        {isMajor && (
                          <span
                            className="absolute text-[10px] font-semibold text-gray-600"
                            style={{ left: x + 3, top: 3 }}
                          >
                            {feet}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="absolute left-0 border-r border-gray-200 bg-gradient-to-r from-white to-gray-50"
                  style={{ top: RULER_SIZE, width: RULER_SIZE, height: scaledStageHeight }}
                >
                  {Array.from({ length: horizontalLineCount + 1 }, (_, i) => {
                    const y = i * GRID_SIZE * clampedZoom;
                    const isMajor = i % MAJOR_GRID_INTERVAL_INCHES === 0;
                    const isHalf = i % (MAJOR_GRID_INTERVAL_INCHES / 2) === 0;
                    const feet = i / MAJOR_GRID_INTERVAL_INCHES;
                    return (
                      <div key={`ruler-left-${i}`}>
                        <div
                          className="absolute bg-gray-500/90"
                          style={{
                            right: 0,
                            top: y,
                            width: isMajor ? 16 : isHalf ? 10 : 6,
                            height: 1,
                          }}
                        />
                        {isMajor && (
                          <span
                            className="absolute text-[10px] font-semibold text-gray-600"
                            style={{ right: 18, top: y - 6 }}
                          >
                            {feet}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ position: "absolute", left: RULER_SIZE, top: RULER_SIZE }}>
                  <Stage
                    width={scaledStageWidth}
                    height={scaledStageHeight}
                    scaleX={clampedZoom}
                    scaleY={clampedZoom}
                    className="cursor-crosshair"
                    onPointerDown={checkDeselect}
                    onContextMenu={(e) => {
                      e.evt.preventDefault();
                      const clickedOnEmpty = e.target === e.target.getStage();
                      if (clickedOnEmpty) {
                        setSelectedId(null);
                        setLiveRotation(null);
                      }
                    }}
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
                        onContextMenu={(e) => {
                          e.evt.preventDefault();
                          e.cancelBubble = true;
                          setSelectedId(item.id);
                        }}
                        onTransformStart={(e) => {
                          const node = e.target as Konva.Rect;
                          setLiveRotation({ id: item.id, angle: node.rotation() });
                        }}
                        onTransform={(e) => {
                          const node = e.target as Konva.Rect;
                          setLiveRotation({ id: item.id, angle: node.rotation() });
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

                          const snappedX = snapToGrid(bounded.x);
                          const snappedY = snapToGrid(bounded.y);
                          if (item.x === snappedX && item.y === snappedY) return;

                          const beforeSnapshot = createSnapshot();

                          setFurniture((prev) =>
                            prev.map((f) =>
                              f.id === item.id
                                ? {
                                    ...f,
                                    x: snappedX,
                                    y: snappedY,
                                  }
                                : f
                            )
                          );
                          pushUndoSnapshot(beforeSnapshot);
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

                          if (
                            item.x === newX &&
                            item.y === newY &&
                            item.width === newWidth &&
                            item.height === newHeight &&
                            item.rotation === rotation
                          ) {
                            setLiveRotation(null);
                            return;
                          }

                          const beforeSnapshot = createSnapshot();

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
                          pushUndoSnapshot(beforeSnapshot);
                          setLiveRotation(null);
                        }}
                      />
                    ))}

                    {selectedFurniture && (
                      <>
                        <Rect
                          x={selectedFurniture.x + selectedFurniture.width / 2 - 26}
                          y={Math.max(8, selectedFurniture.y - 26)}
                          width={52}
                          height={20}
                          fill="rgba(17,24,39,0.85)"
                          cornerRadius={8}
                          listening={false}
                        />
                        <Text
                          x={selectedFurniture.x + selectedFurniture.width / 2 - 26}
                          y={Math.max(8, selectedFurniture.y - 22)}
                          width={52}
                          align="center"
                          text={`${Math.round(
                            liveRotation?.id === selectedFurniture.id
                              ? liveRotation.angle
                              : selectedFurniture.rotation
                          )}°`}
                          fontSize={12}
                          fontStyle="bold"
                          fill="#f8fafc"
                          listening={false}
                        />
                      </>
                    )}

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
              </div>
            ) : (
              <ThreeDView
                roomWidthFeet={roomWidthFeet}
                roomLengthFeet={roomLengthFeet}
                wallHeightFeet={wallHeightFeet}
                furniture={furniture}
                furnitureLibrary={furnitureLibrary}
                wallColor={wallColor}
                floorColor={floorColor}
                lightIntensity={lightIntensity}
                selectedFurnitureId={selectedId}
                onSelectFurniture={setSelectedId}
                pixelsPerFoot={PIXELS_PER_INCH * 12}
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

      <FeedbackDialog
        open={feedbackPopup.open}
        title={feedbackPopup.title}
        message={feedbackPopup.message}
        onClose={() => setFeedbackPopup({ open: false, title: "", message: "" })}
      />

      {showExitConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">Leave Editor?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Do you want to save this design before going back to the dashboard?
            </p>
            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowExitConfirmPopup(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExitWithoutSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 disabled:opacity-50"
              >
                Don&apos;t Save
              </button>
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 disabled:opacity-50"
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
