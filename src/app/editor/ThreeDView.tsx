"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import { Box3, Color, Vector3, type Material, type Mesh, type Object3D } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const ORIENTATION_STEPS = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
type ColorableMaterial = Material & { color: Color };

const isColorableMaterial = (material: Material): material is ColorableMaterial =>
  "color" in material && material.color instanceof Color;

interface ThreeDProps {
  roomWidthFeet: number;
  roomLengthFeet: number;
  wallHeightFeet: number;
  furniture: FurnitureItem3D[];
  furnitureLibrary: FurnitureLibraryItem3D[];
  wallColor: string;
  floorColor: string;
  lightIntensity: number;
  zoom?: number;
  pixelsPerFoot?: number;
}

interface FurnitureLibraryItem3D {
  id: string;
  modelUrl?: string;
  heightFeet?: number;
}

interface FurnitureItem3D {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  heightFeet?: number;
  type?: string;
  modelUrl?: string;
}

export default function ThreeDView({
  roomWidthFeet,
  roomLengthFeet,
  wallHeightFeet,
  furniture,
  furnitureLibrary,
  wallColor,
  floorColor,
  lightIntensity,
  zoom = 1,
  pixelsPerFoot = 60,
}: ThreeDProps) {
  const roomWidth = roomWidthFeet;
  const roomLength = roomLengthFeet;
  const roomBaseY = -wallHeightFeet / 2;
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const baseDistance = Math.max(roomWidth, roomLength) * 2;
  const furnitureById = useMemo(
    () => new Map(furnitureLibrary.map((item) => [item.id, item])),
    [furnitureLibrary]
  );

  return (
    <div className="w-full h-full bg-gray-50/50">
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={["#f8fafc"]} />
        
        {/* LIGHTING - Soft architectural studio lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={lightIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.1} // Prevents camera from going under the floor
          minDistance={Math.max(baseDistance / 2.5, 4)}
          maxDistance={Math.max(baseDistance / 0.3, 8)}
        />
        <CameraZoomSync zoom={zoom} distance={baseDistance} controlsRef={controlsRef} />

        {/* 3D ARCHITECTURAL GRID (Matches your 1-foot 2D grid) */}
        <Grid 
          position={[0, roomBaseY + 0.01, 0]} 
          args={[roomWidth, roomLength]} 
          sectionSize={1} 
          cellSize={1} 
          cellColor="#cbd5e1" 
          sectionColor="#94a3b8" 
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* FLOOR */}
        <mesh position={[0, roomBaseY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[roomWidth, roomLength]} />
          <meshStandardMaterial color={floorColor} />
        </mesh>

        {/* WALLS - Styled as frosted glass for a premium look */}
        <POVWalls roomWidth={roomWidth} roomLength={roomLength} wallHeight={wallHeightFeet} wallColor={wallColor} />

        {/* FURNITURE */}
        {furniture.map((item) => {
          const libraryItem = item.type ? furnitureById.get(item.type) : undefined;
          const modelUrl = item.modelUrl || libraryItem?.modelUrl;
          const widthPx = Number(item.width) || 0;
          const depthPx = Number(item.height) || 0;
          if (widthPx <= 0 || depthPx <= 0) return null;

          const itemHeightFeet =
            Number(item.heightFeet) > 0
              ? Number(item.heightFeet)
              : Number(libraryItem?.heightFeet) > 0
                ? Number(libraryItem?.heightFeet)
                : 1;

          // Convert 2D top-left pixel coordinates into centered 3D feet coordinates.
          const xPos = (item.x + widthPx / 2) / pixelsPerFoot - roomWidth / 2;
          const zPos = (item.y + depthPx / 2) / pixelsPerFoot - roomLength / 2;
          const widthFeet = widthPx / pixelsPerFoot;
          const depthFeet = depthPx / pixelsPerFoot;
          
          return (
            <group
              key={item.id}
              position={[xPos, roomBaseY, zPos]}
              rotation={[0, -item.rotation * Math.PI / 180, 0]}
            >
              <FurnitureAsset
                modelUrl={modelUrl}
                widthFeet={widthFeet}
                depthFeet={depthFeet}
                heightFeet={itemHeightFeet}
                color={item.fill || "#64748b"}
              />
            </group>
          );
        })}

        {/* Soft contact shadows underneath furniture */}
        <ContactShadows position={[0, roomBaseY + 0.02, 0]} opacity={0.4} scale={30} blur={2} far={4} />
      </Canvas>
    </div>
  );
}

