import React from 'react'
import styles from './LinkBuilder.module.css'

// ─── Data ────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    slug: 'volc',
    description: 'hyper-personalised ai fitness coaching',
    live: 'https://apps.apple.com/gb/app/volc-ai-gym-coach/id6751469055',
  },
  {
    slug: 'clearbox',
    description: 'free medicine tracker built on nhs data',
    live: 'https://clearbox.mileshillary.com',
  },
  {
    slug: 'horizon',
    description: 'solana trading algo and paper wallet',
    live: 'https://horizon.mileshillary.com',
  },
  {
    slug: 'tax',
    description: 'transfer pricing optimisation prototype',
    live: 'https://tax.mileshillary.com',
  },
  {
    slug: 'brain',
    description: 'web based brain visualisation tool',
    live: 'https://brain.mileshillary.com',
  },
  {
    slug: 'qa',
    description: 'agentic testing harness',
    live: 'https://qa.mileshillary.com',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function LinkBuilder() {
  return (
    <div className={styles.root}>
      <div className={styles.links}>
        {PROJECTS.map(project => {
          const href = project.live || `https://${project.slug}.mileshillary.com`

          return (
            <a
              key={project.slug}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <span className={styles.linkSlug}>{project.slug}</span>
              <span className={styles.linkSep}>-</span>
              <span className={styles.linkDesc}>{project.description}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
