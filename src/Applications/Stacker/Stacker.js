"use strict"
import {Canvas, useLoader} from "@react-three/fiber"
import {OrbitControls, Environment, Stats, useTexture, Sky, useGLTF} from "@react-three/drei"
import {Physics, usePlane, useCylinder, useBox} from "@react-three/cannon"

import * as THREE from "three"
import {Suspense, useMemo, useRef} from "react"

const EndCap = ({OD, position, rotation}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Endcap outer straight wall*/}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <ringBufferGeometry attach="geometry" args={[OD - 0.01, OD, 32]} castShadow receiveShadow />
        <meshPhysicalMaterial attach="material" color="#050505" side={THREE.BackSide} clearcoat={0.1} roughness={0.8} clearcoatRoughness={0.5} />
      </mesh>

      {/* Endcap inner cone wall*/}
      <mesh position={[0, 0, 0]}>
        <cylinderBufferGeometry attach="geometry" args={[OD - 0.01, OD - 0.02, 0.4, 32, true, true]} castShadow receiveShadow />
        <meshPhysicalMaterial attach="material" color="#050505" side={THREE.BackSide} clearcoat={0.1} roughness={0.8} clearcoatRoughness={0.5} />
      </mesh>

      {/* Endcap inner wall*/}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <circleBufferGeometry attach="geometry" args={[OD - 0.02, 32]} castShadow receiveShadow />
        <meshPhysicalMaterial attach="material" color="#050505" side={THREE.BackSide} clearcoat={0.1} roughness={0.8} clearcoatRoughness={0.5} />
      </mesh>
    </group>
  )
}

const pipeCoatedMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#112d3d").convertSRGBToLinear(),
  roughness: 0.8,
  metalness: 0.3,
})

const pipeRustyMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#663300").convertSRGBToLinear(),
  roughness: 0.5,
  metalness: 0.5,
})

const normalPipeGeometry = new THREE.CylinderBufferGeometry(0.965 / 2, 0.965 / 2, 11.2 - 0.6, 32, 1, 1)
const normalPipeEndGeometry = new THREE.CylinderBufferGeometry(0.965 / 2, 0.965 / 2, 0.3, 32, 1, 1)
const normalPipeEndWallGeometry = new THREE.RingBufferGeometry(0.965 / 2 - 0.032, 0.965 / 2, 32) // 0.032 = Thickness 0.965 = OD

class EndCapMesh {
  constructor(OD, innerOD, backside) {
    this.OD = OD
    this.innerOD = innerOD
    this.backside = backside
  }

  OuterWall = new THREE.RingBufferGeometry(this.OD - 0.005, this.OD, 32)
  InnerConeWall = new THREE.CylinderBufferGeometry(this.OD - 0.01, this.OD - 0.02, 0.4, 32, 1, 1)
  InnerWall = new THREE.CircleBufferGeometry(this.OD - 0.02, 32)
}

// Declaration of half pipe, to make instances, and rendering stage determines final length. Each pipe made of 2 half parts
class PipeMesh {
  constructor(OD, minLength, maxLength, thickness, coated, hasEndCaps, coatingColor, uncoatedColor, uncoatedEndLength) {
    this.OD = OD || 0.965
    this.minLength = minLength || 11
    this.maxLength = maxLength || 13
    this.thickness = thickness || 0.032
    this.coated = coated || false
    this.coatingColor = coatingColor || "#112d3d" // dark blue
    this.uncoatedColor = uncoatedColor || "#663300" // rusty
    this.uncoatedEndLength = uncoatedEndLength || 0
    this.hasEndCaps = hasEndCaps || false
    if (!coated) this.uncoatedEndLength = 0
  }

  Geometry = new THREE.CylinderBufferGeometry(this.OD / 2, this.OD / 2, this.maxLength / 2 - this.uncoatedEndLength, 32, 1, 1)
  EndGeometry = !this.coated && new THREE.CylinderBufferGeometry(this.OD / 2, this.OD / 2, this.uncoatedEndLength, 32, 1, 1) // "Rusty" part
  PipeEndWallGeometry = new THREE.RingBufferGeometry(this.OD / 2 - this.thickness, this.OD / 2, 32) // 0.032 = Thickness 0.965 = OD

  CoatedMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(this.coatingColor).convertSRGBToLinear(),
    roughness: 0.8,
    metalness: 0.3,
  })
  UncoatedMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(this.uncoatedColor).convertSRGBToLinear(),
    roughness: 0.5,
    metalness: 0.5,
  })
}

let asd = new PipeMesh()
asd.asds = "12123"

