import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ResonanceScene({ onEnd }) {
  const mount = useRef(null)

  useEffect(() => {
    /* === SCENE === */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x05040a)

    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(devicePixelRatio)
    mount.current.appendChild(renderer.domElement)

    /* === POINT CLOUD === */
    const COUNT = 12000
    const base = new Float32Array(COUNT * 3)
    const pos = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      base[i*3]   = (Math.random() - 0.5) * 5
      base[i*3+1] = (Math.random() - 0.5) * 5
      base[i*3+2] = (Math.random() - 0.5) * 5

      pos[i*3]   = base[i*3]
      pos[i*3+1] = base[i*3+1]
      pos[i*3+2] = base[i*3+2]
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))

    const mat = new THREE.PointsMaterial({
      color: 0xb48cff,
      size: 0.03,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    /* === AUDIO === */
    const listener = new THREE.AudioListener()
    camera.add(listener)
    listener.context.resume()

    const loader = new THREE.AudioLoader()

    const music = new THREE.Audio(listener)
    const analyser = new THREE.AudioAnalyser(music, 128)

    loader.load("/audio/music/m01.mp3", buffer => {
      music.setBuffer(buffer)
      music.setLoop(true)
      music.setVolume(0.7)
      music.play()
    })

    /* === ANIMATION === */
    let t = 0
    let alive = true

    function animate() {
      if (!alive) return
      requestAnimationFrame(animate)

      t += 0.01

      // 🔑 audio OU temps → jamais zéro
      const freq = analyser.getAverageFrequency() / 256
      const energy = Math.max(freq, 0.15)

      const arr = geo.attributes.position.array
      for (let i = 0; i < COUNT; i++) {
        const ix = i*3, iy = i*3+1, iz = i*3+2

        arr[ix] = base[ix] + Math.sin(t + base[iy]) * energy
        arr[iy] = base[iy] + Math.cos(t + base[ix]) * energy
        arr[iz] = base[iz] + Math.sin(t * 0.5 + i) * energy * 0.5
      }

      geo.attributes.position.needsUpdate = true

      points.rotation.y += 0.002
      mat.size = 0.02 + energy * 0.04
      mat.opacity = 0.5 + energy * 0.4

      renderer.render(scene, camera)
    }

    animate()

    /* === FIN === */
    const end = setTimeout(() => {
      alive = false
      music.stop()
      mount.current.removeChild(renderer.domElement)
      onEnd?.()
    }, 60000)

    return () => {
      alive = false
      clearTimeout(end)
      renderer.dispose()
    }
  }, [])

  return <div className="threeScene" ref={mount} />
}