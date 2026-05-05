import React from 'react'
import { Link } from 'react-router-dom'
import styles from './ProjectCard.module.css'

export default function ProjectCard({ project, index }) {
  const { slug, name, tagline, what, stack, status, link } = project

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={styles.header}>
        <span className={styles.index}>0{index + 1}</span>
        <span className={`${styles.status} ${styles[status]}`}>{status}</span>
      </div>

      <h3 className={styles.name}>{name}</h3>
      <p className={styles.tagline}>{tagline}</p>
      <p className={styles.what}>{what}</p>

      {stack && (
        <div className={styles.stack}>
          {stack.map(s => <span key={s} className={styles.tag}>{s}</span>)}
        </div>
      )}

      <div className={styles.actions}>
        <Link to={`/projects/${slug}`} className={styles.caseStudy}>
          case study →
        </Link>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className={styles.external}>
            ↗
          </a>
        )}
      </div>
    </article>
  )
}
