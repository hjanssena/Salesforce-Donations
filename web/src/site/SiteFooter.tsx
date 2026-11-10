import { Link } from '../Link'
import { ROUTES } from '../router'

/** The enamel strip at the foot of every campaign page: the way between views, and the test-mode notice. */
export default function SiteFooter() {
  return (
    <footer className="foot">
      <nav className="foot__nav" aria-label="Campañas">
        <Link href={ROUTES.open}>Campañas abiertas</Link>
        <Link href={ROUTES.completed}>Campañas terminadas</Link>
      </nav>
      <p>
        Proyecto académico del SF Vibe Lab. Los pagos usan Stripe en modo de prueba: no se cobra dinero real y no se
        emiten facturas fiscales.
      </p>
    </footer>
  )
}

export function SampleStrip() {
  return <p className="sample-strip">Vista previa: cifras y nombres de ejemplo, no reales.</p>
}
