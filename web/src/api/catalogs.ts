// SAT catalogs from docs/contract.md, section 3. Codes go to the API;
// labels are what the donor sees. The team confirms the final list.

export const TAX_REGIMES = [
  { code: '601', label: 'General de Ley Personas Morales' },
  { code: '603', label: 'Personas Morales con Fines no Lucrativos' },
  { code: '605', label: 'Sueldos y Salarios' },
  { code: '612', label: 'Personas Físicas con Actividades Empresariales' },
  { code: '621', label: 'Incorporación Fiscal' },
  { code: '626', label: 'Régimen Simplificado de Confianza' },
] as const

export const CFDI_USES = [
  { code: 'D04', label: 'Donativos' },
  { code: 'G03', label: 'Gastos en general' },
  { code: 'S01', label: 'Sin efectos fiscales' },
] as const
