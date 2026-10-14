import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './FleetRadar.module.css'

// Factorio Space Age Biome Palettes [Dark Shadow, Low Terrain, Mid Terrain, High Terrain, Peak Accent]
const FACTORIO_PALETTES = {
  volc: ['#140703', '#7c2d12', '#c2410c', '#ea580c', '#facc15'], // Vulcanus (Molten Lava & Charred Crust)
  horizon: ['#180b26', '#4c1d95', '#b45309', '#0891b2', '#67e8f9'], // Fulgora (Amethyst Scrap & Lightning)
  clearbox: ['#04162c', '#1e3a8a', '#15803d', '#3b82f6', '#93c5fd'], // Nauvis (Deep Ocean & Lush Continents)
  observer: ['#031c10', '#14532d', '#16a34a', '#22c55e', '#86efac'], // Cyber Circuit (Phosphor Terminal)
  airwave: ['#021326', '#0369a1', '#0284c7', '#38bdf8', '#e0f2fe'], // Aquilo (Cryo Ice & Methane Frost)
  'sturdy-robot': ['#111114', '#27272a', '#52525b', '#f59e0b', '#ef4444'], // Foundry / Crucible (Tungsten & Fire)
  'now-harvester': ['#140924', '#3b0764', '#4d7c0f', '#84cc16', '#c084fc'], // Gleba (Spore Swamp & Lichen)
  portfolio: ['#1c1917', '#44403c', '#ca8a04', '#eab308', '#fef08a'], // Orbital Nexus (Brass & Solar Gold)
  'spanish-tutor': ['#200c05', '#7c2d12', '#c2410c', '#d97706', '#2dd4bf'], // Terracotta Oasis (Desert Clay)
}

// Procedural Factorio Pixel-Art Planet Renderer
function drawFactorioPixelPlanet(ctx, cx, cy, radius, slug, time) {
  const pixelSize = 2 // Chunky 2px pixel-art resolution
  const gridR = Math.max(4, Math.round(radius / pixelSize))
  const palette = FACTORIO_PALETTES[slug] || FACTORIO_PALETTES.clearbox

  // Seed based on slug for persistent procedural terrain
  let seed = 0
  for (let i = 0; i < slug.length; i++) {
    seed += slug.charCodeAt(i) * (i + 1) * 1.7
  }

  // Pixel-art spherical planet body
  for (let gy = -gridR; gy <= gridR; gy++) {
    for (let gx = -gridR; gx <= gridR; gx++) {
      const d = Math.hypot(gx, gy)
      if (d <= gridR) {
        // Spherical surface normal vector
        const nx = gx / gridR
        const ny = gy / gridR
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))

        // Directional sunlight shining from top-left (-0.6, -0.6)
        const light = -nx * 0.58 - ny * 0.58 + nz * 0.62

        // Procedural terrain noise with gentle axial rotation
        const rot = time * 0.00025
        const terrain = Math.sin((gx + seed) * 0.65 + rot) * Math.cos((gy + seed * 1.3) * 0.65)
                      + Math.sin((gx + gy + seed * 2.2) * 0.85) * 0.35

        // Retro 2x2 Bayer dithering on shadow gradient
        const dither = ((Math.abs(gx) + Math.abs(gy)) % 2 === 0 ? 0.07 : -0.07)
        const shade = light + terrain * 0.32 + dither

        // Map to 5-tone Factorio palette
        let colorIdx = 0
        if (shade > 0.62) colorIdx = 4
        else if (shade > 0.32) colorIdx = 3
        else if (shade > 0.04) colorIdx = 2
        else if (shade > -0.26) colorIdx = 1
        else colorIdx = 0

        // Stepped perimeter pixel outline
        const isRim = d > gridR - 1
        ctx.fillStyle = isRim ? '#080808' : palette[colorIdx]
        ctx.fillRect(cx + gx * pixelSize, cy + gy * pixelSize, pixelSize, pixelSize)
      }
    }
  }
}

/**
 * Factorio-style isometric breathing pixel-art cube for CANO and Local hubs.
 * The 3 faces (Top diamond, Left & Right sheared parallelograms) breathe apart along
 * 120° isometric normal vectors, exposing an internal glowing reactor core with
 * plasma filaments, then smoothly pull back into a solid monolithic cube.
 */
