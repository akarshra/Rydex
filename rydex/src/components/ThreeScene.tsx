"use client"

"use client";

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Mesh } from "three"

function RotatingBox() {
  const mesh = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta
      mesh.current.rotation.y += delta
    }
  })

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  )
}

export default function ThreeScene() {
  return (
    <div className="h-96 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <RotatingBox />
      </Canvas>
    </div>
  )
}
