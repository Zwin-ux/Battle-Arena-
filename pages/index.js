import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import Link from 'next/link'

const OceanExperience = dynamic(() => import('../components/OceanExperience'), { ssr: false })

export default function Home() {
  return (
    <>
      <Canvas>
        <OceanExperience />
        <Html center>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link href="/particles" style={{ color: 'white', padding: '0.5rem 1rem', background: '#006994', borderRadius: '4px' }}>
              Particle Trail
            </Link>
          </div>
        </Html>
      </Canvas>
    </>
  )
}
