import { formatMoney } from '../campaign/format'
import type { PaymentRecord } from '../payment/gateway'

export interface Wording {
  title: string
  text: string
  /** Offer to go back and try again. */
  retry: boolean
}

/**
 * The thank-you page's words, by payment status (RF-D4). A succeeded payment
 * is not a recorded donation yet: Salesforce records it when Stripe's notice
 * arrives, so the page never says the donation is confirmed.
 */
export function thanksWording(payment: PaymentRecord | null): Wording {
  if (!payment) {
    return {
      title: 'Sin pago a la vista',
      text: 'Esta página no tiene datos de ningún pago. Si querías donar, vuelve a la campaña.',
      retry: true,
    }
  }
  const amount = formatMoney(payment.amount)
  switch (payment.status) {
    case 'succeeded':
      return {
        title: '¡Gracias!',
        text: `Tu pago de ${amount} se realizó. Estamos registrando tu donativo y te enviaremos el recibo por correo.`,
        retry: false,
      }
    case 'processing':
      return {
        title: 'Tu pago está en proceso',
        text: `Tu banco aún no confirma el pago de ${amount}. Te avisaremos por correo cuando se complete.`,
        retry: false,
      }
    case 'requires_action':
      return {
        title: 'Falta verificar tu pago',
        text: 'Tu banco pidió una verificación que no se completó, así que no se hizo ningún cargo. Puedes intentarlo de nuevo.',
        retry: true,
      }
    case 'requires_payment_method':
    case 'canceled':
      return {
        title: 'El pago no se completó',
        text: 'No se hizo ningún cargo. Puedes volver e intentarlo con otra tarjeta.',
        retry: true,
      }
  }
}
