import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ApiError, createApi, type ApiClient } from './api'
import type { CampaignDetail } from './api/types'
import CampaignList from './campaign/CampaignList'
import CampaignPage from './campaign/CampaignPage'
import { ConfigError, readConfig, type AppConfig } from './config/config'
import PaymentStep from './donate/PaymentStep'
import { createGateway } from './payment'
import { THANKS_PATH, type PaymentGateway } from './payment/gateway'
import { Link } from './Link'
import { matchRoute, ROUTES, useFocusOnNavigate, usePath } from './router'
import ThankYouPage from './thanks/ThankYouPage'
import { useLoad } from './useLoad'

interface Props {
  /** Tests pass their own client and gateway; the app builds them from the configuration. */
  api?: ApiClient
  gateway?: PaymentGateway
  path?: string
}

const SITE_TITLE = 'SF Vibe Lab · Ayúdanos a llegar a Mexico Dreamin'

export default function App({ api, gateway, path }: Props) {
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
  return <Site config={config} api={api} gateway={gateway} initialPath={path} />
}

interface SiteProps {
  config: AppConfig
  api?: ApiClient
  gateway?: PaymentGateway
  initialPath?: string
}

function Site({ config, api: givenApi, gateway: givenGateway, initialPath }: SiteProps) {
  // The configuration is fixed for the page's life, so the client and the gateway are built once.
  const [api] = useState(() => givenApi ?? createApi(config))
  const [gateway] = useState(() => givenGateway ?? createGateway(config))
  const route = matchRoute(usePath(initialPath), THANKS_PATH)
  const views: ViewProps = { config, api, gateway }

  switch (route.name) {
    case 'thanks':
      return <ThankYouPage gateway={gateway} publishableKey={config.stripePublishableKey} />
    case 'home':
      return <HomeView {...views} />
    case 'open':
      return <ListView {...views} status="open" />
    case 'completed':
      return <ListView {...views} status="completed" />
    case 'campaign':
      return <CampaignView {...views} id={route.id} />
    case 'not-found':
      return <NotFoundNotice />
  }
}

interface ViewProps {
  config: AppConfig
  api: ApiClient
  gateway: PaymentGateway
}

function useTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · SF Vibe Lab` : SITE_TITLE
  }, [title])
}

type Home = { kind: 'none' } | { kind: 'one'; campaign: CampaignDetail } | { kind: 'many'; list: Awaited<ReturnType<ApiClient['listCampaigns']>> }

/** The site's root: one open campaign opens directly, several show the list, none shows a notice (RF-D1a, RF-D1c). */
function HomeView({ config, api, gateway }: ViewProps) {
  const [load, retry] = useLoad<Home>(async () => {
    const list = await api.listCampaigns('open')
    if (list.length === 0) return { kind: 'none' }
    if (list.length > 1) return { kind: 'many', list }
    return { kind: 'one', campaign: await api.getCampaign(list[0].id) }
  }, 'home')
  useTitle(null)

  if (load.state === 'loading') return <Loading text="Cargando la campaña…" />
  if (load.state === 'failed') return <FailedNotice title="No cargó la campaña" retry={retry} />
  const home = load.value
  if (home.kind === 'none') return <NoneOpenNotice />
  if (home.kind === 'many') {
    return (
      <main>
        <CampaignList status="open" campaigns={home.list} isSample={config.apiMode === 'mock'} />
      </main>
    )
  }
  return <CampaignScreen config={config} api={api} gateway={gateway} campaign={home.campaign} showBack={false} />
}

function ListView({ config, api, status }: ViewProps & { status: 'open' | 'completed' }) {
  const [load, retry] = useLoad(() => api.listCampaigns(status), status)
  useTitle(status === 'open' ? 'Campañas abiertas' : 'Campañas terminadas')

  if (load.state === 'loading') return <Loading text="Cargando las campañas…" />
  if (load.state === 'failed') return <FailedNotice title="No cargaron las campañas" retry={retry} />
  if (status === 'open' && load.value.length === 0) return <NoneOpenNotice />
  return (
    <main>
      <CampaignList status={status} campaigns={load.value} isSample={config.apiMode === 'mock'} />
    </main>
  )
}

function CampaignView({ config, api, gateway, id }: ViewProps & { id: string }) {
  const [load, retry] = useLoad(() => api.getCampaign(id), id)
  useTitle(load.state === 'ready' ? load.value.name : null)

  if (load.state === 'loading') return <Loading text="Cargando la campaña…" />
  if (load.state === 'failed') {
    if (load.error instanceof ApiError && load.error.code === 'CAMPAIGN_NOT_FOUND') return <NotFoundNotice />
    return <FailedNotice title="No cargó la campaña" retry={retry} />
  }
  return <CampaignScreen config={config} api={api} gateway={gateway} campaign={load.value} showBack />
}

function CampaignScreen({ config, api, gateway, campaign, showBack }: ViewProps & { campaign: CampaignDetail; showBack: boolean }) {
  return (
    <main>
      <CampaignPage
        campaign={campaign}
        isSample={config.apiMode === 'mock'}
        showBack={showBack}
        renderPayment={(amount, back) => (
          <PaymentStep
            campaignId={campaign.id}
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

function Loading({ text }: { text: string }) {
  // No big lettering for a wait this short: just the wall and a line.
  return (
    <main className="unavailable">
      <p role="status" className="notice__text">
        {text}
      </p>
    </main>
  )
}

function NoneOpenNotice() {
  return (
    <Notice
      title="Sin campañas abiertas"
      action={
        <Link className="sign-button notice__retry notice__link" href={ROUTES.completed}>
          Ver campañas terminadas
        </Link>
      }
    >
      Ninguna campaña recibe donativos por ahora. Vuelve pronto, o mira lo que juntamos en campañas anteriores.
    </Notice>
  )
}

function NotFoundNotice() {
  useTitle('No encontramos la página')
  return (
    <Notice
      title="No encontramos esa campaña"
      action={
        <Link className="sign-button notice__retry notice__link" href={ROUTES.open}>
          Ver campañas abiertas
        </Link>
      }
    >
      La dirección no corresponde a ninguna campaña. Revisa el enlace o elige una de las campañas abiertas.
    </Notice>
  )
}

function FailedNotice({ title, retry }: { title: string; retry: () => void }) {
  return (
    <Notice
      title={title}
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
}

interface NoticeProps {
  title: string
  role?: 'alert' | 'status'
  action?: ReactNode
  children: ReactNode
}

function Notice({ title, role, action, children }: NoticeProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnNavigate(headingRef)
  return (
    <main className="unavailable">
      <div role={role} className="notice">
        <h1 ref={headingRef} tabIndex={-1} className="sign">
          {title}
        </h1>
        <p className="notice__text">{children}</p>
      </div>
      {action}
    </main>
  )
}