function FurnitureAsset({
  modelUrl,
  widthFeet,
  depthFeet,
  heightFeet,
  color,
}: {
  modelUrl?: string;
  widthFeet: number;
  depthFeet: number;
  heightFeet: number;
  color: string;
}) {
  const FLOOR_SNAP_OFFSET = 0.02;
  const [sourceScene, setSourceScene] = useState<Object3D | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl) return;

    let active = true;

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      modelUrl,
      (gltf) => {
        if (!active) return;
        gltf.scene.userData.__modelUrl = modelUrl;
        setSourceScene(gltf.scene);
        setFailedUrl((prev) => (prev === modelUrl ? null : prev));
      },
      undefined,
      (error) => {
        console.error("GLB load error:", modelUrl, error);
        if (!active) return;
        setFailedUrl(modelUrl);
      }
    );

    return () => {
      active = false;
      dracoLoader.dispose();
    };
  }, [modelUrl]);

  const preparedModel = useMemo(() => {
    if (!modelUrl || !sourceScene || sourceScene.userData.__modelUrl !== modelUrl) {
      return null;
    }

    const cloned = sourceScene.clone(true);
    const tintColor = new Color(color);

    // Auto-orient imported assets (e.g., Z-up exports) to match target width/depth/height.
    let bestRotation: [number, number, number] = [0, 0, 0];
    let bestScore = Number.POSITIVE_INFINITY;
    const targetWidthDepthRatio = widthFeet / Math.max(depthFeet, 1e-3);
    const targetHeightRatio = heightFeet / Math.max((widthFeet + depthFeet) / 2, 1e-3);

    for (const rx of ORIENTATION_STEPS) {
      for (const ry of ORIENTATION_STEPS) {
        for (const rz of ORIENTATION_STEPS) {
          cloned.rotation.set(rx, ry, rz);
          cloned.updateMatrixWorld(true);

          const candidateBounds = new Box3().setFromObject(cloned);
          const candidateSize = candidateBounds.getSize(new Vector3());
          const sizeX = Math.max(candidateSize.x, 1e-3);
          const sizeY = Math.max(candidateSize.y, 1e-3);
          const sizeZ = Math.max(candidateSize.z, 1e-3);

          const widthDepthRatio = sizeX / sizeZ;
          const heightRatio = sizeY / Math.max((sizeX + sizeZ) / 2, 1e-3);
          const ratioScore =
            Math.abs(Math.log(widthDepthRatio / targetWidthDepthRatio)) +
            Math.abs(Math.log(heightRatio / targetHeightRatio));

          // Light tie-breaker so we don't rotate unnecessarily when multiple fits are similar.
          const rotationPenalty =
            (rx !== 0 ? 0.005 : 0) + (rz !== 0 ? 0.005 : 0) + (ry !== 0 ? 0.001 : 0);
          const score = ratioScore + rotationPenalty;

          if (score < bestScore) {
            bestScore = score;
            bestRotation = [rx, ry, rz];
          }
        }
      }
    }

    cloned.rotation.set(bestRotation[0], bestRotation[1], bestRotation[2]);
    cloned.updateMatrixWorld(true);

    cloned.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Ensure per-instance color edits don't mutate shared GLTF materials.
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => {
          const next = (mat as Material).clone();
          if (isColorableMaterial(next)) {
            next.color = next.color.clone();
            next.color.lerp(tintColor, 0.85);
          }
          return next;
        });
      } else if (mesh.material) {
        const next = (mesh.material as Material).clone();
        if (isColorableMaterial(next)) {
          next.color = next.color.clone();
          next.color.lerp(tintColor, 0.85);
        }
        mesh.material = next;
      }
    });

    // 1) Ground + center the source model in local space.
    const baseBounds = new Box3().setFromObject(cloned);
    const baseCenter = baseBounds.getCenter(new Vector3());
    cloned.position.x -= baseCenter.x;
    cloned.position.z -= baseCenter.z;
    cloned.position.y -= baseBounds.min.y;

    // 2) Compute size after centering and scale to requested footprint/height.
    const centeredBounds = new Box3().setFromObject(cloned);
    const centeredSize = centeredBounds.getSize(new Vector3());
    const safeX = centeredSize.x > 0 ? centeredSize.x : 1;
    const safeY = centeredSize.y > 0 ? centeredSize.y : 1;
    const safeZ = centeredSize.z > 0 ? centeredSize.z : 1;

    const scaleX = widthFeet / safeX;
    const scaleY = heightFeet / safeY;
    const scaleZ = depthFeet / safeZ;
    cloned.scale.set(
      cloned.scale.x * scaleX,
      cloned.scale.y * scaleY,
      cloned.scale.z * scaleZ
    );

    // 3) Re-ground after scaling to eliminate any float caused by transforms.
    const finalBounds = new Box3().setFromObject(cloned);
    cloned.position.y -= finalBounds.min.y + FLOOR_SNAP_OFFSET;

    return cloned;
  }, [modelUrl, sourceScene, widthFeet, heightFeet, depthFeet, color]);

  if (!preparedModel || !modelUrl || failedUrl === modelUrl) {
    return (
      <mesh position={[0, heightFeet / 2 - FLOOR_SNAP_OFFSET, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthFeet, heightFeet, depthFeet]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    );
  }

  return <primitive object={preparedModel} />;
}