const Pipe = ({OD, length, thickness, endcaps, position, rotation, coated, stripe, ropes}) => {
  const ropeTexture = useTexture("/rope.jpg")
  ropeTexture.wrapS = ropeTexture.wrapT = THREE.RepeatWrapping
  ropeTexture.repeat.set(0.6, 0.6)
  thickness = thickness || 0.2
  length = length || 12
  OD = OD / 2 || 0.812
  const [ref] = useCylinder(() => ({
    mass: 1000,
    rotation: rotation,
    position: [position[0], OD + position[1], position[2]],
    args: [OD + 0.01, OD + 0.01, length, 32],
  })) // Collision model
  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow geometry={normalPipeGeometry} material={pipeCoatedMaterial} />
      <mesh position={[0, (length - 0.3) / 2, 0]} castShadow receiveShadow material={pipeRustyMaterial} geometry={normalPipeEndGeometry} />
      <mesh position={[0, -(length - 0.3) / 2, 0]} castShadow receiveShadow material={pipeRustyMaterial} geometry={normalPipeEndGeometry} />
      <mesh
        position={[0, length / 2, 0]}
        rotation={[Math.PI / 2, Math.PI, 0]}
        castShadow
        receiveShadow
        material={pipeRustyMaterial}
        geometry={normalPipeEndWallGeometry}
      />
      <mesh
        position={[0, -length / 2, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={pipeRustyMaterial}
        geometry={normalPipeEndWallGeometry}
      />
      {!endcaps ? (
        <mesh castShadow receiveShadow>
          <cylinderBufferGeometry attach="geometry" args={[OD - thickness, OD - thickness, length, 32, true, true]} />
          <meshStandardMaterial attach="material" color="#663300" side={THREE.BackSide} roughness={0.5} metalness={0.5} />
        </mesh>
      ) : (
        <>
          <EndCap OD={OD - thickness + 0.01} position={[0, length / 2 - 0.199, 0]} rotation={[0, 0, 0]} />
          <EndCap OD={OD - thickness + 0.01} position={[0, -length / 2 + 0.199, 0]} rotation={[Math.PI, 0, 0]} />
        </>
      )}
      {stripe && (
        <mesh position={[0, length / 3, 0]} castShadow receiveShadow>
          <cylinderBufferGeometry attach="geometry" args={[OD + 0.001, OD + 0.001, 0.115, 32, true, true]} />
          <meshStandardMaterial attach="material" color={stripe} roughness={1} metalness={0} />
        </mesh>
      )}
      {ropes && (
        <group>
          <mesh position={[0, length / 2.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <torusBufferGeometry attach="geometry" args={[OD + 0.025, 0.025, 32, 32]} />
            <meshStandardMaterial attach="material" color={"#ff8080"} map={ropeTexture} roughness={1} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <torusBufferGeometry attach="geometry" args={[OD + 0.025, 0.025, 32, 32]} />
            <meshStandardMaterial attach="material" color={"#ff8080"} map={ropeTexture} roughness={1} />
          </mesh>
          <mesh position={[0, -length / 2.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <torusBufferGeometry attach="geometry" args={[OD + 0.025, 0.025, 32, 32]} />
            <meshStandardMaterial attach="material" color={"#ff8080"} map={ropeTexture} roughness={1} />
          </mesh>
        </group>
      )}
    </group>
  )
}

const Plane = () => {
  const sandTexture = useTexture("/desert-sand.jpg")
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping
  sandTexture.repeat.set(80, 80)
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
  }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[2000, 2000]} />
      <meshPhysicalMaterial attach="material" map={sandTexture} color="#eccf79" />
    </mesh>
  )
}

const Berm = ({position, rotation, length}) => {
  const [ref] = usePlane(() => ({
    position: position,
    rotation: rotation,
    args: [10, 10],
  }))
  return (
    <group ref={ref}>
      <mesh>
        <planeBufferGeometry attach="geometry" args={[10, 10]} />
        <meshPhysicalMaterial attach="material" color="#000000" />
      </mesh>
    </group>
  )
}

const LightTower = props => {
  const lightTowerMap = useTexture("/floodlight_generator.png")
  lightTowerMap.flipY = false
  const ref = useRef()
  const {nodes} = useGLTF("/lighttower.gltf")
  return (
    <group ref={ref} dispose={null} {...props}>
      <mesh castShadow receiveShadow metalness={0} geometry={nodes.Cadnavcom_B1128299.geometry} material={nodes.Cadnavcom_B1128299.material}>
        <meshStandardMaterial opacity={1} map={lightTowerMap} />
      </mesh>
    </group>
  )
}

const Scene = () => {
  useGLTF.preload("/lighttower.gltf")
  return (
    <Canvas shadows gl={{alpha: false}} camera={{position: [20, 10, 30], fov: 50}} flat mode="concurrent" style={{height: "100%"}}>
      <fog attach="fog" args={["white", 10, 500]} />
      <directionalLight
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        intensity={1.5}
        castShadow
        position={[90, 100, 30]}
      />
      <Suspense fallback={null}>
        <Physics allowSleep={true} iterations={10}>
          <LightTower scale={0.023} position={[8, 0, 0]} />
          <Plane />
          {/*<Berm position={[4, 4, 4]} rotation={[-Math.PI/ 2, 0, 0]} length={20}/>*/}

          <Pipe
            ropes={true}
            stripe={"#660000"}
            coated={"#112d3b"}
            OD={0.965}
            thickness={0.032}
            length={11.2}
            endcaps={true}
            position={[7.3, 10, 10]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Pipe
            ropes={true}
            stripe={"#660000"}
            coated={"#112d3b"}
            OD={0.965}
            thickness={0.032}
            length={11.2}
            endcaps={true}
            position={[7, 15, 10]}
            rotation={[Math.PI / 2, 14, 100]}
          />
          <Pipe
            ropes={true}
            stripe={"#660000"}
            coated={"#112d3b"}
            OD={0.965}
            thickness={0.032}
            length={11.2}
            endcaps={true}
            position={[7.3, 12.5, 10]}
            rotation={[Math.PI / 2, 0, 200]}
          />
        </Physics>
        <Environment files="/desert.hdr" />
        <Sky distance={450000} sunPosition={[90, 100, 30]} />
      </Suspense>
      <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.05} />
      {/*<gridHelper args={[100, 100]} />*/}
    </Canvas>
  )
}

const Stacker = () => {
  return <Scene />
}

export default Stacker
