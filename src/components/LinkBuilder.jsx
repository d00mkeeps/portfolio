import React, { useState, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import styles from './LinkBuilder.module.css'

// ─── Data ────────────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    label: 'mileshillary.com',
    subs: [
      {
        slug: '',
        name: 'Miles Hillary',
        initials: 'MH',
        tagline: 'Personal portfolio and shipped iOS products.',
        copy: 'NHS patient non-adherence, financial models stress-testing, and cognitive trajectory visualisers. Select a subdomain or case study to explore.',
        stack: ['Vite', 'Three.js', 'React', 'CSS Modules'],
        status: 'online',
        caseStudy: '/#work',
        live: 'https://mileshillary.com',
      },
      {
        slug: 'clearbox',
        name: 'Clear Box',
        initials: 'CB',
        tagline: 'Explainability layer for black-box ML models.',
        copy: 'NHS patient non-adherence costs £500m annually. Existing apps charge money, require manual data entry, and have no intelligence layer. Clear Box is a free iOS app with barcode scanning, automatic patient leaflet ingestion, and an AI layer baked in.',
        stack: ['Swift', 'Python', 'FastAPI', 'SHAP'],
        status: 'iOS · pending',
        caseStudy: '/projects/clear-box',
        live: null,
      },
    ],
  },
  {
    label: 'volc.uk',
    subs: [
      {
        slug: '',
        name: 'Volc',
        initials: 'VO',
        tagline: 'Software collective and research systems.',
        copy: 'Building tooling and engines for AI reasoning evaluation, financial model stress-testing, and automated transfer pricing.',
        stack: ['Python', 'React', 'FastAPI', 'Docker'],
        status: 'online',
        caseStudy: '/#work',
        live: 'https://volc.uk',
      },
      {
        slug: 'brain',
        name: 'Grey Plain',
        initials: 'GP',
        tagline: 'Cognitive trajectory visualiser for LLM reasoning.',
        copy: 'Research tooling that tracks semantic drift in chain-of-thought outputs over repeated prompting — useful for teams red-teaming or evaluating model stability under distribution shift.',
        stack: ['Python', 'D3.js', 'OpenAI API', 'UMAP'],
        status: 'shipped',
        caseStudy: '/projects/cognitive-trajectory-visualiser',
        live: 'https://brain.volc.uk',
      },
      {
        slug: 'qa',
        name: 'Crucible',
        initials: 'CR',
        tagline: 'Automated stress-testing for financial models.',
        copy: 'Runs parameterised scenario sweeps against spreadsheet or API-based models — Monte Carlo, historical replay, adversarial edge cases. Outputs structured diff reports for audit trails.',
        stack: ['Python', 'NumPy', 'Pandas', 'FastAPI'],
        status: 'shipped',
        caseStudy: '/projects/crucible',
        live: 'https://qa.volc.uk',
      },
      {
        slug: 'tax',
        name: 'Transfer Pricing Engine',
        initials: 'TP',
        tagline: "Automated arm's-length pricing for intra-group transactions.",
        copy: "Implements OECD TP methods (CUP, TNMM, profit split) against live transaction data. Flags outliers, generates documentation ready for HMRC review, and exports to the standard XML filing format.",
        stack: ['Python', 'PostgreSQL', 'React', 'Docker'],
        status: 'shipped',
        caseStudy: '/projects/transfer-pricing-engine',
        live: 'https://tax.volc.uk',
      },
    ],
  },
]

