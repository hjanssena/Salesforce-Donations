import type { CampaignDetail } from '../types'
import panoramaImage from './images/panorama-3000x600.svg'
import portraitImage from './images/portrait-900x1600.svg'
import squareImage from './images/square-1200x1200.svg'
import tinyImage from './images/tiny-240x135.svg'
import wideImage from './images/wide-1600x900.svg'

/**
 * Mock data, built from the examples in docs/contract.md. Every name and
 * amount is fictitious. The open campaign is the contract's example as is,
 * except `imageUrl`: the contract's URL does not exist, so it points at a local
 * placeholder instead.
 *
 * The photos come in very different shapes, the way staff will upload them:
 * 16:9, portrait, square, a wide panorama, a tiny low-resolution file, and one
 * campaign with no photo at all. Each placeholder carries its size and corner
 * marks, so it shows how the 16:9 or 21:9 frame crops it.
 */
export const openCampaign: CampaignDetail = {
  id: '701Hs00000AbCdEFGH',
  name: 'Becas Mexico Dreamin 2026',
  description: 'Apoyo para estudiantes de la UADY que asisten al evento.',
  purpose: 'Pagar la inscripción y el transporte de 20 estudiantes.',
  imageUrl: wideImage,
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
  imageUrl: squareImage,
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
  imageUrl: portraitImage,
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

/** A third open campaign whose photo is a tiny, low-resolution file (`?mock=many-open`). */
export const tinyImageOpenCampaign: CampaignDetail = {
  id: '701Hs00000PlAyErAS',
  name: 'Playeras del equipo',
  description: 'Playeras con el logo del SF Vibe Lab para que el grupo se reconozca en la sede.',
  purpose: 'Imprimir 25 playeras para estudiantes y mentores.',
  imageUrl: tinyImage,
  goalAmount: 6000,
  raisedAmount: 1500,
  startDate: '2026-11-02',
  endDate: '2026-12-05',
  status: 'open',
  supporters: [{ displayName: 'Mariana C.', amount: 1500 }],
}

/** A fourth open campaign without a photo, so the wall and the board show their no-photo layout (`?mock=many-open`). */
export const noImageOpenCampaign: CampaignDetail = {
  id: '701Hs00000KiTbIeNV',
  name: 'Kit de bienvenida',
  description: 'Gafete, libreta y botella para cada estudiante que viaja por primera vez.',
  purpose: 'Armar 12 kits para la nueva generación.',
  imageUrl: null,
  goalAmount: 4800,
  raisedAmount: 0,
  startDate: '2026-11-04',
  endDate: '2026-12-20',
  status: 'open',
  supporters: [],
}

/** An open campaign that sits exactly at 100% and ends soonest: it stays open until its end date (`?mock=many-open`). */
export const fullGoalOpenCampaign: CampaignDetail = {
  id: '701Hs00000TrAnSpOR',
  name: 'Autobús Mérida–Ciudad de México',
  description: 'Un autobús rentado para que todo el grupo viaje junto a la sede del evento.',
  purpose: 'Rentar un autobús de ida y vuelta para 25 personas.',
  imageUrl: wideImage,
  goalAmount: 18000,
  raisedAmount: 18000,
  startDate: '2026-11-01',
  endDate: '2026-11-20',
  status: 'open',
  supporters: [
    { displayName: 'Empresa Ejemplo', amount: 10000 },
    { displayName: 'Ana López', amount: 3000 },
    { displayName: 'Familia Canul', amount: 2000 },
  ],
}

/** An open campaign close to its goal with a long supporters list, for the scrolling list (`?mock=many-open`). */
export const manySupportersOpenCampaign: CampaignDetail = {
  id: '701Hs00000CoMiDaSX',
  name: 'Comidas durante el evento',
  description: 'Desayuno y comida para el grupo en los dos días de la conferencia.',
  purpose: 'Cubrir 100 comidas para estudiantes y mentores.',
  imageUrl: squareImage,
  goalAmount: 12000,
  raisedAmount: 11040,
  startDate: '2026-11-02',
  endDate: '2026-12-10',
  status: 'open',
  supporters: [
    { displayName: 'Sofía Ek', amount: 100 },
    { displayName: 'Jorge May', amount: 250 },
    { displayName: 'Café La Ceiba', amount: 2000 },
    { displayName: 'Valeria R.', amount: 100 },
    { displayName: 'Daniel Chan', amount: 500 },
    { displayName: 'Lucía Pool', amount: 250 },
    { displayName: 'Grupo de Estudio Apex', amount: 1000 },
    { displayName: 'Ricardo Tun', amount: 150 },
    { displayName: 'Fernanda Uc', amount: 500 },
    { displayName: 'Andrés Cimé', amount: 100 },
    { displayName: 'Paola Dzib', amount: 250 },
    { displayName: 'Miguel Ángel Koh', amount: 1000 },
    { displayName: 'Carmen Euán', amount: 500 },
    { displayName: 'Tienda El Faro', amount: 2000 },
    { displayName: 'Iván Balam', amount: 100 },
  ],
}

/** An open campaign with long text and a far end date, to stress the layout (`?mock=many-open`). */
export const longTextOpenCampaign: CampaignDetail = {
  id: '701Hs00000CeRtIfIC',
  name: 'Certificaciones Salesforce para la generación 2026 del SF Vibe Lab de la Facultad de Matemáticas',
  description:
    'Los estudiantes que terminan sus módulos de Trailhead y aprueban los exámenes de práctica pueden presentar la certificación de Administrador o de Desarrollador de Plataforma. Cada examen tiene un costo que la mayoría no puede cubrir por su cuenta, y una certificación abre la puerta a su primera práctica profesional.',
  purpose: 'Pagar 10 exámenes de certificación y 10 reintentos para quien no apruebe a la primera.',
  imageUrl: panoramaImage,
  goalAmount: 75000,
  raisedAmount: 2350,
  startDate: '2026-11-05',
  endDate: '2027-01-31',
  status: 'open',
  supporters: [
    { displayName: 'Comunidad Trailblazer Mérida', amount: 2000 },
    { displayName: 'Luis Pech', amount: 350 },
  ],
}

/** A completed campaign far past its goal. */
export const overGoalCompletedCampaign: CampaignDetail = {
  id: '701Hs00000LaPtOpSA',
  name: 'Laptops para el laboratorio',
  description: 'Equipos para que los estudiantes sin computadora propia practiquen en la facultad.',
  purpose: 'Comprar 5 laptops para el laboratorio del SF Vibe Lab.',
  imageUrl: portraitImage,
  goalAmount: 40000,
  raisedAmount: 72500,
  startDate: '2025-01-15',
  endDate: '2025-03-31',
  status: 'completed',
  supporters: [
    { displayName: 'Empresa Ejemplo', amount: 25000 },
    { displayName: 'Familia Canul', amount: 5000 },
    { displayName: 'Ana López', amount: 1000 },
  ],
}

/** A completed campaign whose donors were all anonymous: an empty supporters list. */
export const anonymousCompletedCampaign: CampaignDetail = {
  id: '701Hs00000RiFaNaVI',
  name: 'Rifa navideña 2024',
  description: 'Una rifa entre la comunidad para arrancar el programa.',
  purpose: 'Reunir el fondo inicial del SF Vibe Lab.',
  imageUrl: null,
  goalAmount: 5000,
  raisedAmount: 5300,
  startDate: '2024-12-01',
  endDate: '2024-12-24',
  status: 'completed',
  supporters: [],
}

/** A completed campaign that ended short of its goal. */
export const shortCompletedCampaign: CampaignDetail = {
  id: '701Hs00000TaLLeRAB',
  name: 'Taller de Trailhead 2025',
  description: 'Un taller de fin de semana en Mérida para preparar a la primera generación.',
  purpose: 'Rentar el salón y las computadoras del taller.',
  imageUrl: panoramaImage,
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
 * paths: POST /payment-sessions answers 503 or 500 for them.
 */
export const MOCK_TRIGGERS = {
  providerError: 'provider-error@example.com',
  internalError: 'internal-error@example.com',
} as const
