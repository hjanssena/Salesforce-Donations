import { useState } from 'react'

interface Props {
  src: string | null | undefined
  className?: string
  /** The page's photo loads at once; a list loads its photos as they scroll in. */
  loading?: 'eager' | 'lazy'
}

/**
 * The campaign photo pasted on the wall like a bill. The frame is always 16:9 and the photo is
 * cropped to it, whatever size the staff uploaded. A missing or broken photo takes the bill off the
 * wall instead of leaving an empty frame.
 */
export default function Bill({ src, className, loading = 'lazy' }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) return null
  return (
    <figure className={className ? `bill ${className}` : 'bill'}>
      {/* width and height give the browser the 16:9 box before the photo arrives. */}
      <img src={src} alt="" width={1600} height={900} loading={loading} decoding="async" onError={() => setFailedSrc(src)} />
    </figure>
  )
}
