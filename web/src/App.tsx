import CampaignPage from './campaign/CampaignPage'
import { sampleCampaign } from './campaign/sample'
import { ConfigError, readConfig } from './config/config'

export default function App() {
  try {
    readConfig()
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error
    console.error(error.message)
    return (
      <main className="unavailable" role="alert">
        <h1 className="sign">Volvemos pronto</h1>
        <p>El sitio no está disponible por el momento. Intenta más tarde.</p>
      </main>
    )
  }

  // Sample data until the mock server (#34) and the API (#44) are connected.
  return (
    <main>
      <CampaignPage campaign={sampleCampaign} isSample />
    </main>
  )
}
