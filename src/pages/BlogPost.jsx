import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import styles from './BlogPost.module.css'

const postModules = import.meta.glob('../posts/*.mdx', { eager: true })

function estimateReadingTime(raw) {
  const WPS = 238
  const words = raw.trim().split(/\s+/).length
  return Math.ceil(words / WPS)
}

export default function BlogPost() {
  const { slug } = useParams()
  const mod = postModules[`../posts/${slug}.mdx`]

  if (!mod) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className="container">
            <p className={styles.notFound}>Post not found.</p>
            <Link to="/blog" className={styles.back}>← back to blog</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const Content = mod.default
  const { title, date, summary } = mod.frontmatter ?? {}
  const minutes = estimateReadingTime(mod.raw ?? '')

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <Link to="/blog" className={styles.back}>← blog</Link>

          <header className={styles.header}>
            {date && <time className={styles.date}>{date}</time>}
            <span className={styles.readingTime}>{minutes} min read</span>
            <h1 className={styles.title}>{title}</h1>
            {summary && <p className={styles.summary}>{summary}</p>}
          </header>

          <article className={styles.prose}>
            <Content />
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
