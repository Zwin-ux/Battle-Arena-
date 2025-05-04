import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'

export default function OceanExperience() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2
  })

  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Text
          font="/fonts/Inter-Bold.woff"
          fontSize={0.5}
          color="white"
          position-y={2}
          position-z={-5}
          textAlign="center"
        >
          Windsurf Museum
        </Text>
      </Float>
      
      <mesh ref={meshRef} position-y={-1}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#006994" />
      </mesh>
    </>
  )
}
