import React from 'react'
import styles from './LinkBuilder.module.css'

// ─── Data ────────────────────────────────────────────────────────────────────
const SUBS = [
  {
    slug: '',
    label: 'mileshillary.com',
    live: 'https://mileshillary.com',
  },
  {
    slug: 'clearbox',
    label: 'clearbox.mileshillary.com',
    live: null,
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
  {
    slug: 'tax',
    label: 'tax.mileshillary.com',
    live: 'https://tax.mileshillary.com',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function LinkBuilder() {
  return (
    <div className={styles.root}>
      <div className={styles.links}>
        {SUBS.map(sub => {
          const href = sub.live || `https://${sub.slug}.mileshillary.com`
          return (
            <a
              key={sub.slug}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <span className={styles.linkSlug}>{sub.slug || 'mileshillary.com'}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}