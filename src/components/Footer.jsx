import React from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>volc.uk</span>
        <div className={styles.links}>
          <a href="https://github.com/d00mkeeps" target="_blank" rel="noopener noreferrer">github</a>
          <a href="https://linkedin.com/in/yourlinkedin" target="_blank" rel="noopener noreferrer">linkedin</a>
          <a href="mailto:hello@volc.uk">hello@volc.uk</a>
          <a href="https://calendly.com/yourusername" target="_blank" rel="noopener noreferrer">book a call</a>
        </div>
      </div>
    </footer>
  )
}
