import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createApi, type ApiClient } from './api'
import type { CampaignDetail } from './api/types'
import CampaignPage from './campaign/CampaignPage'
import { ConfigError, readConfig, type AppConfig } from './config/config'
import PaymentStep from './donate/PaymentStep'
import { createGateway } from './payment'
import { THANKS_PATH, type PaymentGateway } from './payment/gateway'
import ThankYouPage from './thanks/ThankYouPage'

interface Props {
  /** Tests pass their own client and gateway; the app builds them from the configuration. */
  api?: ApiClient
  gateway?: PaymentGateway
  path?: string
}

export default function App({ api, gateway, path = window.location.pathname }: Props) {
  let config: AppConfig
  try {
    config = readConfig()
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error
    console.error(error.message)
    return (
      <Notice title="Volvemos pronto" role="alert">
        El sitio no está disponible por el momento. Intenta más tarde.
      </Notice>
    )
  }
  const payments = gateway ?? createGateway(config)
  if (path === THANKS_PATH) return <ThankYouPage gateway={payments} publishableKey={config.stripePublishableKey} />
  return <CampaignLoader config={config} api={api} gateway={payments} />
}

type Load =
  | { state: 'loading' }
  | { state: 'ready'; campaign: CampaignDetail }
  | { state: 'none-open' }
  | { state: 'failed' }

function CampaignLoader({ config, api: given, gateway }: { config: AppConfig; api?: ApiClient; gateway: PaymentGateway }) {
  // The configuration is fixed for the page's life, so the client is built once.
  const [api] = useState(() => given ?? createApi(config))
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => {
    setLoad({ state: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // Few campaigns run at once; the soonest to close opens directly.
        const [first] = await api.listCampaigns('open')
        if (!first) {
          if (active) setLoad({ state: 'none-open' })
          return
        }
        const campaign = await api.getCampaign(first.id)
        if (active) setLoad({ state: 'ready', campaign })
      } catch (error) {
        console.error(error)
        if (active) setLoad({ state: 'failed' })
      }
    })()
    return () => {
      active = false
    }
  }, [api, attempt])

  switch (load.state) {
    case 'loading':
      // No big lettering for a wait this short: just the wall and a line.
      return (
        <main className="unavailable">
          <p role="status" className="notice__text">
            Cargando la campaña…
          </p>
        </main>
      )
    case 'none-open':
      return (
        <Notice title="Sin campañas abiertas">
          Por ahora no hay campañas abiertas. Vuelve pronto.
        </Notice>
      )
    case 'failed':
      return (
        <Notice
          title="No cargó la campaña"
          role="alert"
          action={
            <button type="button" className="sign-button notice__retry" onClick={retry}>
              Reintentar
            </button>
          }
        >
          Revisa tu conexión e inténtalo de nuevo.
        </Notice>
      )
    case 'ready':
      return (
        <main>
          <CampaignPage
            campaign={load.campaign}
            isSample={config.apiMode === 'mock'}
            renderPayment={(amount, back) => (
              <PaymentStep
                campaignId={load.campaign.id}
                amount={amount}
                onChangeAmount={back}
                api={api}
                gateway={gateway}
                publishableKey={config.stripePublishableKey}
              />
            )}
          />
        </main>
      )
  }
}

interface NoticeProps {
  title: string
  role?: 'alert' | 'status'
  action?: ReactNode
  children: ReactNode
}

function Notice({ title, role, action, children }: NoticeProps) {
  return (
    <main className="unavailable">
      <div role={role} className="notice">
        <h1 className="sign">{title}</h1>
        <p className="notice__text">{children}</p>
      </div>
      {action}
    </main>
  )
}
