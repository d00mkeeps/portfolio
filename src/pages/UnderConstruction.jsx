import React, { useState, useEffect, useRef } from 'react'
import styles from './UnderConstruction.module.css'

const STORAGE_POS_KEY = 'portfolio_audio_position'
const STORAGE_STATE_KEY = 'portfolio_audio_state'

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function UnderConstruction() {
  const audioRef = useRef(null)
  const lastSavedTimeRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => {
    try {
      const saved = parseFloat(localStorage.getItem(STORAGE_POS_KEY) || '0')
      return isNaN(saved) ? 0 : saved
    } catch {
      return 0
    }
  })
  const [savedState, setSavedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_STATE_KEY) || 'paused'
    } catch {
      return 'paused'
    }
  })

  // Restore position and attempt autoplay if state was 'playing'
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      try {
        const stored = parseFloat(localStorage.getItem(STORAGE_POS_KEY) || '0')
        if (stored > 0 && stored < audio.duration) {
          audio.currentTime = stored
          setCurrentTime(stored)
        }
      } catch (e) {
        // ignore
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    if (audio.readyState >= 1) {
      handleLoadedMetadata()
    }

    // If stored state was playing, try to resume
    try {
      const prevListeningState = localStorage.getItem(STORAGE_STATE_KEY)
      if (prevListeningState === 'playing') {
        audio.play().then(() => {
          setIsPlaying(true)
          setSavedState('playing')
        }).catch(() => {
          // Autoplay blocked without user gesture
          setIsPlaying(false)
        })
      }
    } catch (e) {
      // ignore
    }

    const onBeforeUnload = () => {
      if (audio) {
        try {
          localStorage.setItem(STORAGE_POS_KEY, audio.currentTime.toString())
        } catch (e) {}
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    // MediaSession API setup
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'What Have You Done Lately',
        artist: 'Large Joints',
        album: 'DRBAGAIN01',
      })
      navigator.mediaSession.setActionHandler('play', () => {
        audio.play().catch(() => {})
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause()
      })
      // Disallow seeking / skipping forward and back
      navigator.mediaSession.setActionHandler('seekto', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    const now = audio.currentTime
    setCurrentTime(now)

    // Save position to localStorage
    if (Math.abs(now - lastSavedTimeRef.current) >= 0.5) {
      lastSavedTimeRef.current = now
      try {
        localStorage.setItem(STORAGE_POS_KEY, now.toString())
      } catch (e) {}
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setSavedState('playing')
    try {
      localStorage.setItem(STORAGE_STATE_KEY, 'playing')
    } catch (e) {}
  }

  const handlePause = () => {
    setIsPlaying(false)
    setSavedState('paused')
    try {
      localStorage.setItem(STORAGE_STATE_KEY, 'paused')
      if (audioRef.current) {
        localStorage.setItem(STORAGE_POS_KEY, audioRef.current.currentTime.toString())
      }
    } catch (e) {}
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setSavedState('paused')
    try {
      localStorage.setItem(STORAGE_POS_KEY, '0')
      localStorage.setItem(STORAGE_STATE_KEY, 'paused')
    } catch (e) {}
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      try {
        const stored = parseFloat(localStorage.getItem(STORAGE_POS_KEY) || '0')
        if (stored > 0 && Math.abs(audio.currentTime - stored) > 1 && stored < (audio.duration || 9999)) {
          audio.currentTime = stored
        }
        await audio.play()
      } catch (err) {
        console.error('Audio playback error:', err)
      }
    }
  }

  // Keyboard shortcut: Space toggles play/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        togglePlayPause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  const buttonLabel = isPlaying
    ? 'Pause'
    : currentTime > 0
    ? 'Resume'
    : 'Play'

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.headline}>Under Construction!</h1>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.tag}>Now Spinning</span>
          <div className={styles.statusPill}>
            <span className={`${styles.statusDot} ${isPlaying ? styles.statusPlaying : styles.statusPaused}`} />
            <span className={styles.statusText}>{isPlaying ? 'Playing' : 'Paused'}</span>
          </div>
        </div>

        <div className={styles.trackInfo}>
          <div className={styles.title}>What Have You Done Lately</div>
          <div className={styles.artist}>Large Joints</div>
        </div>

        <button
          type="button"
          onClick={togglePlayPause}
          className={`${styles.playButton} ${isPlaying ? styles.buttonPlaying : ''}`}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            <>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{buttonLabel}</span>
            </>
          )}
        </button>

        <div className={styles.metaRow}>
          <span className={styles.timeDisplay}>
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '07:01'}
          </span>
          <span className={styles.savedNotice}>Position saved</span>
        </div>
      </div>

      {/* Hidden audio element with strictly no controls to prevent seeking */}
      <audio
        ref={audioRef}
        src="/audio/what-have-you-done-lately.mp3"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </main>
  )
}
