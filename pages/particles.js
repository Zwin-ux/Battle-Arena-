import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'

const ParticleTrail = dynamic(() => import('../components/ParticleTrail'), { ssr: false })

export default function ParticlePage() {
  return (
    <Canvas>
      <ParticleTrail />
    </Canvas>
  )
}
