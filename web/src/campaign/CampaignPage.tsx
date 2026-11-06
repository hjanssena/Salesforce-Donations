import { useId, useState } from 'react'
import type { CampaignDetail } from '../api/types'
import { formatDay, formatMoney, formatPlain, progressOf } from './format'
import { SUGGESTED_AMOUNTS } from './amounts'

interface Props {
  campaign: CampaignDetail
  /** Shows the "sample data" strip while the page runs on the mock API. */
  isSample?: boolean
}

export default function CampaignPage({ campaign, isSample = false }: Props) {
  const progress = progressOf(campaign.raisedAmount, campaign.goalAmount)
  const headingId = useId()

  return (
    <div className="page">
      {isSample && (
        <p className="sample-strip">Vista previa: cifras y nombres de ejemplo, no reales.</p>
      )}

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
        <p className="wall__line">Somos estudiantes de la UADY en Mérida y vamos a Mexico Dreamin, en la Ciudad de México. Ayúdanos a llegar.</p>
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

      <DonatePanel />

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

function DonatePanel() {
  const [amount, setAmount] = useState<number>(250)
  const [notice, setNotice] = useState(false)
  const groupId = useId()

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
              onClick={() => {
                setAmount(value)
                setNotice(false)
              }}
            >
              <span className="tile__value" aria-hidden="true">
                {formatPlain(value)}
              </span>
            </button>
          ))}
        </div>
        <p className="donate__min">Pesos mexicanos · mínimo $50 · pago seguro con tarjeta</p>
        <button type="button" className="sign-button" onClick={() => setNotice(true)}>
          Donar {formatMoney(amount)}
        </button>
        <p className="donate__notice" role="status">
          {notice ? 'El pago con tarjeta se conecta en la siguiente versión del sitio.' : ''}
        </p>
      </div>
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
