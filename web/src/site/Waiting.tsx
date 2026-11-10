import { useEffect, useState } from 'react'
import { SampleStrip } from './SiteFooter'

/** The coat the page will have: yellow for open campaigns, añil for past ones, a primer when it is not known yet. */
export type WaitingTone = 'yellow' | 'anil' | 'primer'

const TONE_CLASS: Record<WaitingTone, string> = {
  yellow: 'wall--yellow',
  anil: 'wall--anil',
  primer: 'wall--weathered',
}

/** Before this, a fast answer replaces the wall without a word flashing on it. */
const WAITING_QUIET_MS = 300
/** After this, the line admits the connection is slow. */
const WAITING_SLOW_MS = 5000

const SLOW_TEXT = 'Sigue cargando… la conexión está lenta.'

interface Props {
  /** What is being prepared, e.g. "Preparando la campaña…". */
  text: string
  tone?: WaitingTone
  isSample?: boolean
}

/**
 * The page before its words arrive: the same wall, signature and strip the page
 * will have, with one line where the headline will land. Only the words change
 * when the page is ready, so nothing jumps.
 */
export default function Waiting({ text, tone = 'yellow', isSample = false }: Props) {
  const [phase, setPhase] = useState<'quiet' | 'shown' | 'slow'>('quiet')

  useEffect(() => {
    const shown = window.setTimeout(() => setPhase('shown'), WAITING_QUIET_MS)
    const slow = window.setTimeout(() => setPhase('slow'), WAITING_SLOW_MS)
    return () => {
      window.clearTimeout(shown)
      window.clearTimeout(slow)
    }
  }, [])

  return (
    <main className="waiting-page" aria-busy="true">
      {isSample && <SampleStrip />}
      <div className={`wall waiting ${TONE_CLASS[tone]}`}>
        <div className="wall__top">
          <span className="signature">SF Vibe Lab · Mérida</span>
        </div>
        {/* Mounted empty and filled later, so screen readers announce the change. */}
        <p role="status" className="waiting__line">
          {phase === 'quiet' ? '' : phase === 'shown' ? text : SLOW_TEXT}
        </p>
        {phase !== 'quiet' && <span className="waiting__brush" aria-hidden="true" />}
      </div>
    </main>
  )
}
