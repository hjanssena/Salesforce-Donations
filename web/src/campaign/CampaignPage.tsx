import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { CampaignDetail } from '../api/types'
import { Link } from '../Link'
import { ROUTES, useFocusOnNavigate } from '../router'
import SiteFooter, { SampleStrip } from '../site/SiteFooter'
import Bill from './Bill'
import { formatDay, formatFullDay, formatMoney, formatPlain, progressOf } from './format'
import { parseCustomAmount, SUGGESTED_AMOUNTS } from './amounts'

interface Props {
  campaign: CampaignDetail
  /** Shows the "sample data" strip while the page runs on the mock API. */
  isSample?: boolean
  /** Shows the way back to the campaign list. Off when the campaign opens directly at the site's root. */
  showBack?: boolean
  /** The payment step for the chosen amount. `back` returns to the amounts. */
  renderPayment: (amount: number, back: () => void) => ReactNode
}

export default function CampaignPage({ campaign, isSample = false, showBack = false, renderPayment }: Props) {
  const progress = progressOf(campaign.raisedAmount, campaign.goalAmount)
  const headingId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnNavigate(headingRef)
  // A completed campaign is read only: its tally and supporters, never a way to donate (RF-D1c CA3).
  const closed = campaign.status === 'completed'

  return (
    <div className={closed ? 'page page--closed' : 'page'}>
      {isSample && <SampleStrip />}

      {/* A closed campaign's wall is weathered: the coat has faded, the lettering stays. */}
      <header className={closed ? 'wall wall--weathered' : 'wall wall--yellow'}>
        <div className="wall__top">
          <span className="signature">SF Vibe Lab · Mérida</span>
          {showBack || closed ? (
            // Short enough to share the row with the signature on a 320px phone; the full name is for screen readers.
            <Link
              className="wall__skip"
              href={closed ? ROUTES.completed : ROUTES.open}
              aria-label={closed ? 'Campañas terminadas' : 'Todas las campañas'}
            >
              <span aria-hidden="true">← </span>Campañas
            </Link>
          ) : (
            // Only phones need the jump: on desktop the donate board is already beside the wall.
            <a className="wall__skip wall__skip--jump" href="#donar">
              Ir a donar
            </a>
          )}
        </div>
        <div className="wall__copy">
          <h1 id={headingId} ref={headingRef} tabIndex={-1} className="sign">
            {campaign.name}
          </h1>
          {/* The campaign's own purpose, from Salesforce; the closed state is told by the wall, band and board. */}
          <p className="wall__line">{campaign.purpose}</p>
        </div>
        <Bill src={campaign.imageUrl} loading="eager" />
      </header>

      <section className="band" aria-label="Avance de la campaña">
        <p className="band__raised">
          <span className="numeral">{formatMoney(campaign.raisedAmount)}</span>
          <span className="band__of">
            de {formatMoney(campaign.goalAmount)} MXN ·{' '}
            {closed ? `cerró el ${formatFullDay(campaign.endDate)}` : `cierra el ${formatDay(campaign.endDate)}`}
          </span>
        </p>
        <div
          className="meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(Math.min(progress.percent, 100))}
          aria-valuetext={`${Math.round(progress.percent)}% de la meta`}
        >
          <span className="meter__paint" style={{ transform: `scaleX(${progress.fill})` }} />
        </div>
        <p className="band__gap">
          {progress.remaining > 0
            ? `${closed ? 'Faltaron' : 'Faltan'} ${formatMoney(progress.remaining)}`
            : progress.over > 0
              ? `Meta superada por ${formatMoney(progress.over)}`
              : 'Meta alcanzada'}
        </p>
      </section>

      {closed ? <ClosedPanel endDate={campaign.endDate} /> : <DonatePanel renderPayment={renderPayment} />}

      <article className="story">
        <h2 className="sign-small">Para qué es</h2>
        <p className="story__lead">{campaign.description}</p>
      </article>

      <Supporters supporters={campaign.supporters} />

      <SiteFooter />
    </div>
  )
}

/** Where the donate board hangs on an open campaign: a board that says the campaign is closed. */
function ClosedPanel({ endDate }: { endDate: string }) {
  const titleId = useId()
  return (
    <section className="donate" aria-labelledby={titleId}>
      <div className="donate__inner closed">
        <h2 id={titleId} className="sign-small">
          Campaña cerrada
        </h2>
        <p className="closed__text">Terminó el {formatFullDay(endDate)} y ya no recibe donativos.</p>
        <Link className="sign-button closed__go" href={ROUTES.open}>
          Ver campañas abiertas
        </Link>
      </div>
    </section>
  )
}

