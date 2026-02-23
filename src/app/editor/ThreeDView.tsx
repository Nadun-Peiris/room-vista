"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import { Box3, Color, Group, Vector3, type Material, type Mesh, type Object3D } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const Y_ORIENTATION_STEPS = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
type ColorableMaterial = Material & { color: Color };

const isColorableMaterial = (material: Material): material is ColorableMaterial =>
  "color" in material && material.color instanceof Color;

const getMeshBounds = (object: Object3D) => {
  const bounds = new Box3();
  let hasMesh = false;

  object.updateMatrixWorld(true);
  object.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;

    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    const geometryBounds = mesh.geometry.boundingBox;
    if (!geometryBounds) return;

    const transformed = geometryBounds.clone();
    transformed.applyMatrix4(mesh.matrixWorld);
    bounds.union(transformed);
    hasMesh = true;
  });

  return hasMesh ? bounds : null;
};

const flattenSceneMeshes = (scene: Object3D) => {
  const flatGroup = new Group();
  scene.updateMatrixWorld(true);

  scene.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;

    const flatMesh = mesh.clone();
    flatMesh.geometry = mesh.geometry.clone();
    flatMesh.geometry.applyMatrix4(mesh.matrixWorld);
    flatMesh.position.set(0, 0, 0);
    flatMesh.rotation.set(0, 0, 0);
    flatMesh.scale.set(1, 1, 1);
    flatMesh.updateMatrixWorld(true);
    flatGroup.add(flatMesh);
  });

  return flatGroup.children.length > 0 ? flatGroup : (scene.clone(true) as Object3D);
};

const getSupportPlaneY = (object: Object3D, percentile = 0.02) => {
  const ys: number[] = [];
  const vertex = new Vector3();
  object.updateMatrixWorld(true);

  object.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const position = mesh.geometry.getAttribute("position");
    if (!position) return;

    const stride = Math.max(1, Math.ceil(position.count / 2000));
    for (let i = 0; i < position.count; i += stride) {
      vertex.set(position.getX(i), position.getY(i), position.getZ(i));
      vertex.applyMatrix4(mesh.matrixWorld);
      ys.push(vertex.y);
    }
  });

  if (ys.length === 0) return 0;
  ys.sort((a, b) => a - b);
  const clampedPercentile = Math.max(0, Math.min(1, percentile));
  const idx = Math.min(ys.length - 1, Math.floor((ys.length - 1) * clampedPercentile));
  return ys[idx];
};

interface ThreeDProps {
  roomWidthFeet: number;
  roomLengthFeet: number;
  wallHeightFeet: number;
  furniture: FurnitureItem3D[];
  furnitureLibrary: FurnitureLibraryItem3D[];
  wallColor: string;
  floorColor: string;
  lightIntensity: number;
  selectedFurnitureId?: string | null;
  onSelectFurniture?: (id: string | null) => void;
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
  shadeIntensity?: number;
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
  selectedFurnitureId = null,
  onSelectFurniture,
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
      <Canvas
        shadows
        camera={{ position: [15, 15, 15], fov: 50 }}
        onPointerMissed={() => onSelectFurniture?.(null)}
      >
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
          // Konva rotates around the rect origin (top-left), so convert to rotated center first.
          const theta = (item.rotation * Math.PI) / 180;
          const localCenterX = widthPx / 2;
          const localCenterY = depthPx / 2;
          const rotatedCenterX = item.x + localCenterX * Math.cos(theta) - localCenterY * Math.sin(theta);
          const rotatedCenterY = item.y + localCenterX * Math.sin(theta) + localCenterY * Math.cos(theta);

          const xPos = rotatedCenterX / pixelsPerFoot - roomWidth / 2;
          const zPos = rotatedCenterY / pixelsPerFoot - roomLength / 2;
          const widthFeet = widthPx / pixelsPerFoot;
          const depthFeet = depthPx / pixelsPerFoot;
          
