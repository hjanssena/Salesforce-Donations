import { ConfigError, readConfig } from './config/config'

// Placeholder shell until the campaign pages land (#20 and later).
export default function App() {
  let configOk = true
  try {
    readConfig()
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error
    console.error(error.message)
    configOk = false
  }

  return (
    <main className="shell">
      <h1>Donativos Mexico Dreamin</h1>
      {configOk ? (
        <p>Muy pronto podrás apoyar a los estudiantes del SF Vibe Lab desde aquí.</p>
      ) : (
        <p role="alert">El sitio no está disponible por el momento. Intenta más tarde.</p>
      )}
    </main>
  )
}
