import { ThreeElements } from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        mesh: any;
        planeGeometry: any;
        primitive: any;
        group: any;
      }
    }
  }
}