          return (
            <group
              key={item.id}
              position={[xPos, roomBaseY, zPos]}
              rotation={[0, -item.rotation * Math.PI / 180, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFurniture?.(item.id);
              }}
            >
              {selectedFurnitureId === item.id && (
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[widthFeet, depthFeet]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.2} depthWrite={false} />
                </mesh>
              )}
              <FurnitureAsset
                modelUrl={modelUrl}
                widthFeet={widthFeet}
                depthFeet={depthFeet}
                heightFeet={itemHeightFeet}
                shadeIntensity={typeof item.shadeIntensity === "number" ? item.shadeIntensity : 0.5}
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
  shadeIntensity,
  color,
}: {
  modelUrl?: string;
  widthFeet: number;
  depthFeet: number;
  heightFeet: number;
  shadeIntensity: number;
  color: string;
}) {
  const FLOOR_CONTACT_EPSILON = 0.05;
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

    const sourceClone = sourceScene.clone(true);
    const cloned = flattenSceneMeshes(sourceClone);
    const tintColor = new Color(color);
    const clampedShade = Math.max(0, Math.min(1, shadeIntensity));

    // Keep furniture upright and only rotate around Y.
    let bestYRotation = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    cloned.rotation.set(0, 0, 0);
    cloned.updateMatrixWorld(true);

    const targetWidthDepthRatio = widthFeet / Math.max(depthFeet, 1e-3);

    for (const ry of Y_ORIENTATION_STEPS) {
      cloned.rotation.set(0, ry, 0);
      cloned.updateMatrixWorld(true);

      const candidateBounds = getMeshBounds(cloned) ?? new Box3().setFromObject(cloned);
      const candidateSize = candidateBounds.getSize(new Vector3());
      const sizeX = Math.max(candidateSize.x, 1e-3);
      const sizeZ = Math.max(candidateSize.z, 1e-3);

      const widthDepthRatio = sizeX / sizeZ;
      const ratioScore = Math.abs(Math.log(widthDepthRatio / targetWidthDepthRatio));
      const rotationPenalty = ry !== 0 ? 0.002 : 0;
      const score = ratioScore + rotationPenalty;

      if (score < bestScore) {
        bestScore = score;
        bestYRotation = ry;
      }
    }

    cloned.rotation.set(0, bestYRotation, 0);
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
            next.color.multiplyScalar(1 - clampedShade * 0.18);
          }
          if ("roughness" in next && typeof next.roughness === "number") {
            next.roughness = Math.max(0.1, Math.min(1, 0.95 - clampedShade * 0.6));
          }
          if ("metalness" in next && typeof next.metalness === "number") {
            next.metalness = Math.max(0, Math.min(1, 0.05 + clampedShade * 0.2));
          }
          return next;
        });
      } else if (mesh.material) {
        const next = (mesh.material as Material).clone();
        if (isColorableMaterial(next)) {
          next.color = next.color.clone();
          next.color.lerp(tintColor, 0.85);
          next.color.multiplyScalar(1 - clampedShade * 0.18);
        }
        if ("roughness" in next && typeof next.roughness === "number") {
          next.roughness = Math.max(0.1, Math.min(1, 0.95 - clampedShade * 0.6));
        }
        if ("metalness" in next && typeof next.metalness === "number") {
          next.metalness = Math.max(0, Math.min(1, 0.05 + clampedShade * 0.2));
        }
        mesh.material = next;
      }
    });

    // 1) Ground + center the source model in local space.
    const baseBounds = getMeshBounds(cloned) ?? new Box3().setFromObject(cloned);
    const baseCenter = baseBounds.getCenter(new Vector3());
    cloned.position.x -= baseCenter.x;
    cloned.position.z -= baseCenter.z;
    cloned.position.y -= baseBounds.min.y;

    // 2) Compute size after centering and scale to requested footprint/height.
    const centeredBounds = getMeshBounds(cloned) ?? new Box3().setFromObject(cloned);
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

    // 3) Final floor snap using a low-percentile support plane.
    // This ignores tiny outlier vertices that can make visible geometry hover.
    const supportY = getSupportPlaneY(cloned, 0.001);
    cloned.position.y -= supportY + FLOOR_CONTACT_EPSILON;

    return cloned;
  }, [modelUrl, sourceScene, widthFeet, heightFeet, depthFeet, shadeIntensity, color, FLOOR_CONTACT_EPSILON]);

  if (!preparedModel || !modelUrl || failedUrl === modelUrl) {
    return (
      <mesh position={[0, heightFeet / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthFeet, heightFeet, depthFeet]} />
        <meshStandardMaterial
          color={color}
          roughness={Math.max(0.1, Math.min(1, 0.95 - shadeIntensity * 0.6))}
          metalness={Math.max(0, Math.min(1, 0.05 + shadeIntensity * 0.2))}
        />
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