// ─── Drum ─────────────────────────────────────────────────────────────────────
// (/components/LinkBuilder.Drum)
function Drum({ items, activeIdx, onCycle, itemKey = item => item, renderItem }) {
  const ITEM_H = 64
  const dragStartY = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const hasMoved = useRef(false)

  const accumulator = useRef(0)
  const lastEventTime = useRef(0)
  const wheelTimeout = useRef(null)

  const handleWheel = useCallback(e => {
    e.preventDefault()
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current)

    wheelTimeout.current = setTimeout(() => {
      accumulator.current = 0
    }, 150)

    const now = Date.now()
    accumulator.current += e.deltaY

    const THRESHOLD = 35
    const COOLDOWN = 200

    if (Math.abs(accumulator.current) >= THRESHOLD) {
      if (now - lastEventTime.current >= COOLDOWN) {
        const direction = accumulator.current > 0 ? 1 : -1
        onCycle(direction)
        lastEventTime.current = now
        accumulator.current = 0
      }
    }
  }, [onCycle])

  const handlePointerDown = e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    dragStartY.current = e.clientY
    setIsDragging(true)
    setDragOffset(0)
    hasMoved.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = e => {
    if (!isDragging) return
    const deltaY = e.clientY - dragStartY.current
    setDragOffset(deltaY)
    if (Math.abs(deltaY) > 5) {
      hasMoved.current = true
    }
  }

  const handlePointerUp = e => {
    if (isDragging) {
      setIsDragging(false)
      e.currentTarget.releasePointerCapture(e.pointerId)

      let steps = 0
      const threshold = 20 // More sensitive (20px) threshold to trigger switch
      if (Math.abs(dragOffset) >= threshold) {
        if (Math.abs(dragOffset) <= ITEM_H) {
          steps = dragOffset > 0 ? -1 : 1
        } else {
          steps = -Math.round(dragOffset / ITEM_H)
        }
      }

      if (steps !== 0) {
        onCycle(steps)
      }
      setDragOffset(0)
    }
  }

  return (
    <div
      className={`${styles.drum} ${isDragging ? styles.drumDragging : ''}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles.drumFadeTop} />
      <div
        className={styles.drumTrack}
        style={{ transform: `translateY(${(1 - activeIdx) * ITEM_H + dragOffset}px)` }}
      >
        {items.map((item, i) => (
          <div
            key={itemKey(item)}
            className={`${styles.drumItem} ${i === activeIdx ? styles.drumItemActive : ''}`}
            onClick={() => {
              if (!hasMoved.current && i !== activeIdx) {
                onCycle(i - activeIdx)
              }
            }}
          >
            {renderItem ? renderItem(item) : (item.slug === '' ? '—' : item.slug)}
          </div>
        ))}
      </div>
      <div className={styles.drumFadeBottom} />
    </div>
  )
}

// ─── Logo square (matches Nav.jsx) ───────────────────────────────────────────
// (/components/LinkBuilder.LogoSquare)
function LogoSquare({ children, small }) {
  return (
    <div className={`${styles.logoSquare} ${small ? styles.logoSquareSmall : ''}`}>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
// (/components/LinkBuilder)
export default function LinkBuilder() {
  const [domIdx, setDomIdx] = useState(0)

  const cycleDom = useCallback(dir => {
    const update = () => {
      setDomIdx(i => (i + dir + DOMAINS.length) % DOMAINS.length)
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(update)
      })
    } else {
      update()
    }
  }, [])

  return (
    <div className={styles.root}>
      <p className={styles.label}>live projects</p>

      {/* ── URL bar ── */}
      <div className={styles.urlBar}>
        <Drum
          items={DOMAINS}
          activeIdx={domIdx}
          onCycle={cycleDom}
          itemKey={d => d.label}
          renderItem={d => d.label}
        />
      </div>

      {/* ── Vertical Subdomains Link Stack ── */}
      <div className={styles.linksStack}>
        {DOMAINS.map((dom, dIdx) => (
          <div
            key={dom.label}
            className={`${styles.domainGroup} ${domIdx === dIdx ? styles.domainGroupActive : styles.domainGroupInactive}`}
          >
            {dom.subs.map(subItem => {
              const isRoot = subItem.slug === ''
              const href = subItem.live || `https://${subItem.slug ? subItem.slug + '.' : ''}${dom.label}`
              return (
                <a
                  key={subItem.slug}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.portalLink}
                >
                  {isRoot ? (
                    <span className={styles.linkRoot}>{dom.label}</span>
                  ) : (
                    <>
                      <span className={styles.linkSlug}>{subItem.slug}</span>
                      <span className={styles.linkSuffix}>.{dom.label}</span>
                    </>
                  )}
                  <span className={styles.linkArrow}>→</span>
                </a>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
