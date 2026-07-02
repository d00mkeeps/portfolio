import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import styles from './Blog.module.css'

const postModules = import.meta.glob('../posts/*.mdx', { eager: true })

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function getPosts() {
  return Object.entries(postModules)
    .map(([path, mod]) => {
      const slug = path.replace('../posts/', '').replace('.mdx', '')
      const { title, date, summary, tags, minutes } = mod.frontmatter ?? {}
      return { slug, title, date, summary, tags, minutes }
    })
    .filter(p => p.title)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function Blog() {
  const posts = getPosts()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Nav />
      <main className={`${styles.main} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <ol className={styles.list}>
            {posts.map((post, i) => (
              <li key={post.slug} className={styles.item} style={{ animationDelay: `${i * 60}ms` }}>
                <Link to={`/blog/${post.slug}`} className={styles.postLink}>
                  <div className={styles.meta}>
                    <time className={styles.date}>{formatDate(post.date)}</time>
                    <span className={styles.readingTime}>{post.minutes} min read</span>
                  </div>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  {post.summary && <p className={styles.summary}>{post.summary}</p>}
                  <span className={styles.readMore}>read →</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </>
  )
}