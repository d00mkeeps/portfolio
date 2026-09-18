import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './AdminDashboard.module.css'

const TABS = [
  {
    id: 'observer',
    label: '⚡ Observer Ops',
    description: 'Volcano Host Health, Project States & Deployment Logs',
    isCustom: true,
  },
  {
    id: 'grafana',
    label: '📊 Metrics & Logs',
    url: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3003'
      : 'https://grafana.mileshillary.com',
    fallbackUrl: 'http://192.168.1.106:3003',
    description: 'Prometheus metrics, Loki container logs, and cAdvisor resource dashboards',
  },
  {
    id: 'clearbox',
    label: '🗄️ Clearbox Studio',
    url: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8009'
      : 'http://192.168.1.106:8009',
    fallbackUrl: 'http://192.168.1.106:8009',
    description: 'Clearbox Supabase Studio: Postgres database, pgvector tables, and storage',
  },
  {
    id: 'horizon',
    label: '📈 Horizon Studio',
    url: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8008'
      : 'http://192.168.1.106:8008',
    fallbackUrl: 'http://192.168.1.106:8008',
    description: 'Horizon Paper Trading Supabase Studio: Token positions, trades, and simulation DB',
  },
  {
    id: 'crucible',
    label: '🧪 Crucible QA',
    url: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://qa.mileshillary.com',
    fallbackUrl: 'http://192.168.1.106:3000',
    description: 'Crucible Web & Feature-to-Spec autonomous test suite interface',
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('observer')
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportSending, setReportSending] = useState(false)
  const [reportMessage, setReportMessage] = useState('')

  const fetchStatus = async () => {
    try {
      // Try relative /api/status (proxied by Nginx) or fallback to localhost:8006
      const res = await fetch('/api/status').catch(() => fetch('http://127.0.0.1:8006/status'))
      if (res && res.ok) {
        const data = await res.json()
        setStatusData(data)
      }
    } catch (e) {
      console.warn('Status fetch warning:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  const triggerReport = async () => {
    setReportSending(true)
    setReportMessage('')
    try {
      const res = await fetch('/api/report', { method: 'POST' }).catch(() =>
        fetch('http://127.0.0.1:8006/report', { method: 'POST' })
      )
      if (res && res.ok) {
        setReportMessage('✅ Report sent to Telegram!')
      } else {
        setReportMessage('⚠️ Sent on local host')
      }
    } catch (e) {
      setReportMessage('❌ Failed to trigger')
    } finally {
      setReportSending(false)
      setTimeout(() => setReportMessage(''), 4000)
    }
  }

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0]

  return (
    <div className={styles.container}>
      {/* ── Top Bar ── */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.logoSquare}>MH</span>
          <span className={styles.title}>Volcano Control Center</span>
          <span className={styles.badge}>admin</span>
        </div>

        {statusData?.host && (
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span>RAM:</span>
              <span className={styles.statVal}>{statusData.host.ram_pct}%</span>
            </div>
            <div className={styles.statItem}>
              <span>Disk:</span>
              <span className={styles.statVal}>{statusData.host.disk_pct}%</span>
            </div>
            <div className={styles.statItem}>
              <span>Load:</span>
              <span className={styles.statVal}>{statusData.host.load}</span>
            </div>
            <div className={styles.statItem}>
              <span>Containers:</span>
              <span className={styles.statVal}>{statusData.host.containers_running} active</span>
            </div>
          </div>
        )}

        <div className={styles.topActions}>
          <button onClick={fetchStatus} className={styles.actionBtn} title="Refresh live status">
            🔄 Refresh
          </button>
          <button
            onClick={triggerReport}
            disabled={reportSending}
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
          >
            {reportSending ? 'Sending...' : '📱 Telegram Report'}
          </button>
          <Link to="/" className={styles.actionBtn}>
            ← Back to Site
          </Link>
        </div>
      </header>

      {reportMessage && (
        <div style={{ background: '#1e293b', color: '#38bdf8', padding: '0.4rem 1.5rem', fontSize: '0.85rem' }}>
          {reportMessage}
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <nav className={styles.tabNav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Viewport ── */}
      <main className={styles.viewport}>
        {currentTabObj.isCustom ? (
          <div className={styles.opsContent}>
            {/* Host Resource Cards */}
            <h2 className={styles.sectionTitle}>Host Infrastructure & Resources</h2>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Memory Usage</span>
                  <span>💾</span>
                </div>
                <div className={styles.cardValue}>
                  {statusData?.host ? `${statusData.host.ram_pct}%` : '--'}
                </div>
                <div className={styles.cardSub}>Host memory utilization</div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Disk Capacity</span>
                  <span>💿</span>
                </div>
                <div className={styles.cardValue}>
                  {statusData?.host ? `${statusData.host.disk_pct}%` : '--'}
                </div>
                <div className={styles.cardSub}>Root NVMe storage partition</div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>CPU Load & Uptime</span>
                  <span>⚡</span>
                </div>
                <div className={styles.cardValue}>
                  {statusData?.host ? `${statusData.host.load}` : '--'}
                </div>
                <div className={styles.cardSub}>
                  Uptime: {statusData?.host?.uptime_days ? `${statusData.host.uptime_days} days` : '--'}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Active Services</span>
                  <span>📦</span>
                </div>
                <div className={styles.cardValue}>
                  {statusData?.host?.containers_running || 30}
                </div>
                <div className={styles.cardSub}>Live monitored containers</div>
              </div>
            </div>

            {/* Managed Projects Grid */}
            <h2 className={styles.sectionTitle}>Managed Applications & Services</h2>
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Containers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {statusData?.projects ? (
                  Object.values(statusData.projects).map(p => (
                    <tr key={p.slug}>
                      <td>
                        <strong>{p.title}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{p.slug}.mileshillary.com</div>
                      </td>
                      <td>
                        <span className={styles.badge}>{p.category}</span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusDot} ${
                            p.state === 'live'
                              ? styles.dotLive
                              : p.state === 'updating'
                              ? styles.dotUpdating
                              : p.state === 'degraded'
                              ? styles.dotDegraded
                              : styles.dotOffline
                          }`}
                        />
                        {p.state.toUpperCase()}
                      </td>
                      <td>{p.detail}</td>
                      <td>
                        <code>{p.active_containers?.join(', ') || 'none'}</code>
                      </td>
                      <td>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Open →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>
                      Loading project statuses...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Recent Deployment Activity */}
            {statusData?.recent_deploys && statusData.recent_deploys.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Recent Deployments</h2>
                <table className={styles.deployTable}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Commit</th>
                      <th>Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusData.recent_deploys.map((d, i) => (
                      <tr key={i}>
                        <td>{new Date(d.timestamp).toLocaleString()}</td>
                        <td>
                          <strong>{d.project}</strong>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusDot} ${
                              d.status === 'success' ? styles.dotLive : styles.dotUpdating
                            }`}
                          />
                          {d.status.toUpperCase()}
                        </td>
                        <td>
                          <code>{d.commit || '--'}</code>
                        </td>
                        <td>{d.actor || 'miles'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={styles.frameHeader}>
              <div>
                <strong>{currentTabObj.label}</strong> — {currentTabObj.description}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className={styles.frameUrl}>{currentTabObj.url}</span>
                <a
                  href={currentTabObj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Open in New Tab ↗
                </a>
              </div>
            </div>
            <div className={styles.iframeWrapper}>
              <iframe
                src={currentTabObj.url}
                title={currentTabObj.label}
                className={styles.dashboardFrame}
                allow="fullscreen"
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
