import * as React from 'react';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      mesh: any;
      sphereGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      torusGeometry: any;
      coneGeometry: any;
      planeGeometry: any;
      ringGeometry: any;
      meshStandardMaterial: any;
      meshPhongMaterial: any;
      meshBasicMaterial: any;
      bufferGeometry: any;
      float32BufferAttribute: any;
      points: any;
      pointsMaterial: any;
      orbitControls: any;
    }
  }
}
