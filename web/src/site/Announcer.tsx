import { useEffect, useState } from 'react'
import { setAnnouncer } from './announce'

/** A status region that outlives every view, for "the page is ready" messages. */
export default function Announcer() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    setAnnouncer(setMessage)
    return () => setAnnouncer(null)
  }, [])
  return (
    <p role="status" className="visually-hidden">
      {message}
    </p>
  )
}