function drawFactorioPixelCube(ctx, cx, cy, type, currentTime, isSelected, isHovered) {
  const isCano = type === 'cano'
  const ps = 2 // Chunky 2px pixel scale

  // Dimensions in grid cells
  const gw = isCano ? 8 : 6
  const gh = isCano ? 4 : 3
  const W = gw * ps
  const H = gh * ps

  // Solid static Factorio pixel cube (no breathing expansion)
  const spread = 0

  // Factorio Space Age obsidian + gold/silver palettes
  const p = isCano
    ? {
        coreGlow: 'rgba(234, 179, 8, 0.28)',
        coreHot: '#ffffff',
        coreMid: '#fde047',
        coreOuter: '#eab308',
        coreDark: '#ca8a04',
        filament: 'rgba(250, 204, 21, 0.7)',
        topFill1: '#1c1917',
        topFill2: '#292524',
        topBorder: '#facc15',
        topHighlight: '#fef08a',
        leftFill1: '#141210',
        leftFill2: '#1c1917',
        leftBorder: '#ca8a04',
        leftHighlight: '#eab308',
        rightFill1: '#0c0a09',
        rightFill2: '#141210',
        rightBorder: '#a16207',
        rightHighlight: '#ca8a04',
      }
    : {
        coreGlow: 'rgba(226, 232, 240, 0.25)',
        coreHot: '#ffffff',
        coreMid: '#e2e8f0',
        coreOuter: '#94a3b8',
        coreDark: '#64748b',
        filament: 'rgba(248, 250, 252, 0.65)',
        topFill1: '#18181b',
        topFill2: '#27272a',
        topBorder: '#f8fafc',
        topHighlight: '#ffffff',
        leftFill1: '#111113',
        leftFill2: '#18181b',
        leftBorder: '#94a3b8',
        leftHighlight: '#cbd5e1',
        rightFill1: '#09090b',
        rightFill2: '#111113',
        rightBorder: '#64748b',
        rightHighlight: '#94a3b8',
      }

  ctx.save()

  // 1. Atmospheric radial energy glow
  const corePulse = (Math.sin(currentTime * 0.006 + (isCano ? 0 : 2)) + 1) * 0.5
  const glowRadius = (isCano ? 18 : 14) + spread * 0.8 + corePulse * 4

  const radGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, glowRadius)
  radGrad.addColorStop(0, p.coreGlow)
  radGrad.addColorStop(0.6, isCano ? 'rgba(234, 179, 8, 0.08)' : 'rgba(226, 232, 240, 0.06)')
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = radGrad
  ctx.beginPath()
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
  ctx.fill()

  // Normal displacement vectors along 120° isometric symmetry
  const dxTop = 0
  const dyTop = -spread

  const dxLeft = -spread * 0.866
  const dyLeft = spread * 0.5

  const dxRight = spread * 0.866
  const dyRight = spread * 0.5

  // 2. Plasma tether filaments connecting core to separating face vertices
  if (spread > 1.2) {
    ctx.strokeStyle = p.filament
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + dxTop, cy + dyTop)
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + dxLeft, cy + dyLeft)
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + dxRight, cy + dyRight)
    ctx.stroke()
  }

  // 3. Central glowing pixel reactor core at (cx, cy)
  const coreSize = isCano ? 3 : 2
  for (let cgy = -coreSize; cgy <= coreSize; cgy++) {
    for (let cgx = -coreSize; cgx <= coreSize; cgx++) {
      const cd = Math.abs(cgx) + Math.abs(cgy)
      if (cd <= coreSize) {
        let col = p.coreOuter
        if (cd === 0) col = p.coreHot
        else if (cd === 1) col = p.coreMid
        else if (cd >= coreSize) col = p.coreDark
        ctx.fillStyle = col
        ctx.fillRect(Math.round(cx + cgx * ps), Math.round(cy + cgy * ps), ps, ps)
      }
    }
  }

  // 4. Render Left Face (Parallelogram sheared, resting center: cx - W/2, cy + H/2)
  const lFaceCx = cx - W * 0.5 + dxLeft
  const lFaceCy = cy + H * 0.5 + dyLeft
  const halfGw = Math.round(gw * 0.5)

  for (let gx = -halfGw; gx <= halfGw; gx++) {
    const colCenter = gx * (gh / gw)
    const topGy = Math.round(colCenter - gh)
    const botGy = Math.round(colCenter + gh)

    for (let gy = topGy; gy <= botGy; gy++) {
      const isBorder = (gx === -halfGw || gx === halfGw || gy === topGy || gy === botGy)
      const isCorner = (gx === -halfGw && (gy === topGy || gy === botGy)) || (gx === halfGw && gy === topGy)
      let col
      if (isCorner) {
        col = p.leftHighlight
      } else if (isBorder) {
        col = p.leftBorder
      } else {
        const dither = ((Math.abs(gx) ^ Math.abs(gy)) & 1) === 0
        col = dither ? p.leftFill1 : p.leftFill2
      }
      ctx.fillStyle = col
      ctx.fillRect(Math.round(lFaceCx + gx * ps), Math.round(lFaceCy + gy * ps), ps, ps)
    }
  }

  // 5. Render Right Face (Parallelogram sheared, resting center: cx + W/2, cy + H/2)
  const rFaceCx = cx + W * 0.5 + dxRight
  const rFaceCy = cy + H * 0.5 + dyRight

  for (let gx = -halfGw; gx <= halfGw; gx++) {
    const colCenter = -gx * (gh / gw)
    const topGy = Math.round(colCenter - gh)
    const botGy = Math.round(colCenter + gh)

    for (let gy = topGy; gy <= botGy; gy++) {
      const isBorder = (gx === -halfGw || gx === halfGw || gy === topGy || gy === botGy)
      const isCorner = (gx === halfGw && (gy === topGy || gy === botGy)) || (gx === -halfGw && gy === topGy)
      let col
      if (isCorner) {
        col = p.rightHighlight
      } else if (isBorder) {
        col = p.rightBorder
      } else {
        const dither = ((Math.abs(gx) ^ Math.abs(gy)) & 1) === 0
        col = dither ? p.rightFill1 : p.rightFill2
      }
      ctx.fillStyle = col
      ctx.fillRect(Math.round(rFaceCx + gx * ps), Math.round(rFaceCy + gy * ps), ps, ps)
    }
  }

  // 6. Render Top Face (Diamond, resting center: cx, cy - H)
  const tFaceCx = cx + dxTop
  const tFaceCy = cy - H + dyTop

  for (let gy = -gh; gy <= gh; gy++) {
    for (let gx = -gw; gx <= gw; gx++) {
      const d = Math.abs(gx) / gw + Math.abs(gy) / gh
      if (d <= 1.0) {
        let col
        const isRim = d > 0.74
        const isCorner = d > 0.9
        const isCenterChip = Math.abs(gx) <= 1 && Math.abs(gy) <= 1
        if (isCorner) {
          col = p.topHighlight
        } else if (isRim) {
          col = p.topBorder
        } else if (isCenterChip) {
          col = isCano ? '#fef08a' : '#ffffff'
        } else {
          const dither = ((Math.abs(gx) ^ Math.abs(gy)) & 1) === 0
          col = dither ? p.topFill1 : p.topFill2
        }
        ctx.fillStyle = col
        ctx.fillRect(Math.round(tFaceCx + gx * ps), Math.round(tFaceCy + gy * ps), ps, ps)
      }
    }
  }

  // 7. Reticle corners when Selected
  if (isSelected) {
    const reticleR = (isCano ? 22 : 18) + spread * 0.5
    const cornerLen = 5
    ctx.strokeStyle = isCano ? '#facc15' : '#f8fafc'
    ctx.lineWidth = 1.5

    // Top-Left
    ctx.beginPath()
    ctx.moveTo(cx - reticleR, cy - reticleR + cornerLen)
    ctx.lineTo(cx - reticleR, cy - reticleR)
    ctx.lineTo(cx - reticleR + cornerLen, cy - reticleR)
    ctx.stroke()

    // Top-Right
    ctx.beginPath()
    ctx.moveTo(cx + reticleR - cornerLen, cy - reticleR)
    ctx.lineTo(cx + reticleR, cy - reticleR)
    ctx.lineTo(cx + reticleR, cy - reticleR + cornerLen)
    ctx.stroke()

    // Bottom-Left
    ctx.beginPath()
    ctx.moveTo(cx - reticleR, cy + reticleR - cornerLen)
    ctx.lineTo(cx - reticleR, cy + reticleR)
    ctx.lineTo(cx - reticleR + cornerLen, cy + reticleR)
    ctx.stroke()

    // Bottom-Right
    ctx.beginPath()
    ctx.moveTo(cx + reticleR - cornerLen, cy + reticleR)
    ctx.lineTo(cx + reticleR, cy + reticleR)
    ctx.lineTo(cx + reticleR, cy + reticleR - cornerLen)
    ctx.stroke()
  }

  // 8. Hub Label Pill
  ctx.font = '9px "DM Mono", monospace'
  const tagText = isCano ? 'CANO' : 'Local'
  const tagMetrics = ctx.measureText(tagText)
  const tagW = tagMetrics.width + 8
  const tagH = 12
  const tagY = cy + H * 1.6 + spread + 8

  ctx.fillStyle = isSelected
    ? (isCano ? 'rgba(234, 179, 8, 0.25)' : 'rgba(248, 250, 252, 0.2)')
    : 'rgba(6, 6, 6, 0.75)'
  ctx.fillRect(cx - tagW / 2, tagY - 9, tagW, tagH)

  ctx.textAlign = 'center'
  ctx.fillStyle = isSelected
    ? (isCano ? '#fef08a' : '#ffffff')
    : isHovered
      ? (isCano ? '#facc15' : '#cbd5e1')
      : (isCano ? '#ca8a04' : '#94a3b8')
  ctx.fillText(tagText, cx, tagY)

  // Interactive hint if hovered and not selected
  if (isHovered && !isSelected) {
    ctx.font = '8px "DM Mono", monospace'
    ctx.fillStyle = isCano ? '#fde047' : '#e2e8f0'
    ctx.fillText('[CLICK TO INSPECT]', cx, tagY + 11)
  }

  ctx.restore()
}

