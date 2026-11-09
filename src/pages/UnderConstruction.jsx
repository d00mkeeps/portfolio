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
  const trackIndexRef = useRef(0)
  const isSwitchingTrackRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize audio and restore previous state
  useEffect(() => {
    if (isAnticipate) return

    const audio = audioRef.current
    if (!audio) return

    let initialIdx = 0
    try {
      const saved = localStorage.getItem(STORAGE_INDEX_KEY)
      if (saved !== null) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) initialIdx = parsed % SONGS.length
      }
    } catch (e) {}

    trackIndexRef.current = initialIdx
    const initialTrack = SONGS[initialIdx]
    const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + initialTrack.id) || '0')

    audio.src = initialTrack.src

    const onLoadedMetadata = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (savedPos > 0 && (!audio.duration || savedPos < audio.duration)) {
        try {
          audio.currentTime = savedPos
        } catch (e) {}
      }
    }

    if (audio.readyState >= 1) {
      onLoadedMetadata()
    } else {
      audio.addEventListener('loadedmetadata', onLoadedMetadata)
    }

    // Attempt resume if stored state was 'playing'
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
      if (audio && !isSwitchingTrackRef.current) {
        try {
          localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, audio.currentTime.toString())
        } catch (e) {}
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    // MediaSession setup without hints
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
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [isAnticipate])

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || isSwitchingTrackRef.current) return
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
    if (!isSwitchingTrackRef.current && audioRef.current) {
      try {
        localStorage.setItem(STORAGE_STATE_KEY, 'paused')
        localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, audioRef.current.currentTime.toString())
      } catch (e) {}
    }
  }

  const handleEnded = () => {
    const audio = audioRef.current
    if (!audio) return

    // Track finished naturally: reset its position to 0
    try {
      localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, '0')
    } catch (e) {}

    // Auto-advance to next song
    const nextIdx = (trackIndexRef.current + 1) % SONGS.length
    trackIndexRef.current = nextIdx
    try {
      localStorage.setItem(STORAGE_INDEX_KEY, nextIdx.toString())
    } catch (e) {}

    const nextTrack = SONGS[nextIdx]
    const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + nextTrack.id) || '0')

    isSwitchingTrackRef.current = true
    audio.src = nextTrack.src

    const onLoadedMetadata = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (savedPos > 0 && (!audio.duration || savedPos < audio.duration)) {
        try {
          audio.currentTime = savedPos
        } catch (e) {}
      }
      isSwitchingTrackRef.current = false
    }

    if (audio.readyState >= 1) {
      onLoadedMetadata()
    } else {
      audio.addEventListener('loadedmetadata', onLoadedMetadata)
    }

    audio.play().then(() => {
      setIsPlaying(true)
      try {
        localStorage.setItem(STORAGE_STATE_KEY, 'playing')
      } catch (e) {}
    }).catch(err => {
      console.error('Auto-advance playback error:', err)
      setIsPlaying(false)
      isSwitchingTrackRef.current = false
    })
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      // User is pausing: save current position and pause
      try {
        localStorage.setItem(STORAGE_POS_PREFIX + SONGS[trackIndexRef.current].id, audio.currentTime.toString())
        localStorage.setItem(STORAGE_STATE_KEY, 'paused')
      } catch (e) {}
      audio.pause()
      setIsPlaying(false)
    } else {
      // User is resuming: advance to next song in cycle
      const hasPlayedBefore = localStorage.getItem(STORAGE_INDEX_KEY) !== null
      let targetIdx = trackIndexRef.current

      if (hasPlayedBefore) {
        targetIdx = (trackIndexRef.current + 1) % SONGS.length
      }

      trackIndexRef.current = targetIdx
      try {
        localStorage.setItem(STORAGE_INDEX_KEY, targetIdx.toString())
      } catch (e) {}

      const track = SONGS[targetIdx]
      const savedPos = parseFloat(localStorage.getItem(STORAGE_POS_PREFIX + track.id) || '0')

      isSwitchingTrackRef.current = true

      const currentSrcPath = audio.src ? new URL(audio.src, window.location.href).pathname : ''
      if (currentSrcPath !== track.src) {
        audio.src = track.src
      }

      const applyPosition = () => {
        if (savedPos > 0 && (!audio.duration || savedPos < audio.duration)) {
          try {
            audio.currentTime = savedPos
          } catch (e) {}
        }
        isSwitchingTrackRef.current = false
      }

      if (audio.readyState >= 1) {
        applyPosition()
      } else {
        const onMeta = () => {
          audio.removeEventListener('loadedmetadata', onMeta)
          applyPosition()
        }
        audio.addEventListener('loadedmetadata', onMeta)
      }

      // Synchronous play() call within click event for browser policy compliance
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true)
          try {
            localStorage.setItem(STORAGE_STATE_KEY, 'playing')
          } catch (e) {}
        }).catch(err => {
          console.error('Audio playback error:', err)
          setIsPlaying(false)
          isSwitchingTrackRef.current = false
        })
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

      <a href="https://www.anticipate.systems" className={styles.navLink}>
        Anticipate
      </a>

      {/* Hidden audio element without controls; src is managed imperatively without React reconciliation conflicts */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </main>
  )
}
