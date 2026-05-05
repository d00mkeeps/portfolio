import React, { useState } from 'react'
import styles from './LLMCard.module.css'

const messages = [
  { role: 'user', text: 'Explain the portfolio optimisation result.' },
  { role: 'assistant', text: 'The model increased allocation to short-duration bonds by 12%, reducing duration risk ahead of the rate decision.' },
  { role: 'user', text: 'Why not equities?' },
  { role: 'assistant', text: 'Volatility surface implied elevated tail risk. The model down-weighted equities to stay within the mandate\'s VaR limit.' },
]

export default function LLMCard() {
  const [shown, setShown] = useState(1)

  return (
    <div className={styles.card}>
      <div className={styles.label}>LLM Interface UX</div>
      <div className={styles.thread}>
        {messages.slice(0, shown + 1).map((m, i) => (
          <div key={i} className={`${styles.msg} ${styles[m.role]}`}>
            <span className={styles.roleTag}>{m.role === 'user' ? 'you' : 'ai'}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <button
        className={styles.next}
        onClick={() => setShown(s => Math.min(messages.length - 1, s + 1))}
        disabled={shown >= messages.length - 1}
      >
        continue thread →
      </button>
      <p className={styles.caption}>Designing for trust and legibility in financial LLM interfaces.</p>
    </div>
  )
}