// Fallback hub descriptors
const DEFAULT_CANO_HUB = {
  slug: 'cano',
  id: 'CANO',
  name: 'CANO Infrastructure Cluster',
  shortName: 'CANO',
  hub: 'CANO',
  isHub: true,
  category: 'Autonomous Multi-Agent Base & Microservice Cloud',
  status: 'active',
  statusLabel: 'AUTONOMOUS OPERATOR',
  monthlyCommits: 169,
  totalCommits: 749,
  loc: 246520,
  activeServices: 8,
  currentFocus: 'Autonomous fleet orchestration, self-healing telemetry hooks, and unified microservice proxy mesh.',
  nextMilestone: 'Zero-downtime automated Canary deploys & cross-edge synchronization with Local.',
  host: 'Oracle Cloud (OCI Ampere A1, 4 OCPU, 24GB RAM)',
  summary: 'CANO is Miles\'s central 24/7 cloud command base on Oracle Cloud. It acts as the persistent nervous system for all projects: running production microservices, executing continuous background ingestion, managing vector stores, and coordinating autonomous AI agents with self-healing telemetry.',
  sectors: [
    { name: 'Microservices & APIs', pct: 40, color: '#eab308' },
    { name: 'Agent Telemetry & SRE', pct: 25, color: '#38bdf8' },
    { name: 'Databases & Embeddings', pct: 20, color: '#a855f7' },
    { name: 'Tunnels & Ingress Mesh', pct: 15, color: '#22c55e' },
  ],
  services: ['observer', 'horizon', 'volc', 'portfolio', 'clearbox', 'airwave', 'sturdy-robot', 'now-harvester'],
  githubUrl: 'https://github.com/d00mkeeps',
}

