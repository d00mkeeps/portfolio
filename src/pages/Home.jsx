import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import LinkBuilder from '../components/LinkBuilder.jsx'
import styles from './Home.module.css'

export default function Home() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Nav />
      <main className={`${styles.main} ${visible ? styles.visible : ''}`}>
        <div className={styles.container}>

          {/* ── Bio ── */}
          <section className={styles.bio}>
            <div className={styles.bioLines}>
              <p className={styles.bioLine}>Solving human problems with AI since 2023</p>
              <p className={styles.bioLine}>Idea to product in weeks, not months</p>
              <p className={styles.bioLine}>Two live iOS apps</p>
              <p className={`${styles.bioLine} ${styles.bioLineGap}`}>Available September 2027</p>
              <p className={styles.bioLine}>London preferred</p>
            </div>
            <a href="https://calendly.com/miles-i-hillary/30min" target="_blank" rel="noopener noreferrer" className={styles.bookCall}>
              book a call →
            </a>
          </section>

          <LinkBuilder />

        </div>
      </main>
    </>
  )
}