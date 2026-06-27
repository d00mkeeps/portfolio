import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import styles from './Blog.module.css'

// Vite glob import — picks up all MDX files in /posts
const postModules = import.meta.glob('../posts/*.mdx', { eager: true })

function estimateReadingTime(raw) {
  const WPS = 238 // average words per second for technical reading
  const words = raw.trim().split(/\s+/).length
  const minutes = Math.ceil(words / WPS)
  return minutes
}

function getPosts() {
  return Object.entries(postModules)
    .map(([path, mod]) => {
      const slug = path.replace('../posts/', '').replace('.mdx', '')
      const { title, date, summary, tags } = mod.frontmatter ?? {}
      const minutes = estimateReadingTime(mod.raw ?? '')
      return { slug, title, date, summary, tags, minutes }
    })
    .filter(p => p.title)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function Blog() {
  const posts = getPosts()

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>Blog</h1>
            <p className={styles.sub}>
              Case studies and notes on systems.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className={styles.empty}>Posts coming soon.</p>
          ) : (
            <ol className={styles.list}>
              {posts.map((post, i) => (
                <li key={post.slug} className={styles.item} style={{ animationDelay: `${i * 60}ms` }}>
                  <Link to={`/blog/${post.slug}`} className={styles.postLink}>
                    <div className={styles.meta}>
                      <time className={styles.date}>{post.date}</time>
                      <span className={styles.readingTime}>{post.minutes} min read</span>
                      {post.tags?.map(t => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    {post.summary && <p className={styles.summary}>{post.summary}</p>}
                    <span className={styles.readMore}>read →</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
