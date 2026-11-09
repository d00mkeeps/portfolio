import React, { useState, useEffect, useRef } from 'react'
import styles from './UnderConstruction.module.css'

const SONGS = [
  { id: 'track_1', src: '/audio/what-have-you-done-lately.mp3' },
  { id: 'track_2', src: '/audio/why-do-you-play-with-my-mind.mp3' },
  { id: 'track_3', src: '/audio/restless.mp3' },
  { id: 'track_4', src: '/audio/livin-under-clouds.mp3' },
]

const STORAGE_INDEX_KEY = 'portfolio_audio_track_index'
const STORAGE_STATE_KEY = 'portfolio_audio_state'
const STORAGE_POS_PREFIX = 'portfolio_audio_pos_'

export default function UnderConstruction({ isAnticipateProp }) {
  const isAnticipate =
    Boolean(isAnticipateProp) ||
    (typeof window !== 'undefined' &&
      (window.location.hostname.includes('anticipate') ||
        window.location.pathname.startsWith('/anticipate')))

  useEffect(() => {
    document.title = isAnticipate ? 'Pending!' : 'Under Construction — Miles Hillary'
  }, [isAnticipate])

  const audioRef = useRef(null)
  const lastSavedTimeRef = useRef(0)
  const targetTimeRef = useRef(0)

  const [trackIndex, setTrackIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INDEX_KEY)
      if (saved !== null) {
        const parsed = parseInt(saved, 10)
        return isNaN(parsed) ? 0 : parsed % SONGS.length
      }
    } catch (e) {}
    return 0
  })

  const trackIndexRef = useRef(trackIndex)
  useEffect(() => {
    trackIndexRef.current = trackIndex
  }, [trackIndex])

  const [isPlaying, setIsPlaying] = useState(false)

  // Audio setup — only on mileshillary.com (not anticipate)
  useEffect(() => {
    if (isAnticipate) return

    const audio = audioRef.current
    if (!audio) return

    const initialTrack = SONGS[trackIndexRef.current]
    const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + initialTrack.id) || '0')
    targetTimeRef.current = savedPos

    const handleLoadedMetadata = () => {
      const target = targetTimeRef.current
      if (target > 0 && target < audio.duration) {
        audio.currentTime = target
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    if (audio.readyState >= 1) {
      handleLoadedMetadata()
    }

    // Try resume if state was 'playing'
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
          localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, audio.currentTime.toString())
        } catch (e) {}
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    // MediaSession setup without metadata hints
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.setActionHandler('play', () => {
        togglePlayPause()
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
  }, [isAnticipate])

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    const now = audio.currentTime

    if (Math.abs(now - lastSavedTimeRef.current) >= 0.5) {
      lastSavedTimeRef.current = now
      try {
        localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, now.toString())
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
        localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, audioRef.current.currentTime.toString())
      }
    } catch (e) {}
  }

  const handleEnded = async () => {
    try {
      localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, '0')
    } catch (e) {}

    const nextIdx = (trackIndexRef.current + 1) % SONGS.length
    trackIndexRef.current = nextIdx
    setTrackIndex(nextIdx)
    try {
      localStorage.setItem(STORAGE_INDEX_KEY, nextIdx.toString())
    } catch (e) {}

    const nextTrack = SONGS[nextIdx]
    const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + nextTrack.id) || '0')
    targetTimeRef.current = savedPos

    const audio = audioRef.current
    if (audio) {
      audio.src = nextTrack.src
      audio.load()
      try {
        await audio.play()
        setIsPlaying(true)
        localStorage.setItem(STORAGE_STATE_KEY, 'playing')
      } catch (err) {
        setIsPlaying(false)
      }
    }
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      const hasPlayedBefore = localStorage.getItem(STORAGE_INDEX_KEY) !== null
      let targetIdx = trackIndexRef.current

      if (hasPlayedBefore) {
        targetIdx = (trackIndexRef.current + 1) % SONGS.length
        trackIndexRef.current = targetIdx
        setTrackIndex(targetIdx)
      }

      try {
        localStorage.setItem(STORAGE_INDEX_KEY, targetIdx.toString())
      } catch (e) {}

      const track = SONGS[targetIdx]
      const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + track.id) || '0')
      targetTimeRef.current = savedPos

      audio.src = track.src
      audio.load()

      try {
        await audio.play()
        setIsPlaying(true)
        localStorage.setItem(STORAGE_STATE_KEY, 'playing')
      } catch (err) {
        console.error('Audio playback error:', err)
      }
    }
  }

  // Spacebar toggle
  useEffect(() => {
    if (isAnticipate) return
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        togglePlayPause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isAnticipate])

  if (isAnticipate) {
    return (
      <main className={styles.wrapper}>
        <h1 className={styles.headline}>Pending!</h1>
        <a href="https://mileshillary.com" className={styles.navLink}>
          Back
        </a>
      </main>
    )
  }

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

      <a href="https://anticipate.systems" className={styles.navLink}>
        Anticipate
      </a>

      {/* Hidden audio element without controls to prevent seeking */}
      <audio
        ref={audioRef}
        src={SONGS[trackIndex].src}
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
