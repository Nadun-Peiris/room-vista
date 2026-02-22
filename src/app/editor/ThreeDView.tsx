"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import type { Mesh } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ThreeDProps {
  roomWidthFeet: number;
  roomHeightFeet: number;
  furniture: any[];
  wallColor: string;
  floorColor: string;
  lightIntensity: number;
  zoom?: number;
}

interface FurnitureItem3D {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export default function ThreeDView({
  roomWidthFeet,
  roomHeightFeet,
  furniture,
  wallColor,
  floorColor,
  lightIntensity,
  zoom = 1,
}: ThreeDProps) {
  const roomWidth = roomWidthFeet;
  const roomHeight = roomHeightFeet;
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const baseDistance = Math.max(roomWidth, roomHeight) * 2;

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
          position={[0, 0.01, 0]} 
          args={[roomWidth, roomHeight]} 
          sectionSize={1} 
          cellSize={1} 
          cellColor="#cbd5e1" 
          sectionColor="#94a3b8" 
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* FLOOR */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[roomWidth, roomHeight]} />
          <meshStandardMaterial color={floorColor} />
        </mesh>

        {/* WALLS - Styled as frosted glass for a premium look */}
        <POVWalls roomWidth={roomWidth} roomHeight={roomHeight} wallColor={wallColor} />

        {/* FURNITURE */}
        {furniture.map((item) => {
          // Math correction: 2D maps from top-left, 3D maps from center.
          // We divide by 60 because your 2D grid uses 60 pixels per foot.
          const xPos = (item.x + item.width / 2) / 60 - roomWidth / 2;
          const zPos = (item.y + item.height / 2) / 60 - roomHeight / 2;
          const widthFeet = item.width / 60;
          const depthFeet = item.height / 60;
          
          return (
            <mesh
              key={item.id}
              position={[
                xPos,
                (item.heightFeet || 1) / 2,
                zPos
              ]}
              rotation={[0, -item.rotation * Math.PI / 180, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[widthFeet, item.heightFeet || 1, depthFeet]} />
              <meshStandardMaterial 
                color={item.fill} 
                roughness={0.3} // Gives it a nice matte finish
              />
            </mesh>
          );
        })}

        {/* Soft contact shadows underneath furniture */}
        <ContactShadows position={[0, 0.02, 0]} opacity={0.4} scale={30} blur={2} far={4} />
      </Canvas>
    </div>
  );
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
  roomHeight,
  wallColor,
}: {
  roomWidth: number;
  roomHeight: number;
  wallColor: string;
}) {
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
      <mesh ref={backWallRef} position={[0, 1.5, -roomHeight / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, 3, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={frontWallRef} position={[0, 1.5, roomHeight / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, 3, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={leftWallRef} position={[-roomWidth / 2, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3, roomHeight]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh ref={rightWallRef} position={[roomWidth / 2, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3, roomHeight]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}
