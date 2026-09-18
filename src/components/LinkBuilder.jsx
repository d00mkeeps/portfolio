import React, { useState, useEffect } from 'react'
import styles from './LinkBuilder.module.css'

// ─── Data ────────────────────────────────────────────────────────────────────
const SUBS = [
  {
    slug: 'volc',
    label: 'volc.mileshillary.com',
    live: 'https://apps.apple.com/gb/app/volc-ai-gym-coach/id6751469055',
  },
  {
    slug: 'clearbox',
    label: 'clearbox.mileshillary.com',
    live: 'https://clearbox.mileshillary.com',
  },
  {
    slug: 'horizon',
    label: 'horizon.mileshillary.com',
    live: 'https://horizon.mileshillary.com',
  },
  {
    slug: 'tax',
    label: 'tax.mileshillary.com',
    live: 'https://tax.mileshillary.com',
  },
  {
    slug: 'brain',
    label: 'brain.mileshillary.com',
    live: 'https://brain.mileshillary.com',
  },
  {
    slug: 'qa',
    label: 'qa.mileshillary.com',
    live: 'https://qa.mileshillary.com',
  },
]

// Default fallback status mapping (all links are live or archived)
const DEFAULT_STATUS_MAP = {
  volc: { state: 'updating', detail: 'v1.x in App Review' },
  clearbox: { state: 'live' },
  horizon: { state: 'live' },
  tax: { state: 'archived' },
  brain: { state: 'archived' },
  qa: { state: 'archived' },
}

const STATUS_CONFIGS = {
  live: {
    className: styles.live,
    defaultLabel: 'live',
  },
  updating: {
    className: styles.updating,
    defaultLabel: 'update pending',
  },
  archived: {
    className: styles.archived,
    defaultLabel: 'archived',
  },
  degraded: {
    className: styles.updating,
    defaultLabel: 'degraded',
  },
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LinkBuilder() {
  const [statusMap, setStatusMap] = useState(DEFAULT_STATUS_MAP)

  useEffect(() => {
    const fetchLiveStatus = async () => {
      try {
        const res = await fetch('/api/status').catch(() => fetch('http://127.0.0.1:8006/status'))
        if (res && res.ok) {
          const data = await res.json()
          if (data.projects) {
            const updated = { ...DEFAULT_STATUS_MAP }
            for (const [slug, p] of Object.entries(data.projects)) {
              updated[slug] = { state: p.state === 'offline' ? 'archived' : p.state, detail: p.detail }
            }
            setStatusMap(updated)
          }
        }
      } catch (e) {
        // Fallback to default mapping silently
      }
    }
    fetchLiveStatus()
  }, [])

  return (
    <div className={styles.root}>
      <div className={styles.links}>
        {SUBS.map(sub => {
          const href = sub.live || `https://${sub.slug}.mileshillary.com`
          const status = statusMap[sub.slug] || { state: 'archived' }
          const statusConfig = STATUS_CONFIGS[status.state] || STATUS_CONFIGS.archived

          return (
            <a
              key={sub.slug}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {statusConfig && (
                <span className={styles.status}>
                  <span className={`${styles.dot} ${statusConfig.className}`} />
                </span>
              )}
              <span className={styles.linkSlug}>{sub.slug}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )
        })}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.updating}`} />
          <span className={styles.legendLabel}>update pending</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.live}`} />
          <span className={styles.legendLabel}>live</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.archived}`} />
          <span className={styles.legendLabel}>archived</span>
        </div>
      </div>
    </div>
  )
}
