import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import LinkBuilder from '../components/LinkBuilder.jsx'
import styles from './Home.module.css'

function ClearBoxCube() {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.3, 4)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(3, 4, 3)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x2563eb, 2.5, 10)
    fillLight.position.set(-2, -1, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x6ab0ff, 0.4)
    rimLight.position.set(-2, 1, -3)
    scene.add(rimLight)

    // Geometry and materials
    const outerGeom = new RoundedBoxGeometry(1.4, 1.4, 1.4, 6, 0.15)
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.35,          // Lower opacity for translucency
      transmission: 0,        // Disable transmission to rely on opacity
      thickness: 0,
      ior: 1.5,
      side: THREE.DoubleSide, // Re-enable for more depth in translucency
    })

    const cube = new THREE.Mesh(outerGeom, outerMat)
    cube.castShadow = true
    cube.rotation.order = 'YXZ'
    scene.add(cube)

    // Inner "Core" Cube
    const innerGeom = new RoundedBoxGeometry(0.7, 0.7, 0.7, 6, 0.1)
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      metalness: 0.2,
      roughness: 0.4,
      transparent: true,
      opacity: 0.6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.2,
    })

    const innerCube = new THREE.Mesh(innerGeom, innerMat)
    innerCube.rotation.order = 'YXZ'
    scene.add(innerCube)

    let frameId
    let isDragging = false
    let prevPointer = { x: 0, y: 0 }
    const interactionOffset = { x: 0, y: 0 }
    const velocity = { x: 0, y: 0 }
    let framesSinceInteraction = 0
    let baseY = 0

    const onPointerDown = (e) => {
      isDragging = true
      prevPointer = { x: e.clientX, y: e.clientY }
      framesSinceInteraction = 0
      velocity.x = 0
      velocity.y = 0
    }

    const onPointerMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevPointer.x
      const deltaY = e.clientY - prevPointer.y
      
      velocity.x = deltaY * 0.008
      velocity.y = deltaX * 0.008
      
      interactionOffset.x += velocity.x
      interactionOffset.y += velocity.y
      
      prevPointer = { x: e.clientX, y: e.clientY }
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const mount = mountRef.current
    mount.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = Date.now() * 0.001
      
      // Base passive rotation
      baseY += 0.007
      
      if (!isDragging) {
        // Momentum
        interactionOffset.x += velocity.x
        interactionOffset.y += velocity.y
        
        // Friction for momentum using Euler's number (exponential decay)
        const friction = Math.exp(-0.02)
        velocity.x *= friction
        velocity.y *= friction

        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
        
        // Hand-off: Only trigger gravitation once the slide has slowed down
        if (speed < 0.002) {
          framesSinceInteraction++
          const gravity = (1 - Math.exp(-framesSinceInteraction * 0.0003)) * 0.4
          interactionOffset.x *= (1 - gravity)
          interactionOffset.y *= (1 - gravity)
        } else {
          framesSinceInteraction = 0
        }
      } else {
        framesSinceInteraction = 0
      }

      // Apply rotations
      // Tilt reduced to 0.15 for a flatter appearance
      cube.rotation.x = 0.15 + interactionOffset.x
      cube.rotation.y = baseY + interactionOffset.y
      cube.rotation.z = interactionOffset.y * 0.1

      innerCube.rotation.x = cube.rotation.x
      innerCube.rotation.y = cube.rotation.y - (time * 0.5)
      innerCube.rotation.z = cube.rotation.z

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      if (mount) {
        mount.removeEventListener('pointerdown', onPointerDown)
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      outerGeom.dispose()
      outerMat.dispose()
      innerGeom.dispose()
      innerMat.dispose()
    }
  }, [])

  return <div ref={mountRef} className={styles.cubeCanvas} />
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Bio ── */}
          <section className={styles.bio}>
            <div className={styles.bioLines}>
              <p className={styles.bioLine}>Building software to solve problems since 2023. Two live iOS products.</p>
              <p className={styles.bioLine}>Idea to product in 6 weeks.</p>
              <p className={styles.bioLine}>Domains: AI tooling, Finance, Biology, Healthcare, B2C.</p>
              <p className={styles.bioLine}>Available from September 2027. London preferred.</p>
            </div>
            <a href="https://calendly.com/miles-i-hillary/30min" target="_blank" rel="noopener noreferrer" className={styles.bookCall}>
              book a call →
            </a>
          </section>

          <LinkBuilder />

          {/* ── Projects ── */}
          <section id="work" className={styles.projects}>
            <p className={styles.sectionLabel}>work</p>

            <div className={styles.grid}>

              {/* Clear Box — double wide */}
              <article className={`${styles.card} ${styles.cardWide} ${styles.cardClearBox}`}>
                <span className={styles.cardDate}>Jan 2026</span>
                <div className={styles.clearBoxInner}>
                  <div className={styles.clearBoxLeft}>
                    <ClearBoxCube />
                  </div>
                  <div className={styles.clearBoxRight}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardName}>Clear Box</span>
                      <span className={`${styles.cardStatus} ${styles.statusShipped}`}>iOS · pending</span>
                    </div>
                    <p className={styles.cardCopy}>
                      NHS patient non-adherence costs £500m annually. Existing apps charge money, require manual data entry, and have no intelligence layer.
                    </p>
                    <p className={styles.cardCopy}>
                      Free iOS app with barcode scanning, automatic patient leaflet ingestion, and an AI layer baked in.
                    </p>
                    <Link to="/projects/clear-box" className={styles.cardLink}>case study →</Link>
                  </div>
                </div>
              </article>

              {/* Grey Plain */}
              <article className={`${styles.card} ${styles.cardEmpty}`}>
                <span className={styles.cardDate}>Mar 2026</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardName}>Grey Plain</span>
                  <span className={`${styles.cardStatus} ${styles.statusShipped}`}>shipped</span>
                </div>
                <p className={styles.cardPlaceholder}>copy coming soon</p>
              </article>

              {/* Tax Optimiser */}
              <article className={`${styles.card} ${styles.cardEmpty}`}>
                <span className={styles.cardDate}>Dec 2025</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardName}>Tax Optimiser</span>
                  <span className={`${styles.cardStatus} ${styles.statusShipped}`}>shipped</span>
                </div>
                <p className={styles.cardPlaceholder}>copy coming soon</p>
              </article>

              {/* Crucible */}
              <article className={`${styles.card} ${styles.cardEmpty}`}>
                <span className={styles.cardDate}>Nov 2025</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardName}>Crucible</span>
                  <span className={`${styles.cardStatus} ${styles.statusShipped}`}>shipped</span>
                </div>
                <p className={styles.cardPlaceholder}>copy coming soon</p>
              </article>

              {/* Volc */}
              <article className={`${styles.card} ${styles.cardEmpty}`}>
                <span className={styles.cardDate}>Aug 2024</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardName}>Volc</span>
                  <span className={`${styles.cardStatus} ${styles.statusShipped}`}>iOS · live</span>
                </div>
                <p className={styles.cardPlaceholder}>copy coming soon</p>
              </article>

            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}