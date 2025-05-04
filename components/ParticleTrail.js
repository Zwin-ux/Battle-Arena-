import { useRef, useState } from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import { useFrame } from '@react-three/fiber'

export default function ParticleTrail() {
  const particles = useRef()
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }))

  useFrame((state, delta) => {
    particles.current.rotation.x -= delta / 10
    particles.current.rotation.y -= delta / 15
  })

  return (
    <group position={[0, 0, -10]}>
      <Points ref={particles} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent
          color="#ffa0e0"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}
