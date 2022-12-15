import { useRef, Suspense, useEffect, useState } from "react"
import React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Stars,
  useTexture,
  PerspectiveCamera,
} from "@react-three/drei"

import * as THREE from "three"

const LoginEarth = _ => {
  const Earth = _ => {
    const clouds = useTexture("/clouds.jpg")
    const cloudRef = useRef()
    const earthRef = useRef()

    useFrame((state, delta) => {
      cloudRef.current.rotation.y -= 0.0001
      earthRef.current.rotation.y -= 0.0015
    })

    const globeShaderMaterial = {
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load("/earthUvMap.jpg"),
        },
      },
      vertexShader: `
        varying vec2 vertexUV;
        varying vec3 vertexNormal;

        void main() {
          vertexUV = uv;
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D globeTexture;

        varying vec2 vertexUV;
        varying vec3 vertexNormal;

        void main() {
          float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
          vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
          gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
        }`,
    }
    const atmosphereShaderMaterial = {
      vertexShader: `
        varying vec3 vertexNormal;

        void main() {
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.01);
        }`,
      fragmentShader: `
        varying vec3 vertexNormal;

        void main() {
          float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }`,
      blending: THREE.NormalBlending,
      side: THREE.BackSide,
    }

    return (
      <>
        <mesh ref={earthRef} position={[0, 0, 0]} castShadow receiveShadow>
          <sphereBufferGeometry attach="geometry" args={[7, 50, 50]} />
          <shaderMaterial attach="material" args={[globeShaderMaterial]} />
        </mesh>
        <mesh
          position={[0, 0, 0]}
          scale={[1.1, 1.1, 1.1]}
          castShadow
          receiveShadow>
          <sphereBufferGeometry attach="geometry" args={[7, 50, 50]} />
          <shaderMaterial attach="material" args={[atmosphereShaderMaterial]} />
        </mesh>
        <mesh ref={cloudRef} position={[0, 0, 0]} castShadow receiveShadow>
          <sphereBufferGeometry attach="geometry" args={[7.07, 50, 50]} />
          <meshPhongMaterial
            castShadow
            receiveShadow
            opacity={1.1}
            depthWrite={true}
            transparent={true}
            attach="material"
            shininess={200}
            alphaMap={clouds}
            map={clouds}
          />
        </mesh>
      </>
    )
  }

  const [fallback, setFallback] = useState(false)

  return (
    <></>
    // <Canvas
    //   shadows
    //   gl={{ pixelRatio: window.devicePixelRatio, alpha: true, antialias: true }}
    //   mode="concurrent"
    //   dpr={window.devicePixelRatio}>
    //   <PerspectiveCamera
    //     makeDefault
    //     rotation={[0, 0.1, 0]}
    //     position={[0, 0, 22]}
    //     fov={50}
    //     rotateX={10}
    //   />
    //   <ambientLight intensity={1} />
    //   <directionalLight intensity={8} castShadow position={[0, 0, 3000]} />
    //   <Suspense fallback={<></>}>
    //     <Earth />
    //   </Suspense>
    //   <Stars fade radius={400} />
    // </Canvas>
  )
}

export default React.memo(LoginEarth)
