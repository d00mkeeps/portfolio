import React, { useState } from 'react'
import styles from './ClearBoxCard.module.css'

const features = [
  { name: 'debt_to_equity', value: 0.87, contribution: +0.34, label: 'high leverage → risk ↑' },
  { name: 'revenue_growth_3y', value: 0.12, contribution: +0.21, label: 'steady growth → risk ↓' },
  { name: 'sector_volatility', value: 0.61, contribution: +0.18, label: 'sector tail risk' },
  { name: 'interest_coverage', value: 2.1, contribution: -0.29, label: 'weak coverage → risk ↑' },
  { name: 'cash_runway_months', value: 14, contribution: -0.11, label: 'short runway' },
]

export default function ClearBoxCard() {
  const [hovered, setHovered] = useState(null)

  return (
    <div className={styles.card}>
      <div className={styles.label}>Clear Box</div>
      <div className={styles.verdict}>
        <span className={styles.verdictLabel}>Model decision</span>
        <span className={styles.verdictValue}>High Risk · 0.74 confidence</span>
      </div>
      <div className={styles.features}>
        {features.map(f => (
          <div
            key={f.name}
            className={styles.feature}
            onMouseEnter={() => setHovered(f.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={styles.fname}>{f.name}</span>
            <div className={styles.bar}>
              <div
                className={`${styles.fill} ${f.contribution > 0 ? styles.pos : styles.neg}`}
                style={{ width: `${Math.abs(f.contribution) * 200}%` }}
              />
            </div>
            <span className={`${styles.contrib} ${f.contribution > 0 ? styles.pos : styles.neg}`}>
              {f.contribution > 0 ? '+' : ''}{f.contribution.toFixed(2)}
            </span>
            {hovered === f.name && (
              <span className={styles.tooltip}>{f.label}</span>
            )}
          </div>
        ))}
      </div>
      <p className={styles.caption}>Feature-level explainability for compliance-grade ML decisions.</p>
    </div>
  )
}
