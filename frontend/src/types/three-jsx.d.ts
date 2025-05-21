import type { ThreeElements } from '@react-three/fiber'
import type { DreiElements } from '@react-three/drei'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements, DreiElements {}
  }
}
