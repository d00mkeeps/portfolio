import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import styles from './BlogPost.module.css'


const postModules = import.meta.glob('../posts/*.mdx', { eager: true })

function estimateReadingTime(raw) {
  const WPS = 238
  const words = raw.trim().split(/\s+/).length
  return Math.ceil(words / WPS)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function AppStoreBadge({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.appStoreBadge} style={{ textDecoration: 'none' }}>
      <img
        src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-gb?size=250x83"
        alt="Download on the App Store"
        style={{ height: 40, width: 'auto', display: 'block', borderRadius: 6, border: 'none' }}
      />
    </a>
  )
}

function WhatsAppBadge({ url }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        height: 40,
        borderRadius: 6,
        border: '1px solid #A6A6A6',
        backgroundColor: '#000',
        padding: '0 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        boxSizing: 'border-box',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        style={{ height: 20, width: 20, fill: '#25D366', display: 'block' }}
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 512l145.4-38.1c32.7 17.8 69.4 27.2 106.8 27.2 122.4 0 222-99.6 222-222 0-59.3-23.2-115-65.1-157c-8.1-8.1-16.2-16.2-24.3-24.3zM223.9 446c-33.1 0-65.6-8.9-94-25.7l-8.5-5-86.7 22.7 23.1-84.5-5.5-8.7c-18.4-29.4-28.2-63.3-28.2-98.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.7-186.6 184.7zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
        <span style={{ fontSize: 8, color: '#a6a6a6', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 500 }}>Join community on</span>
        <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>WhatsApp</span>
      </div>
    </a>
  )
}

function ClearBoxCubeStill() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const width = 40
    const height = 40

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 2.8)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio || 1)

    const mount = mountRef.current
    mount.innerHTML = ''
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(3, 4, 3)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x2563eb, 2.5, 10)
    fillLight.position.set(-2, -1, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x6ab0ff, 0.5)
    rimLight.position.set(-2, 1, -3)
    scene.add(rimLight)

    // Geometry and materials
    const outerGeom = new RoundedBoxGeometry(1.1, 1.1, 1.1, 6, 0.12)
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.35,
      transmission: 0,
      thickness: 0,
      ior: 1.5,
      side: THREE.DoubleSide,
    })

    const cube = new THREE.Mesh(outerGeom, outerMat)
    cube.rotation.order = 'YXZ'
    cube.rotation.x = -0.15
    cube.rotation.y = -0.35
    cube.rotation.z = 0
    scene.add(cube)

    // Inner "Core" Cube
    const innerGeom = new RoundedBoxGeometry(0.55, 0.55, 0.55, 6, 0.08)
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
    innerCube.rotation.x = -0.15
    innerCube.rotation.y = -0.65
    innerCube.rotation.z = 0
    scene.add(innerCube)

    // Render a single frame
    renderer.render(scene, camera)

    return () => {
      if (mount) {
        mount.innerHTML = ''
      }
      renderer.dispose()
      outerGeom.dispose()
      outerMat.dispose()
      innerGeom.dispose()
      innerMat.dispose()
    }
  }, [])

  return <div ref={mountRef} className={styles.cubeCanvasStill} />
}

export default function BlogPost() {
  const { slug } = useParams()
  const mod = postModules[`../posts/${slug}.mdx`]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [slug])

  if (!mod) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className="container">
            <p className={styles.notFound}>Post not found.</p>
            <Link to="/blog" className={styles.back}>← back to blog</Link>
          </div>
        </main>
      </>
    )
  }

  const Content = mod.default
  const { title, date, summary, appStoreUrl, tags } = mod.frontmatter ?? {}
  const minutes = estimateReadingTime(mod.raw ?? '')

  return (
    <>
      <Nav />
      <main className={`${styles.main} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <Link to="/blog" className={styles.back}>← back</Link>

          <header className={styles.header}>
            {date && <time className={styles.date}>{formatDate(date)}</time>}
            <span className={styles.readingTime}>{minutes} min read</span>
            <h1 className={styles.title}>{title}</h1>
            {summary && <p className={styles.summary}>{summary}</p>}
          </header>

          <article className={styles.prose}>
            <Content />
          </article>

          {appStoreUrl && (
            <div className={styles.appStoreWrap}>
              {tags?.includes('clear-box') && <ClearBoxCubeStill />}
              <AppStoreBadge url={appStoreUrl} />
              {tags?.includes('clear-box') && <WhatsAppBadge url="https://chat.whatsapp.com/JnC7ZgUXzKlCE0Du4ga11Y" />}
            </div>
          )}
        </div>
      </main>
    </>
  )
}