function CameraZoomSync({
  zoom,
  distance,
  controlsRef,
}: {
  zoom: number;
  distance: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const target = controls.target.clone();
    const direction = controls.object.position.clone().sub(target).normalize();
    const nextDistance = distance / zoom;
    controls.object.position.copy(target.add(direction.multiplyScalar(nextDistance)));
    controls.update();
  }, [zoom, distance, controlsRef]);

  return null;
}

function POVWalls({
  roomWidth,
  roomLength,
  wallHeight,
  wallColor,
}: {
  roomWidth: number;
  roomLength: number;
  wallHeight: number;
  wallColor: string;
}) {
  const WALL_THICKNESS = 0.5;
  const frontWallRef = useRef<Mesh>(null);
  const backWallRef = useRef<Mesh>(null);
  const leftWallRef = useRef<Mesh>(null);
  const rightWallRef = useRef<Mesh>(null);

  useFrame((state) => {
    const { x, z } = state.camera.position;
    const hideWall =
      Math.abs(z) >= Math.abs(x)
        ? z >= 0
          ? "front"
          : "back"
        : x >= 0
          ? "right"
          : "left";

    if (frontWallRef.current) frontWallRef.current.visible = hideWall !== "front";
    if (backWallRef.current) backWallRef.current.visible = hideWall !== "back";
    if (leftWallRef.current) leftWallRef.current.visible = hideWall !== "left";
    if (rightWallRef.current) rightWallRef.current.visible = hideWall !== "right";
  });

  return (
    <group>
      <mesh ref={backWallRef} position={[0, 0, -(roomLength / 2 + WALL_THICKNESS / 2)]} receiveShadow>
        <boxGeometry args={[roomWidth, wallHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={frontWallRef} position={[0, 0, roomLength / 2 + WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, wallHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={leftWallRef} position={[-(roomWidth / 2 + WALL_THICKNESS / 2), 0, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, wallHeight, roomLength]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={rightWallRef} position={[roomWidth / 2 + WALL_THICKNESS / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, wallHeight, roomLength]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}