const DEFAULT_LOCAL_HUB = {
  slug: 'local',
  id: 'Local',
  name: 'Local Edge Station',
  shortName: 'LOCAL',
  hub: 'Local',
  isHub: true,
  category: 'MacBook Pro Workstation & Edge LLM Runtime',
  status: 'active',
  statusLabel: 'LOCAL RUNTIME',
  monthlyCommits: 16,
  totalCommits: 38,
  loc: 6840,
  activeServices: 1,
  currentFocus: 'Running local LLM pipelines and offline-first tools for the Spanish Tutor.',
  nextMilestone: 'Continuous bidirectional telemetry sync with CANO Observer.',
  host: 'MacBook Pro (Apple Silicon)',
  summary: 'The Local node represents development and edge pipelines running directly on Miles\'s physical workstation, reserved for intensive local models and client applications not hosted on cloud VMs.',
  sectors: [
    { name: 'Spanish Tutor Engine', pct: 65, color: '#f8fafc' },
    { name: 'Local LLM Inference', pct: 25, color: '#94a3b8' },
    { name: 'Sync Daemon', pct: 10, color: '#475569' },
  ],
  services: ['spanish-tutor'],
}

export default function FleetRadar() {
  const [data, setData] = useState(null)
  const [selectedSlug, setSelectedSlug] = useState('cano') // Default focus to CANO!
  const [viewMode, setViewMode] = useState('map') // 'map' | 'list'
  const [hoveredSlug, setHoveredSlug] = useState(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)

  // Track angles for each project: slug -> currentAngle (radians)
  const anglesRef = useRef({})

  // Load fleet.json data
  useEffect(() => {
    fetch('/data/fleet.json')
      .then(res => res.json())
      .then(d => {
        setData(d)
        if (d.projects?.length > 0) {
          // Initialize random/distributed starting phase angles
          const initialAngles = {}
          d.projects.forEach((p, idx) => {
            initialAngles[p.slug] = (idx * (Math.PI * 2 / d.projects.length)) % (Math.PI * 2)
          })
          anglesRef.current = initialAngles
        }
      })
      .catch(err => {
        console.error('Failed to load fleet.json:', err)
      })
  }, [])

  const allProjects = useMemo(() => {
    return data?.projects || []
  }, [data])

  const hubs = useMemo(() => {
    return data?.hubs || [DEFAULT_CANO_HUB, DEFAULT_LOCAL_HUB]
  }, [data])

  const selectedItem = useMemo(() => {
    if (selectedSlug === 'cano') {
      return hubs.find(h => h.slug === 'cano') || DEFAULT_CANO_HUB
    }
    if (selectedSlug === 'local') {
      return hubs.find(h => h.slug === 'local') || DEFAULT_LOCAL_HUB
    }
    const foundProject = allProjects.find(p => p.slug === selectedSlug)
    if (foundProject) return foundProject
    return hubs.find(h => h.slug === 'cano') || DEFAULT_CANO_HUB
  }, [allProjects, hubs, selectedSlug])

  // Navigable items list for prev/next pager (Hubs + Projects)
  const navItems = useMemo(() => {
    return [...hubs, ...allProjects]
  }, [hubs, allProjects])

  // Pager navigation
  const handlePrev = useCallback(() => {
    if (navItems.length === 0) return
    const idx = navItems.findIndex(p => p.slug === selectedSlug)
    const prevIdx = (idx - 1 + navItems.length) % navItems.length
    setSelectedSlug(navItems[prevIdx].slug)
  }, [navItems, selectedSlug])

  const handleNext = useCallback(() => {
    if (navItems.length === 0) return
    const idx = navItems.findIndex(p => p.slug === selectedSlug)
    const nextIdx = (idx + 1) % navItems.length
    setSelectedSlug(navItems[nextIdx].slug)
  }, [navItems, selectedSlug])

  // Canvas orbital animation loop
  useEffect(() => {
    if (viewMode !== 'map') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let lastTime = performance.now()

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Orbital configuration
    // Orbital configuration: Every project gets its own dedicated orbital lane
    const getLayoutConfig = () => {
      const isMobile = width < 640

      const canoCenter = {
        x: isMobile ? width * 0.35 : width * 0.38,
        y: height * 0.5,
      }

      const localCenter = {
        x: isMobile ? width * 0.82 : width * 0.82,
        y: height * 0.5,
      }

      // Orbital radius range around CANO:
      // Minimum radius (inner) to Maximum radius (outer)
      const canoMinR = isMobile ? 36 : 46
      const canoMaxR = isMobile ? Math.min(width * 0.32, 126) : Math.min(width * 0.23, 186)

      // Radius scale: planets sized by code mass
      const getPlanetRadius = (loc) => {
        const safeLoc = Math.max(loc || 1000, 1000)
        const logVal = Math.log10(safeLoc) // ~3.3 to ~5.1
        const minR = isMobile ? 9 : 11
        const maxR = isMobile ? 18 : 22
        return minR + (logVal - 3.3) * ((maxR - minR) / 1.8)
      }

      const localOrbit = isMobile ? 42 : 56

      return { isMobile, canoCenter, localCenter, canoMinR, canoMaxR, localOrbit, getPlanetRadius }
    }

    let isRunning = true

    const render = (currentTime) => {
      if (!isRunning) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      ctx.clearRect(0, 0, width, height)

      const { isMobile, canoCenter, localCenter, canoMinR, canoMaxR, localOrbit, getPlanetRadius } = getLayoutConfig()

      // ─── 1. Background Cartesian Grid ─────────────────────────────────────
      ctx.strokeStyle = '#121212'
      ctx.lineWidth = 1
      const gridStep = isMobile ? 36 : 48

      ctx.beginPath()
      for (let x = 0; x < width; x += gridStep) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // CANO and Local projects
      // Arrange small projects nearer CANO, and larger planets on the outside
      const canoProjects = allProjects
        .filter(p => p.hub === 'CANO')
        .slice()
        .sort((a, b) => (a.loc || 0) - (b.loc || 0))

      const localProjects = allProjects.filter(p => p.hub === 'Local')

      // Speed formula: dramatic contrast based on commits in past 30 days
      // Low commits (1-3) -> slow majestic crawl (~0.015 rad/s, takes ~400s per orbit)
      // Moderate (10-26)  -> steady movement (~0.05 - 0.12 rad/s)
      // High (50-63)      -> fast active orbit (~0.25 - 0.35 rad/s, takes ~18s per orbit)
      const getAngularVelocity = (commits) => {
        const c = Math.max(commits || 1, 1)
        return 0.012 + Math.pow(c / 10, 1.28) * 0.036
      }

      // ─── 2. Dedicated Orbital Radii (Inner = Small LOC, Outer = Large LOC) ─
      const canoCount = canoProjects.length
      const canoRadii = canoProjects.map((_, idx) => {
        if (canoCount <= 1) return (canoMinR + canoMaxR) / 2
        return canoMinR + idx * ((canoMaxR - canoMinR) / (canoCount - 1))
      })

      // Draw faint dedicated orbit tracks around CANO
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 5])

      canoRadii.forEach(r => {
        ctx.beginPath()
        ctx.ellipse(canoCenter.x, canoCenter.y, r, r * 0.84, 0, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw Local orbit track
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)'
      ctx.beginPath()
      ctx.ellipse(localCenter.x, localCenter.y, localOrbit, localOrbit * 0.84, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Subtle dashed connector between CANO and Local hubs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.setLineDash([2, 6])
      ctx.beginPath()
      ctx.moveTo(canoCenter.x, canoCenter.y)
      ctx.lineTo(localCenter.x, localCenter.y)
      ctx.stroke()
      ctx.setLineDash([])

      // ─── 3. Render Factorio Pixel-Art Breathing Hub Cubes ─────────────────
      // Register hub click/hover hit targets
      canvas._hubs = [
        { slug: 'cano', x: canoCenter.x, y: canoCenter.y, radius: isMobile ? 24 : 32, name: 'CANO' },
        { slug: 'local', x: localCenter.x, y: localCenter.y, radius: isMobile ? 20 : 26, name: 'Local' },
      ]

      // Draw CANO Hub (Factorio breathing pixel cube in obsidian & gold)
      drawFactorioPixelCube(
        ctx,
        canoCenter.x,
        canoCenter.y,
        'cano',
        currentTime,
        selectedSlug === 'cano',
        hoveredSlug === 'cano'
      )

      // Draw Local Hub (Factorio breathing pixel cube in obsidian & silver)
      drawFactorioPixelCube(
        ctx,
        localCenter.x,
        localCenter.y,
        'local',
        currentTime,
        selectedSlug === 'local',
        hoveredSlug === 'local'
      )

      // ─── 4. Compute Orbital Positions (Commit-based speed) ────────────────
      const computedNodes = []

      // Position CANO projects
      canoProjects.forEach((proj, idx) => {
        const orbitR = canoRadii[idx]
        const angularVelocity = getAngularVelocity(proj.monthlyCommits)
        const isHovered = proj.slug === hoveredSlug

        if (!anglesRef.current[proj.slug]) {
          anglesRef.current[proj.slug] = idx * (Math.PI * 2 / canoCount)
        }

        if (!isHovered) {
          anglesRef.current[proj.slug] = (anglesRef.current[proj.slug] + angularVelocity * dt) % (Math.PI * 2)
        }

        const angle = anglesRef.current[proj.slug]
        const px = canoCenter.x + Math.cos(angle) * orbitR
        const py = canoCenter.y + Math.sin(angle) * (orbitR * 0.84)
        const r = getPlanetRadius(proj.loc)

        computedNodes.push({
          ...proj,
          x: px,
          y: py,
          radius: r,
          orbitR,
          angle,
        })
      })

      // Position Local projects
      localProjects.forEach((proj, idx) => {
        const angularVelocity = getAngularVelocity(proj.monthlyCommits)
        const isHovered = proj.slug === hoveredSlug

        if (!anglesRef.current[proj.slug]) {
          anglesRef.current[proj.slug] = 0
        }

        if (!isHovered) {
          anglesRef.current[proj.slug] = (anglesRef.current[proj.slug] + angularVelocity * dt) % (Math.PI * 2)
        }

        const angle = anglesRef.current[proj.slug]
        const px = localCenter.x + Math.cos(angle) * localOrbit
        const py = localCenter.y + Math.sin(angle) * (localOrbit * 0.84)
        const r = getPlanetRadius(proj.loc)

        computedNodes.push({
          ...proj,
          x: px,
          y: py,
          radius: r,
          orbitR: localOrbit,
          angle,
        })
      })

      // ─── 5. Gravitational Anti-Collision Relaxation Solver ─────────────────
      // Ensures no two planets can ever overlap during an overtake
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < computedNodes.length; i++) {
          for (let j = i + 1; j < computedNodes.length; j++) {
            const a = computedNodes[i]
            const b = computedNodes[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.hypot(dx, dy)
            const minDist = a.radius + b.radius + 8 // guaranteed 8px air gap
            if (dist < minDist && dist > 0.001) {
              const overlap = (minDist - dist) * 0.5
              const nx = dx / dist
              const ny = dy / dist
              a.x -= nx * overlap
              a.y -= ny * overlap
              b.x += nx * overlap
              b.y += ny * overlap
            }
          }
        }
      }

      // ─── 6. Render Factorio Pixel-Art Planets ─────────────────────────────
      computedNodes.forEach(node => {
        const isSelected = node.slug === selectedSlug
        const isHovered = node.slug === hoveredSlug
        const r = node.radius

        ctx.save()

        // 1. Draw Factorio pixel-art planet body (clean, no outer rings)
        drawFactorioPixelPlanet(ctx, node.x, node.y, r, node.slug, currentTime)

        // Status Blip (Green for active, pulsing amber for parked - Horizon is always active)
        const isParked = node.status === 'parked' && node.slug !== 'horizon'
        let statusColor = '#22c55e'
        if (isParked) {
          const pulse = (Math.sin(currentTime * 0.005) + 1) * 0.5
          statusColor = `rgba(245, 158, 11, ${0.4 + pulse * 0.6})`
        }

        ctx.fillStyle = statusColor
        ctx.shadowColor = statusColor
        ctx.shadowBlur = isSelected ? 8 : 4
        ctx.beginPath()
        ctx.arc(node.x, node.y - r - 4, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Reticle corners around selected planet
        if (isSelected) {
          ctx.strokeStyle = '#00ff9d'
          ctx.lineWidth = 1.5
          const reticleSize = r + 6
          const cornerLen = 5

          // Top-Left
          ctx.beginPath()
          ctx.moveTo(node.x - reticleSize, node.y - reticleSize + cornerLen)
          ctx.lineTo(node.x - reticleSize, node.y - reticleSize)
          ctx.lineTo(node.x - reticleSize + cornerLen, node.y - reticleSize)
          ctx.stroke()

          // Top-Right
          ctx.beginPath()
          ctx.moveTo(node.x + reticleSize - cornerLen, node.y - reticleSize)
          ctx.lineTo(node.x + reticleSize, node.y - reticleSize)
          ctx.lineTo(node.x + reticleSize, node.y - reticleSize + cornerLen)
          ctx.stroke()

          // Bottom-Left
          ctx.beginPath()
          ctx.moveTo(node.x - reticleSize, node.y + reticleSize - cornerLen)
          ctx.lineTo(node.x - reticleSize, node.y + reticleSize)
          ctx.lineTo(node.x - reticleSize + cornerLen, node.y + reticleSize)
          ctx.stroke()

          // Bottom-Right
          ctx.beginPath()
          ctx.moveTo(node.x + reticleSize - cornerLen, node.y + reticleSize)
          ctx.lineTo(node.x + reticleSize, node.y + reticleSize)
          ctx.lineTo(node.x + reticleSize, node.y + reticleSize - cornerLen)
          ctx.stroke()
        }

        // Clean label with translucent backdrop pill
        ctx.font = '10px "DM Mono", monospace'
        const shortName = node.name.split(' ')[0].toUpperCase()
        const textMetrics = ctx.measureText(shortName)
        const labelW = textMetrics.width + 6
        const labelH = 12
        const labelY = node.y + r + 11

        ctx.fillStyle = 'rgba(6, 6, 6, 0.75)'
        ctx.fillRect(node.x - labelW / 2, labelY - 9, labelW, labelH)

        ctx.textAlign = 'center'
        ctx.fillStyle = isSelected ? '#efefed' : isHovered ? '#cccccc' : '#777570'
        ctx.fillText(shortName, node.x, labelY)

        ctx.restore()
      })

      canvas._renderedNodes = computedNodes
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    // Interaction: click / tap on hub or planet
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Check hubs first (CANO or Local)
      const hubsList = canvas._hubs || []
      for (const hub of hubsList) {
        const dist = Math.hypot(clickX - hub.x, clickY - hub.y)
        if (dist <= hub.radius) {
          setSelectedSlug(hub.slug)
          return
        }
      }

      // Check planets
      const nodes = canvas._renderedNodes || []
      for (const node of nodes) {
        const dist = Math.hypot(clickX - node.x, clickY - node.y)
        if (dist <= node.radius + 12) {
          setSelectedSlug(node.slug)
          break
        }
      }
    }

    // Interaction: mouse hover
    const handleCanvasMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let hit = null

      // Check hubs first
      const hubsList = canvas._hubs || []
      for (const hub of hubsList) {
        const dist = Math.hypot(mouseX - hub.x, mouseY - hub.y)
        if (dist <= hub.radius) {
          hit = hub.slug
          break
        }
      }

      // Check planets
      if (!hit) {
        const nodes = canvas._renderedNodes || []
        for (const node of nodes) {
          const dist = Math.hypot(mouseX - node.x, mouseY - node.y)
          if (dist <= node.radius + 10) {
            hit = node.slug
            break
          }
        }
      }

      setHoveredSlug(hit)
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }

    canvas.addEventListener('click', handleCanvasClick)
    canvas.addEventListener('mousemove', handleCanvasMouseMove)

    return () => {
      isRunning = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', updateSize)
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('mousemove', handleCanvasMouseMove)
    }
  }, [viewMode, allProjects, selectedSlug, hoveredSlug])

  return (
    <div className={styles.root}>
      {/* ─── Control Bar ────────────────────────────────────────────── */}
      <div className={styles.controlBar}>
        <div className={styles.systemTag}>
          <span>ORBITAL ECOSYSTEM</span>
          <span className={styles.tagSep}>//</span>
          <span className={styles.tagMuted}>VELOCITY DRIVEN BY MONTHLY COMMITS</span>
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('map')}
            title="Orbital Map View"
          >
            [ MAP ]
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            [ LIST ]
          </button>
        </div>
      </div>

      {/* ─── Orbital Viewport ───────────────────────────────────────── */}
      {viewMode === 'map' ? (
        <div className={styles.orbitViewport}>
          <canvas ref={canvasRef} className={styles.orbitCanvas} />

          {/* Minimalist corner tags */}
          <div className={styles.hudTopLeft}>
            <span>CENTRAL: CANO</span>
            <span>EDGE: LOCAL</span>
          </div>

          <div className={styles.hudTopRight}>
            <span>TOTAL: {allProjects.length} PROJECTS</span>
          </div>
        </div>
      ) : (
        /* ─── Plain List View ────────────────────────────────────────── */
        <div className={styles.listView}>
          {hubs.map(hub => {
            const isSelected = hub.slug === selectedSlug
            return (
              <div
                key={hub.slug}
                className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ''}`}
                onClick={() => setSelectedSlug(hub.slug)}
              >
                <div className={styles.listLeft}>
                  <span className={styles.listSlug}>[{hub.id}]</span>
                  <span className={styles.listName}>{hub.name}</span>
                  <span className={styles.listCategory}>{hub.category}</span>
                </div>
                <div className={styles.listRight}>
                  <span className={styles.listHub}>[HUB]</span>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    ONLINE
                  </span>
                </div>
              </div>
            )
          })}
          {allProjects.map(proj => {
            const isSelected = proj.slug === selectedSlug
            return (
              <div
                key={proj.slug}
                className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ''}`}
                onClick={() => setSelectedSlug(proj.slug)}
              >
                <div className={styles.listLeft}>
                  <span className={styles.listSlug}>{proj.slug}</span>
                  <span className={styles.listName}>{proj.name}</span>
                  <span className={styles.listCategory}>{proj.category}</span>
                </div>
                <div className={styles.listRight}>
                  <span className={styles.listHub}>[{proj.hub}]</span>
                  <span className={`${styles.statusBadge} ${proj.status === 'parked' ? styles.statusParked : styles.statusActive}`}>
                    {proj.status === 'parked' ? 'PARKED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Hub & Fleet Quick Selector ────────────────────────────── */}
      <div className={styles.quickBar}>
        <span className={styles.quickBarLabel}>NODES:</span>
        <button
          className={`${styles.nodeBtn} ${selectedSlug === 'cano' ? styles.nodeBtnCanoSelected : ''}`}
          onClick={() => setSelectedSlug('cano')}
        >
          <span className={styles.nodeDotGold} /> CANO HUB
        </button>
        <button
          className={`${styles.nodeBtn} ${selectedSlug === 'local' ? styles.nodeBtnLocalSelected : ''}`}
          onClick={() => setSelectedSlug('local')}
        >
          <span className={styles.nodeDotSilver} /> LOCAL EDGE
        </button>
        <span className={styles.quickBarSep}>|</span>
        <span className={styles.quickBarLabel}>PLANETS:</span>
        <div className={styles.planetPillsScroll}>
          {allProjects.map(p => (
            <button
              key={p.slug}
              className={`${styles.planetPill} ${selectedSlug === p.slug ? styles.planetPillActive : ''}`}
              onClick={() => setSelectedSlug(p.slug)}
            >
              {p.slug}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Inspector HUD (Hubs + Projects) ─────────────────────────── */}
      {selectedItem && (
        <div className={styles.inspectorCard}>
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorMeta}>
              <span className={styles.projectHubTag}>
                HUB: {selectedItem.hub.toUpperCase()} // {selectedItem.isHub ? 'INFRASTRUCTURE NODE' : selectedItem.slug.toUpperCase()}
              </span>
              <h3 className={styles.projectName}>{selectedItem.name}</h3>
              <p className={styles.projectCategory}>{selectedItem.category}</p>
            </div>

            <div className={styles.statusWrap}>
              <div className={`${styles.statusBadge} ${selectedItem.status === 'parked' ? styles.statusParked : styles.statusActive}`}>
                <span className={styles.statusDot} />
                <span>{selectedItem.isHub ? 'ONLINE // AUTONOMOUS' : selectedItem.status.toUpperCase()}</span>
              </div>
              <div className={styles.activityBadge}>
                {selectedItem.monthlyCommits || 0} commits / 30d {selectedItem.totalCommits ? `(${selectedItem.totalCommits} total)` : ''}
              </div>
            </div>
          </div>

          {/* Dedicated Hub Explainer when CANO or Local is inspected */}
          {selectedItem.isHub && (
            <div className={`${styles.hubExplainer} ${selectedItem.slug === 'local' ? styles.hubExplainerLocal : ''}`}>
              <div className={styles.explainerHeader}>
                <span className={`${styles.explainerBadge} ${selectedItem.slug === 'local' ? styles.explainerBadgeLocal : ''}`}>
                  {selectedItem.slug === 'cano' ? 'CORE COMMAND BASE' : 'EDGE RUNTIME'}
                </span>
                <span className={styles.explainerTitle}>
                  {selectedItem.slug === 'cano' ? 'WHAT EXACTLY IS CANO?' : 'WHAT IS LOCAL EDGE?'}
                </span>
              </div>
              <p className={styles.explainerBody}>
                {selectedItem.summary}
              </p>
              <div className={styles.infraSpecsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>HOST HARDWARE</span>
                  <span className={styles.specValue}>{selectedItem.host}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>ORCHESTRATOR</span>
                  <span className={styles.specValue}>{selectedItem.slug === 'cano' ? 'cano-pm CLI // observer SRE' : 'macOS Runtime // Ollama'}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>FLEET CAPACITY</span>
                  <span className={styles.specValue}>
                    {selectedItem.activeServices} Services // {selectedItem.loc ? selectedItem.loc.toLocaleString() : 0} LOC
                  </span>
                </div>
              </div>

              {/* Clickable service pills to jump straight to projects */}
              {selectedItem.services?.length > 0 && (
                <div className={styles.servicesSection}>
                  <span className={styles.servicesLabel}>HOSTED FLEET SERVICES (CLICK TO FOCUS PLANET):</span>
                  <div className={styles.servicesList}>
                    {selectedItem.services.map(svcSlug => (
                      <button
                        key={svcSlug}
                        className={styles.servicePillBtn}
                        onClick={() => setSelectedSlug(svcSlug)}
                        title={`Focus ${svcSlug} on radar`}
                      >
                        {svcSlug} ↗
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Architecture Continents / Sectors */}
          <div className={styles.sectorSection}>
            <div className={styles.sectorBar}>
              {selectedItem.sectors?.map((sec, idx) => (
                <div
                  key={idx}
                  className={styles.sectorSegment}
                  style={{ width: `${sec.pct}%`, backgroundColor: sec.color }}
                  title={`${sec.name}: ${sec.pct}%`}
                />
              ))}
            </div>

            <div className={styles.sectorLegend}>
              {selectedItem.sectors?.map((sec, idx) => (
                <div key={idx} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: sec.color }} />
                  <span className={styles.legendLabel}>{sec.name}</span>
                  <span className={styles.legendPct}>{sec.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry & Current Focus */}
          <div className={styles.telemetryGrid}>
            <div className={styles.telemetryBox}>
              <span className={styles.telemetryLabel}>CURRENT FOCUS</span>
              <p className={styles.telemetryValue}>
                {selectedItem.currentFocus || 'Production operational'}
              </p>
            </div>

            <div className={styles.telemetryBox}>
              <span className={styles.telemetryLabel}>NEXT MILESTONE</span>
              <p className={styles.telemetryValue}>
                {selectedItem.nextMilestone || 'Continuous deployment & telemetry'}
              </p>
            </div>
          </div>

          {/* Action Links & Pager Controls */}
          <div className={styles.inspectorFooter}>
            <div className={styles.actionLinks}>
              {selectedItem.appStoreUrl && (
                <a
                  href={selectedItem.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnPrimary}
                >
                   App Store ↗
                </a>
              )}
              {selectedItem.liveUrl && (
                <a
                  href={selectedItem.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                >
                  Live Product ↗
                </a>
              )}
              {selectedItem.githubUrl && (
                <a
                  href={selectedItem.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                >
                  GitHub ↗
                </a>
              )}
            </div>

            {/* Pagers */}
            <div className={styles.pagerNav}>
              <button onClick={handlePrev} className={styles.pagerBtn} title="Previous Item">
                ◀
              </button>
              <span className={styles.pagerCount}>
                {navItems.findIndex(p => p.slug === selectedItem.slug) + 1} / {navItems.length}
              </span>
              <button onClick={handleNext} className={styles.pagerBtn} title="Next Item">
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
