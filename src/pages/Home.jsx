import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import LLMCard from '../components/cards/LLMCard.jsx'
import TPECard from '../components/cards/TPECard.jsx'
import ClearBoxCard from '../components/cards/ClearBoxCard.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { projects } from '../lib/projects.js'
import styles from './Home.module.css'

export default function Home() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Cards hero ── */}
          <section className={styles.cardsSection}>
            <div className={styles.cardsRow}>
              <div className={styles.cardWrap}><LLMCard /></div>
              <div className={styles.cardWrap}><TPECard /></div>
              <div className={styles.cardWrap}><ClearBoxCard /></div>
            </div>
            <div className={styles.cardsMobileScroll}>
              <div className={styles.cardsMobileInner}>
                <div className={styles.cardWrapMobile}><LLMCard /></div>
                <div className={styles.cardWrapMobile}><TPECard /></div>
                <div className={styles.cardWrapMobile}><ClearBoxCard /></div>
              </div>
            </div>
          </section>

          {/* ── Body copy ── */}
          <section className={styles.body}>
            <p className={styles.copy}>
              First-class Business student. Self-taught engineer with four shipped products across healthtech, fintech, and AI research. Available for contracts from June 2025.
            </p>
            <span className={styles.availDot} />
          </section>

          {/* ── Nav links ── */}
          <nav className={styles.pageNav}>
            <Link to="/#work" className={styles.pageNavLink}>
              <span className={styles.pageNavLabel}>work</span>
              <span className={styles.pageNavArrow}>→</span>
            </Link>
            <Link to="/blog" className={styles.pageNavLink}>
              <span className={styles.pageNavLabel}>blog</span>
              <span className={styles.pageNavArrow}>→</span>
            </Link>
            <a href="mailto:hello@volc.uk" className={styles.pageNavLink}>
              <span className={styles.pageNavLabel}>contact</span>
              <span className={styles.pageNavArrow}>→</span>
            </a>
          </nav>

          {/* ── Projects ── */}
          <section id="work" className={styles.projects}>
            <p className={styles.sectionLabel}>work</p>
            <div className={styles.grid}>
              {projects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
