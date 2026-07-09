import React from 'react'
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
    live: null,
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

// API-compatible status mapping
const STATUS_MAP = {
  clearbox: { state: 'live' },
  brain: { state: 'archived' },
  qa: { state: 'archived' },
  tax: { state: 'live' },
  volc: { state: 'updating', detail: 'v1.x in App Review' },
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
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LinkBuilder() {
  return (
    <div className={styles.root}>
      <div className={styles.links}>
        {SUBS.map(sub => {
          const href = sub.live || `https://${sub.slug}.mileshillary.com`
          const status = STATUS_MAP[sub.slug]
          const statusConfig = status ? STATUS_CONFIGS[status.state] : null

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
          <span className={`${styles.dot} ${styles.live}`} />
          <span className={styles.legendLabel}>live</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.updating}`} />
          <span className={styles.legendLabel}>update pending</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.archived}`} />
          <span className={styles.legendLabel}>archived</span>
        </div>
      </div>
    </div>
  )
}