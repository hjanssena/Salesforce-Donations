import { useId, useRef } from 'react'
import type { Campaign, CampaignStatus } from '../api/types'
import { Link } from '../Link'
import { ROUTES, useFocusOnNavigate } from '../router'
import SiteFooter, { SampleStrip } from '../site/SiteFooter'
import { formatDay, formatFullDay, formatMoney, formatPercent, progressOf } from './format'
import Bill from './Bill'

interface Props {
  status: CampaignStatus
  campaigns: Campaign[]
  isSample?: boolean
}

/**
 * Campaigns as boards hung on the wall, one under the other: there are only
 * ever a few, so each gets the full width (RF-D1a CA1, RF-D1c CA1).
 */
export default function CampaignList({ status, campaigns, isSample = false }: Props) {
  const open = status === 'open'
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()
  useFocusOnNavigate(headingRef)

  return (
    <div className={`listing listing--${status}`}>
      {isSample && <SampleStrip />}

      <header className={`wall listing__wall ${open ? 'wall--yellow' : 'wall--anil'}`}>
        <div className="wall__top">
          <span className="signature">SF Vibe Lab · Mérida</span>
          {open ? (
            <Link className="wall__skip" href={ROUTES.completed}>
              Campañas terminadas
            </Link>
          ) : (
            <Link className="wall__skip" href={ROUTES.open}>
              Campañas abiertas
            </Link>
          )}
        </div>
        <h1 id={headingId} ref={headingRef} tabIndex={-1} className="sign">
          {open ? 'Elige una campaña' : 'Campañas terminadas'}
        </h1>
        <p className="wall__line">
          {open ? (
            <>
              Somos estudiantes de la UADY en Mérida y vamos a Mexico Dreamin, una conferencia en la Ciudad de México.{' '}
              <strong>Ayúdanos a llegar.</strong>
            </>
          ) : (
            'Lo que juntamos en campañas anteriores, gracias a quienes donaron.'
          )}
        </p>
      </header>

      <section className="boards" aria-labelledby={headingId}>
        {campaigns.length === 0 ? (
          <p className="boards__empty">
            {open ? 'Por ahora no hay campañas abiertas.' : 'Todavía no hay campañas terminadas.'}
          </p>
        ) : (
          <ul className="boards__list">
            {campaigns.map((campaign) =>
              open ? <OpenBoard key={campaign.id} campaign={campaign} /> : <ClosedBoard key={campaign.id} campaign={campaign} />,
            )}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  )
}

function OpenBoard({ campaign }: { campaign: Campaign }) {
  const progress = progressOf(campaign.raisedAmount, campaign.goalAmount)
  const href = ROUTES.campaign(campaign.id)
  const nameId = useId()

  return (
    <li className="board" aria-labelledby={nameId}>
      {/* The photo is the board's own left coat, full height, not a bill framed inside it. */}
      <Bill src={campaign.imageUrl} className="board__bill" />
      <div className="board__body">
        <h2 id={nameId} className="board__name">
          {/* Its hit area covers the whole board, so the photo and the tally open the campaign too. */}
          <Link href={href}>{campaign.name}</Link>
        </h2>
        <p className="board__purpose">{campaign.purpose}</p>
        <p className="board__description">{campaign.description}</p>
      </div>

      <div className="board__tally">
        <p className="tally__raised">
          <span className="tally__numeral">{formatMoney(campaign.raisedAmount)}</span>
          <span className="tally__of">
            de {formatMoney(campaign.goalAmount)} MXN · cierra el {formatDay(campaign.endDate)}
          </span>
        </p>
        <Meter percent={progress.percent} fill={progress.fill} />
        <p className="tally__gap">
          {progress.remaining > 0
            ? `Faltan ${formatMoney(progress.remaining)}`
            : progress.over > 0
              ? `Meta superada por ${formatMoney(progress.over)}`
              : 'Meta alcanzada'}
        </p>
        <Link className="sign-button board__go" href={href} aria-label={`Ver y donar: ${campaign.name}`}>
          Ver y donar
        </Link>
      </div>
    </li>
  )
}

function ClosedBoard({ campaign }: { campaign: Campaign }) {
  const progress = progressOf(campaign.raisedAmount, campaign.goalAmount)
  const href = ROUTES.campaign(campaign.id)
  const nameId = useId()

  return (
    <li className="board board--closed" aria-labelledby={nameId}>
      {/* The photo is the board's own left coat, full height, not a bill framed inside it. */}
      <Bill src={campaign.imageUrl} className="board__bill" />
      <div className="board__body">
        <h2 id={nameId} className="board__name">
          {/* Its hit area covers the whole board, so the photo and the tally open the campaign too. */}
          <Link href={href}>{campaign.name}</Link>
        </h2>
        <p className="board__purpose">{campaign.purpose}</p>
        <p className="board__description">{campaign.description}</p>
      </div>

      <div className="board__tally">
        <dl className="tally__sums">
          <div>
            <dt>Juntamos</dt>
            <dd className="tally__numeral">{formatMoney(campaign.raisedAmount)}</dd>
          </div>
          <div>
            <dt>Meta</dt>
            <dd className="tally__goal">{formatMoney(campaign.goalAmount)}</dd>
          </div>
        </dl>
        <Meter percent={progress.percent} fill={progress.fill} />
        <p className="tally__gap">
          {progress.over > 0 || progress.remaining === 0
            ? `${formatPercent(progress.percent)} de la meta`
            : `Llegó al ${formatPercent(progress.percent)}`}
        </p>
        <p className="tally__of">Cerró el {formatFullDay(campaign.endDate)}</p>
        <Link className="text-button board__more" href={href}>
          Ver la campaña y sus donantes
        </Link>
      </div>
    </li>
  )
}

function Meter({ percent, fill }: { percent: number; fill: number }) {
  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(percent, 100))}
      aria-valuetext={`${Math.round(percent)}% de la meta`}
    >
      <span className="meter__paint" style={{ transform: `scaleX(${fill})` }} />
    </div>
  )
}