function DonatePanel({ renderPayment }: Pick<Props, 'renderPayment'>) {
  // A tile, or null when the donor types their own amount in "Otro monto".
  const [tile, setTile] = useState<number | null>(250)
  // 250 is a suggestion until the donor picks an amount: chosen, but not painted almagre,
  // because nothing at rest is almagre (the One Moving Colour Rule).
  const [touched, setTouched] = useState(false)
  const [otherText, setOtherText] = useState('')
  const [otherError, setOtherError] = useState('')
  // The amount the open form pays; set each time the donor presses "Donar".
  const [payAmount, setPayAmount] = useState(250)
  const [open, setOpen] = useState(false)
  // The form mounts on the first open and stays, so closing the modal keeps what the donor typed.
  const [started, setStarted] = useState(false)
  const groupId = useId()
  const titleId = useId()
  const otherId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const donateRef = useRef<HTMLButtonElement>(null)
  const otherRef = useRef<HTMLInputElement>(null)

  const other = parseCustomAmount(otherText)
  const amount = tile ?? other.amount

  function pickTile(value: number) {
    setTouched(true)
    setTile(value)
    setOtherText('')
    setOtherError('')
  }

  function typeOther(text: string) {
    setTouched(true)
    setOtherText(text)
    if (text.trim() !== '') setTile(null)
    // Once an error shows, it follows the typing so a fixed amount clears it.
    if (otherError) setOtherError(parseCustomAmount(text).error ?? '')
  }

  function donate() {
    if (amount === undefined) {
      setOtherError(other.error ?? '')
      otherRef.current?.focus()
      return
    }
    setPayAmount(amount)
    setStarted(true)
    setOpen(true)
  }

  // Opening and closing go through state; the effect keeps the <dialog> in step.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      // Reopened after a new amount: start at the top, where the amount shows.
      dialog.scrollTop = 0
      dialog.querySelector<HTMLElement>('h2')?.focus()
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
      donateRef.current?.focus()
    }
  }, [open])

  const dialogId = useId()
  // Read from the DOM when called, never during render.
  const busy = () => Boolean(document.getElementById(dialogId)?.querySelector('[aria-busy="true"]'))
  const close = () => {
    // While a payment is in flight the donor waits for its answer.
    if (!busy()) setOpen(false)
  }

  return (
    <section id="donar" className="donate" aria-labelledby={groupId}>
      <div className="donate__inner">
        <h2 id={groupId} className="sign-small">
          Elige tu donativo
        </h2>
        <div className="tiles" role="radiogroup" aria-labelledby={groupId}>
          {SUGGESTED_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={tile === value}
              data-suggested={!touched && tile === value ? 'true' : undefined}
              className="tile"
              aria-label={formatMoney(value)}
              onClick={() => pickTile(value)}
            >
              <span className="tile__value" aria-hidden="true">
                {formatPlain(value)}
              </span>
            </button>
          ))}
        </div>
        <div
          className="other"
          data-chosen={tile === null && amount !== undefined ? 'true' : undefined}
          data-invalid={otherError ? 'true' : undefined}
        >
          <label className="other__label" htmlFor={otherId}>
            Otro monto
          </label>
          <div className="other__box">
            <span className="other__unit" aria-hidden="true">
              $
            </span>
            <input
              ref={otherRef}
              id={otherId}
              className="other__input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={otherText}
              aria-invalid={Boolean(otherError)}
              aria-describedby={otherError ? `${otherId}-error` : undefined}
              onChange={(e) => typeOther(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') donate()
              }}
            />
            <span className="other__unit" aria-hidden="true">
              MXN
            </span>
          </div>
          {otherError && (
            <p id={`${otherId}-error`} className="field__error">
              {otherError}
            </p>
          )}
        </div>
        <p className="donate__min">Pesos mexicanos · mínimo $50 · pago seguro con tarjeta</p>
        <button ref={donateRef} type="button" className="sign-button" aria-haspopup="dialog" onClick={donate}>
          {amount === undefined ? 'Donar' : `Donar ${formatMoney(amount)}`}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className="sheet"
        aria-labelledby={titleId}
        onCancel={(event) => {
          // Escape: close through state, or not at all while paying.
          event.preventDefault()
          close()
        }}
        onClose={() => setOpen(false)}
      >
        <div className="sheet__head">
          <h2 id={titleId} className="sign-small" tabIndex={-1}>
            Tus datos
          </h2>
          <button type="button" className="text-button" onClick={close}>
            Cerrar
          </button>
        </div>
        <div className="sheet__body">{started && renderPayment(payAmount, close)}</div>
      </dialog>
    </section>
  )
}

function Supporters({ supporters }: { supporters: CampaignDetail['supporters'] }) {
  return (
    <section className="thanks" aria-labelledby="thanks-title">
      <h2 id="thanks-title" className="sign-small">
        Gracias
      </h2>
      {supporters.length === 0 ? (
        <p className="thanks__empty">Aún no hay nombres en la pared. El tuyo puede ser el primero.</p>
      ) : (
        <ol className="thanks__list">
          {supporters.map((s, i) => (
            // Newest first, painted darkest; older names weather.
            <li key={`${s.displayName}-${i}`} className="thanks__row" data-age={Math.min(i, 3)}>
              <span className="thanks__name">{s.displayName}</span>
              <span className="thanks__amount">{formatMoney(s.amount)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
