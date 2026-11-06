import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { CampaignDetail } from '../api/types'
import { formatDay, formatMoney, formatPlain, progressOf } from './format'
import { SUGGESTED_AMOUNTS } from './amounts'

interface Props {
  campaign: CampaignDetail
  /** Shows the "sample data" strip while the page runs on the mock API. */
  isSample?: boolean
  /** The payment step for the chosen amount. `back` returns to the amounts. */
  renderPayment: (amount: number, back: () => void) => ReactNode
}

export default function CampaignPage({ campaign, isSample = false, renderPayment }: Props) {
  const progress = progressOf(campaign.raisedAmount, campaign.goalAmount)
  const headingId = useId()

  return (
    <div className="page">
      {isSample && <p className="sample-strip">Vista previa: cifras y nombres de ejemplo, no reales.</p>}

      <header className="wall wall--yellow">
        <div className="wall__top">
          <span className="signature">SF Vibe Lab · Mérida</span>
          <a className="wall__skip" href="#donar">
            Donar
          </a>
        </div>
        <h1 id={headingId} className="sign">
          {campaign.name}
        </h1>
        <p className="wall__line">
          Somos estudiantes de la UADY en Mérida y vamos a Mexico Dreamin, en la Ciudad de México. Ayúdanos a llegar.
        </p>
        {campaign.imageUrl && (
          <figure className="bill">
            <img src={campaign.imageUrl} alt="" loading="eager" />
          </figure>
        )}
      </header>

      <section className="band" aria-label="Avance de la campaña">
        <p className="band__raised">
          <span className="numeral">{formatMoney(campaign.raisedAmount)}</span>
          <span className="band__of">
            de {formatMoney(campaign.goalAmount)} MXN · cierra el {formatDay(campaign.endDate)}
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
            ? `Faltan ${formatMoney(progress.remaining)}`
            : progress.over > 0
              ? `Meta superada por ${formatMoney(progress.over)}`
              : 'Meta alcanzada'}
        </p>
      </section>

      <DonatePanel renderPayment={renderPayment} />

      <article className="story">
        <h2 className="sign-small">Para qué es</h2>
        <p className="story__lead">{campaign.purpose}</p>
        <p>{campaign.description}</p>
      </article>

      <Supporters supporters={campaign.supporters} />

      <footer className="foot">
        <p>
          Proyecto académico del SF Vibe Lab. Los pagos usan Stripe en modo de prueba: no se cobra dinero real y no se
          emiten facturas fiscales.
        </p>
      </footer>
    </div>
  )
}

function DonatePanel({ renderPayment }: Pick<Props, 'renderPayment'>) {
  const [amount, setAmount] = useState<number>(250)
  const [open, setOpen] = useState(false)
  // The form mounts on the first open and stays, so closing the modal keeps what the donor typed.
  const [started, setStarted] = useState(false)
  const groupId = useId()
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const donateRef = useRef<HTMLButtonElement>(null)

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
              aria-checked={amount === value}
              className="tile"
              aria-label={formatMoney(value)}
              onClick={() => setAmount(value)}
            >
              <span className="tile__value" aria-hidden="true">
                {formatPlain(value)}
              </span>
            </button>
          ))}
        </div>
        <p className="donate__min">Pesos mexicanos · mínimo $50 · pago seguro con tarjeta</p>
        <button
          ref={donateRef}
          type="button"
          className="sign-button"
          aria-haspopup="dialog"
          onClick={() => {
            setStarted(true)
            setOpen(true)
          }}
        >
          Donar {formatMoney(amount)}
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
        <div className="sheet__body">{started && renderPayment(amount, close)}</div>
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
