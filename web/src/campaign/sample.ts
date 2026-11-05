import type { CampaignDetail } from '../api/types'

/**
 * Sample campaign for the visual preview, until the mock server (#34) and the
 * real API (#44) are connected. Every value here is fictitious and the page
 * labels it as sample data.
 */
export const sampleCampaign: CampaignDetail = {
  id: 'sample-campaign',
  name: 'Becas Mexico Dreamin 2026',
  description:
    'Somos estudiantes del SF Vibe Lab, el programa de la UADY con Salesforce en Mérida. Este año vamos a Mexico Dreamin, la conferencia de la comunidad Salesforce en la Ciudad de México.',
  purpose: 'Cubrir el boleto, el transporte y el hospedaje de los estudiantes que viajan a la conferencia.',
  imageUrl: null,
  goalAmount: 50000,
  raisedAmount: 31250,
  startDate: '2026-11-01',
  endDate: '2026-11-15',
  status: 'open',
  supporters: [
    { displayName: 'Ana López', amount: 500 },
    { displayName: 'Empresa Ejemplo', amount: 2000 },
    { displayName: 'Luis Pech', amount: 250 },
    { displayName: 'Familia Canul', amount: 1000 },
    { displayName: 'Comunidad Trailblazer Mérida', amount: 5000 },
    { displayName: 'Mariana C.', amount: 100 },
  ],
}

export const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000] as const
