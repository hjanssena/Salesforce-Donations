import type { ClientErrorCode } from '../api/client'
import type { FieldError, FieldErrorCode } from '../api/types'
import { MAX_FULL_NAME_LENGTH, MAX_PUBLIC_NAME_LENGTH } from '../api/validation'

/**
 * Spanish text for the contract codes (#36). The API's `message` is for
 * developers; donors only ever read what is here.
 */

const REQUIRED: Record<string, string> = {
  amount: 'Elige un monto.',
  donorEmail: 'Escribe tu correo electrónico.',
  isAnonymous: 'Elige si quieres aparecer con tu nombre o de forma anónima.',
  publicName: 'Escribe el nombre que quieres mostrar.',
  'invoice.fullName': 'Escribe tu nombre completo o razón social, como aparece en tu constancia fiscal.',
  'invoice.taxpayerType': 'Elige si donas como persona física o como empresa.',
  'invoice.rfc': 'Escribe tu RFC.',
  'invoice.postalCode': 'Escribe el código postal de tu domicilio fiscal.',
  'invoice.taxRegime': 'Elige tu régimen fiscal.',
  'invoice.cfdiUse': 'Elige el uso de la factura.',
  'invoice.email': 'Escribe el correo al que enviamos la factura.',
}

const INVALID: Record<string, string> = {
  amount: 'El monto puede tener hasta 2 decimales.',
  donorEmail: 'Revisa tu correo. Debe verse como nombre@ejemplo.com.',
  'invoice.email': 'Revisa el correo. Debe verse como nombre@ejemplo.com.',
  'invoice.rfc':
    'El RFC no tiene el formato del SAT. Revisa letras, fecha y homoclave: 13 caracteres si eres persona física, 12 si es empresa.',
  'invoice.taxpayerType': 'Elige si donas como persona física o como empresa.',
  'invoice.postalCode': 'El código postal debe tener 5 números.',
  'invoice.taxRegime': 'Elige un régimen fiscal de la lista.',
  'invoice.cfdiUse': 'Elige un uso de la factura de la lista.',
}

const TOO_LONG: Record<string, string> = {
  publicName: `Usa como máximo ${MAX_PUBLIC_NAME_LENGTH} caracteres.`,
  'invoice.fullName': `Usa como máximo ${MAX_FULL_NAME_LENGTH} caracteres.`,
  donorEmail: 'El correo es demasiado largo.',
  'invoice.email': 'El correo es demasiado largo.',
}

export function fieldMessage({ field, code }: FieldError): string {
  const byCode: Record<FieldErrorCode, string | undefined> = {
    REQUIRED: REQUIRED[field],
    INVALID_FORMAT: INVALID[field],
    TOO_LONG: TOO_LONG[field],
    AMOUNT_BELOW_MINIMUM: 'El donativo mínimo es de $50.',
    BANNED_WORD: 'Ese nombre no se puede mostrar en la lista. Escribe otro.',
    NOT_ALLOWED: 'Una donación anónima no lleva nombre en la lista.',
  }
  return byCode[code] ?? 'Revisa este dato.'
}

/** A message for the whole form, from an API or network error. Never claims a charge. */
export function errorMessage(code: ClientErrorCode): string {
  switch (code) {
    case 'VALIDATION_FAILED':
      return 'Revisa los datos marcados.'
    case 'CAMPAIGN_NOT_FOUND':
    case 'CAMPAIGN_NOT_OPEN':
      return 'Esta campaña ya no recibe donativos. No se hizo ningún cargo.'
    case 'PAYMENT_PROVIDER_ERROR':
      return 'No pudimos iniciar el pago. No se hizo ningún cargo; inténtalo de nuevo.'
    case 'NETWORK_ERROR':
      return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo; no se hizo ningún cargo.'
    case 'INTERNAL_ERROR':
    case 'BAD_RESPONSE':
      return 'Algo falló de nuestro lado. No se hizo ningún cargo; inténtalo de nuevo en un momento.'
  }
}
