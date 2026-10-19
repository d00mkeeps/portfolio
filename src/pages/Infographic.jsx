import { useEffect } from 'react'

export default function Infographic() {
  useEffect(() => {
    window.location.replace('/infographic/')
  }, [])

  return null
}
