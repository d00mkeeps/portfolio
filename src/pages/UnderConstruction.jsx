import React, { useState, useEffect, useRef } from 'react'
import styles from './UnderConstruction.module.css'

const STORAGE_POS_KEY = 'portfolio_audio_position'
const STORAGE_STATE_KEY = 'portfolio_audio_state'

export default function UnderConstruction() {
  const audioRef = useRef(null)
  const lastSavedTimeRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)

  // Restore position and attempt autoplay if stored state was 'playing'
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      try {
        const stored = parseFloat(localStorage.getItem(STORAGE_POS_KEY) || '0')
        if (stored > 0 && stored < audio.duration) {
          audio.currentTime = stored
        }
      } catch (e) {}
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    if (audio.readyState >= 1) {
      handleLoadedMetadata()
    }

    try {
      const prevListeningState = localStorage.getItem(STORAGE_STATE_KEY)
      if (prevListeningState === 'playing') {
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    } catch (e) {}

    const onBeforeUnload = () => {
      if (audio) {
        try {
          localStorage.setItem(STORAGE_POS_KEY, audio.currentTime.toString())
        } catch (e) {}
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    // MediaSession setup
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

    // Persist position every 0.5s
    if (Math.abs(now - lastSavedTimeRef.current) >= 0.5) {
      lastSavedTimeRef.current = now
      try {
        localStorage.setItem(STORAGE_POS_KEY, now.toString())
      } catch (e) {}
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    try {
      localStorage.setItem(STORAGE_STATE_KEY, 'playing')
    } catch (e) {}
  }

  const handlePause = () => {
    setIsPlaying(false)
    try {
      localStorage.setItem(STORAGE_STATE_KEY, 'paused')
      if (audioRef.current) {
        localStorage.setItem(STORAGE_POS_KEY, audioRef.current.currentTime.toString())
      }
    } catch (e) {}
  }

  const handleEnded = () => {
    setIsPlaying(false)
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

  // Spacebar toggle
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

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.headline}>Under Construction!</h1>

      <button
        type="button"
        onClick={togglePlayPause}
        className={`${styles.playButton} ${isPlaying ? styles.buttonPlaying : ''}`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span>Pause</span>
          </>
        ) : (
          <>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play</span>
          </>
        )}
      </button>

      {/* Hidden audio element without controls to prevent seeking */}
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
