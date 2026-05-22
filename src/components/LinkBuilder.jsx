import React, { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styles from './LinkBuilder.module.css'

// ─── Data ────────────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    label: 'mileshillary.com',
    subs: [
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
  const ITEM_H = 52
  const touchStartY = useRef(null)
  const lastDelta = useRef(0)

  const handleWheel = useCallback(e => {
    e.preventDefault()
    onCycle(e.deltaY > 0 ? 1 : -1)
  }, [onCycle])

  const handleTouchStart = e => {
    touchStartY.current = e.touches[0].clientY
    lastDelta.current = 0
  }

  const handleTouchMove = e => {
    e.preventDefault()
    const delta = touchStartY.current - e.touches[0].clientY
    const step = Math.round(delta / ITEM_H)
    if (step !== lastDelta.current) {
      onCycle(step - lastDelta.current)
      lastDelta.current = step
    }
  }

  return (
    <div
      className={styles.drum}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className={styles.drumFadeTop} />
      <div
        className={styles.drumTrack}
        style={{ transform: `translateY(${(1 - activeIdx) * ITEM_H}px)` }}
      >
        {items.map((item, i) => (
          <div
            key={itemKey(item)}
            className={`${styles.drumItem} ${i === activeIdx ? styles.drumItemActive : ''}`}
          >
            {renderItem ? renderItem(item) : (typeof item === 'string' ? item : item.slug)}
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
  const [subIdx, setSubIdx] = useState(0)

  const domain = DOMAINS[domIdx]
  const sub = domain.subs[subIdx]

  const cycleDom = useCallback(dir => {
    setDomIdx(i => {
      const next = (i + dir + DOMAINS.length) % DOMAINS.length
      setSubIdx(0)
      return next
    })
  }, [])

  const cycleSub = useCallback(dir => {
    setSubIdx(i => (i + dir + domain.subs.length) % domain.subs.length)
  }, [domain.subs.length])

  return (
    <div className={styles.root}>
      <p className={styles.label}>live projects</p>

      {/* ── URL bar ── */}
      <div className={styles.urlBar}>
        <Drum
          items={domain.subs}
          activeIdx={subIdx}
          onCycle={cycleSub}
          itemKey={s => s.slug}
        />

        <span className={styles.dot}>.</span>

        <Drum
          items={DOMAINS}
          activeIdx={domIdx}
          onCycle={cycleDom}
          itemKey={d => d.label}
          renderItem={d => d.label.split('.')[0]}
        />

        <span className={styles.dot}>.</span>

        <Drum
          items={DOMAINS}
          activeIdx={domIdx}
          onCycle={cycleDom}
          itemKey={d => d.label + '-suffix'}
          renderItem={d => d.label.split('.')[1]}
        />
      </div>

      {/* ── Project info ── */}
      <div className={styles.infoPanel} key={`${domIdx}-${subIdx}`}>
        <hr className={styles.divider} />

        <div className={styles.infoHeader}>
          <LogoSquare small>{sub.initials}</LogoSquare>
          <span className={styles.infoName}>{sub.name}</span>
          <span className={styles.infoStatus}>{sub.status}</span>
        </div>

        <p className={styles.infoTagline}>{sub.tagline}</p>
        <p className={styles.infoCopy}>{sub.copy}</p>

        <div className={styles.infoStack}>
          {sub.stack.map(s => (
            <span key={s} className={styles.infoTag}>{s}</span>
          ))}
        </div>

        <div className={styles.infoActions}>
          <Link to={sub.caseStudy} className={styles.caseStudyLink}>case study →</Link>
          {sub.live && (
            <a href={sub.live} target="_blank" rel="noopener noreferrer" className={styles.liveLink}>
              visit live ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
