import React, { useState } from 'react'
import styles from './TPECard.module.css'

const transactions = [
  { id: 'TXN-0041', entity: 'UK HoldCo → IE SubCo', amount: '£2.4m', method: 'TNMM', status: 'within range' },
  { id: 'TXN-0042', entity: 'UK HoldCo → DE SubCo', amount: '£890k', method: 'CUP', status: 'within range' },
  { id: 'TXN-0043', entity: 'IE SubCo → SG SubCo', amount: '£5.1m', method: 'TNMM', status: 'outlier' },
]

export default function TPECard() {
  const [selected, setSelected] = useState(null)

  return (
    <div className={styles.card}>
      <div className={styles.label}>Transfer Pricing Engine</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th><th>Route</th><th>Amount</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr
              key={t.id}
              className={`${styles.row} ${styles[t.status.replace(' ', '')]} ${selected === t.id ? styles.selected : ''}`}
              onClick={() => setSelected(t.id === selected ? null : t.id)}
            >
              <td className={styles.mono}>{t.id}</td>
              <td>{t.entity}</td>
              <td className={styles.mono}>{t.amount}</td>
              <td><span className={styles.badge}>{t.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected === 'TXN-0043' && (
        <div className={styles.detail}>
          <span className={styles.flag}>⚠ Outside arm's-length range</span>
          <p>Net margin of 4.2% sits below the IQR floor of 6.8%. Adjustment of £312k recommended. Documentation auto-generated for HMRC review.</p>
        </div>
      )}
      {selected !== 'TXN-0043' && selected && (
        <div className={styles.detail}>
          <span className={styles.ok}>✓ Compliant</span>
          <p>Transaction priced within the arm's-length range. No adjustment required.</p>
        </div>
      )}
      <p className={styles.caption}>Automated TP compliance with audit-ready documentation.</p>
    </div>
  )
}
