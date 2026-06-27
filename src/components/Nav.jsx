import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Nav.module.css'

export default function Nav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.wordmark}>
          <span className={styles.logoSquare}>MH</span>
        </Link>
        <div className={styles.links}>
          <Link to="/blog" className={`${styles.link} ${pathname.startsWith('/blog') ? styles.active : ''}`}>blog</Link>
          <div className={styles.contactWrap}>
            <button
              className={styles.link}
              onClick={() => setContactOpen(o => !o)}
            >
              contact {contactOpen ? '↑' : '↓'}
            </button>
            {contactOpen && (
              <div className={styles.contactMenu}>
                <a href="mailto:miles.i.hillary@gmail.com" className={styles.contactItem}>
                  <span className={styles.contactLabel}>email</span>
                  <span className={styles.contactValue}>miles.i.hillary@gmail.com</span>
                </a>
                <a href="https://calendly.com/miles-i-hillary/30min" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <span className={styles.contactLabel}>call</span>
                  <span className={styles.contactValue}>book 30 mins</span>
                </a>
                <a href="https://www.linkedin.com/in/miles-hillary/" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <span className={styles.contactLabel}>linkedin</span>
                  <span className={styles.contactValue}>miles hillary</span>
                </a>
                <a href="https://github.com/d00mkeeps" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <span className={styles.contactLabel}>github</span>
                  <span className={styles.contactValue}>d00mkeeps</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
