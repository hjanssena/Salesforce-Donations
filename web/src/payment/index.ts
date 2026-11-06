import type { AppConfig } from '../config/config'
import { createMockGateway, stripeGateway, type PaymentGateway } from './gateway'

/** The mock API's placeholder clientSecret cannot be confirmed, so the mock API brings the mock gateway. */
export function createGateway(config: Pick<AppConfig, 'apiMode'>): PaymentGateway {
  return config.apiMode === 'mock' ? createMockGateway() : stripeGateway
}
