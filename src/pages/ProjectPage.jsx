import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { projects } from '../lib/projects.js'
import styles from './ProjectPage.module.css'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className="container">
            <p className={styles.notFound}>Project not found.</p>
            <Link to="/#projects" className={styles.back}>← back</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { name, tagline, what, stack, status, link } = project

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <Link to="/#projects" className={styles.back}>← work</Link>

          <header className={styles.header}>
            <div className={styles.headerMeta}>
              <span className={`${styles.status} ${styles[status]}`}>{status}</span>
              {stack?.map(s => <span key={s} className={styles.tag}>{s}</span>)}
            </div>
            <h1 className={styles.title}>{name}</h1>
            <p className={styles.tagline}>{tagline}</p>
          </header>

          <section className={styles.body}>
            <div className={styles.section}>
              <h2 className={styles.sectionLabel}>What &amp; Why</h2>
              <p>{what}</p>
            </div>

            {/* Placeholder sections — fill in per project */}
            <div className={styles.section}>
              <h2 className={styles.sectionLabel}>Problem</h2>
              <p className={styles.placeholder}>
                Add context here — what was the real problem, what was missing in existing solutions?
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionLabel}>Approach</h2>
              <p className={styles.placeholder}>
                Describe technical decisions, architecture, tradeoffs.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionLabel}>Outcome</h2>
              <p className={styles.placeholder}>
                What shipped? Metrics, feedback, lessons.
              </p>
            </div>

            {link && (
              <div className={styles.section}>
                <a href={link} target="_blank" rel="noopener noreferrer" className={styles.liveLink}>
                  view live ↗
                </a>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
