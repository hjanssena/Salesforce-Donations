import type { CampaignDetail } from '../types'

/**
 * Mock data, built from the examples in docs/contract.md. Every name and
 * amount is fictitious. The open campaign is the contract's example as is,
 * except `imageUrl`: the contract's URL does not exist, so it is left out.
 */
export const openCampaign: CampaignDetail = {
  id: '701Hs00000AbCdEFGH',
  name: 'Becas Mexico Dreamin 2026',
  description: 'Apoyo para estudiantes de la UADY que asisten al evento.',
  purpose: 'Pagar la inscripción y el transporte de 20 estudiantes.',
  imageUrl: null,
  goalAmount: 50000,
  raisedAmount: 61250.5,
  startDate: '2026-11-01',
  endDate: '2026-12-15',
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

export const completedCampaign: CampaignDetail = {
  id: '701Hs00000XyZwVUTS',
  name: 'Mexico Dreamin 2025',
  description: 'La primera generación del SF Vibe Lab que viajó a la conferencia.',
  purpose: 'Pagar el transporte de 8 estudiantes.',
  imageUrl: null,
  goalAmount: 20000,
  raisedAmount: 22400,
  startDate: '2025-10-01',
  endDate: '2025-11-20',
  status: 'completed',
  supporters: [
    { displayName: 'Ana López', amount: 400 },
    { displayName: 'Empresa Ejemplo', amount: 5000 },
  ],
}

/** A second open campaign, for the list of open campaigns (`?mock=many-open`). Goal not reached yet. */
export const secondOpenCampaign: CampaignDetail = {
  id: '701Hs00000HoSpEDAJ',
  name: 'Hospedaje en la Ciudad de México',
  description: 'Tres noches de hotel cerca de la sede para el grupo que viaja.',
  purpose: 'Pagar el hospedaje de 20 estudiantes durante el evento.',
  imageUrl: null,
  goalAmount: 30000,
  raisedAmount: 8450,
  startDate: '2026-11-03',
  endDate: '2026-11-28',
  status: 'open',
  supporters: [
    { displayName: 'Familia Canul', amount: 2000 },
    { displayName: 'Luis Pech', amount: 450 },
  ],
}

/** A completed campaign that ended short of its goal. */
export const shortCompletedCampaign: CampaignDetail = {
  id: '701Hs00000TaLLeRAB',
  name: 'Taller de Trailhead 2025',
  description: 'Un taller de fin de semana en Mérida para preparar a la primera generación.',
  purpose: 'Rentar el salón y las computadoras del taller.',
  imageUrl: null,
  goalAmount: 15000,
  raisedAmount: 9800,
  startDate: '2025-05-01',
  endDate: '2025-06-15',
  status: 'completed',
  supporters: [{ displayName: 'Comunidad Trailblazer Mérida', amount: 3000 }],
}

/** Starts on a date far ahead: the API never returns it. */
export const futureCampaign: CampaignDetail = {
  id: '701Hs00000FuTuReAA',
  name: 'Mexico Dreamin 2027',
  description: 'La siguiente generación.',
  purpose: 'Por definir.',
  imageUrl: null,
  goalAmount: 60000,
  raisedAmount: 0,
  startDate: '2099-01-01',
  endDate: '2099-02-01',
  status: 'open',
  supporters: [],
}

/** Fictitious banned words, so the mock can answer BANNED_WORD. */
export const MOCK_BANNED_WORDS = ['groseria', 'spam'] as const

/**
 * Donor emails that make the mock fail on purpose, to exercise the error
 * paths: POST /payment-sessions answers 502 or 500 for them.
 */
export const MOCK_TRIGGERS = {
  providerError: 'provider-error@example.com',
  internalError: 'internal-error@example.com',
} as const
