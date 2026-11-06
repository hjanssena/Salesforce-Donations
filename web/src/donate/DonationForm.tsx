import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { CFDI_USES, TAX_REGIMES } from '../api/catalogs'
import type { FieldError, PaymentSessionRequest } from '../api/types'
import { validatePaymentSession } from '../api/validation'
import { formatMoney } from '../campaign/format'
import { buildRequest, emptyDetails, type DonorDetails } from './details'
import { fieldMessage } from './messages'
import type { SubmitProblem } from './submit'

interface Props {
  campaignId: string
  amount: number
  onChangeAmount: () => void
  /** The card field. Stripe's in the app; a stand-in in tests. */
  cardField: ReactNode
  /** Resolves to a problem to show, or null while the browser leaves for the thank-you page. */
  onPay: (request: PaymentSessionRequest) => Promise<SubmitProblem | null>
}

type Errors = Partial<Record<string, string>>

function toErrors(fields: FieldError[], details: DonorDetails): Errors {
  const errors: Errors = {}
  for (const error of fields) {
    // An empty invoice email borrows the donor email; its problem is shown there, once.
    if (error.field === 'invoice.email' && details.invoice.email.trim() === '') continue
    errors[error.field] ??= fieldMessage(error)
  }
  return errors
}

/** Field paths in the order they appear, to move focus to the first problem. */
const FIELD_ORDER = [
  'publicName',
  'donorEmail',
  'invoice.taxpayerType',
  'invoice.fullName',
  'invoice.rfc',
  'invoice.postalCode',
  'invoice.taxRegime',
  'invoice.cfdiUse',
  'invoice.email',
]

export default function DonationForm({ campaignId, amount, onChangeAmount, cardField, onPay }: Props) {
  const [details, setDetails] = useState<DonorDetails>(emptyDetails)
  const [errors, setErrors] = useState<Errors>({})
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)
  const prefix = useId()
  const idOf = (field: string) => `${prefix}-${field.replace('.', '-')}`

  // After the first try, errors follow the donor's typing so fixed fields clear.
  function update(next: DonorDetails) {
    setDetails(next)
    if (tried) setErrors(toErrors(validatePaymentSession(buildRequest(campaignId, amount, next)), next))
  }
  const set = <K extends keyof DonorDetails>(key: K, value: DonorDetails[K]) => update({ ...details, [key]: value })
  const setInvoice = <K extends keyof DonorDetails['invoice']>(key: K, value: DonorDetails['invoice'][K]) =>
    update({ ...details, invoice: { ...details.invoice, [key]: value } })

  function focusFirst(found: Errors) {
    const first = FIELD_ORDER.find((field) => found[field])
    if (first) document.getElementById(idOf(first))?.focus()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setTried(true)
    setBusy(true)
    setProblem('')
    const result = await onPay(buildRequest(campaignId, amount, details))
    if (!result) return // Leaving for the thank-you page; stay busy.
    const found = toErrors(result.fields ?? [], details)
    setErrors(found)
    setProblem(result.message)
    setBusy(false)
    focusFirst(found)
  }

  const isCompany = details.invoice.taxpayerType === 'company'

  const field = (path: string, label: string, input: (props: InputProps) => ReactNode, hint?: string, half = false) => (
    <Field id={idOf(path)} label={label} hint={hint} error={errors[path]} input={input} half={half} />
  )

  return (
    <form className="donation" noValidate onSubmit={submit} aria-busy={busy}>
      <div className="donation__chosen">
        <p>
          Tu donativo: <strong className="donation__amount">{formatMoney(amount)}</strong>
        </p>
        <button type="button" className="text-button" onClick={onChangeAmount} disabled={busy}>
          Cambiar monto
        </button>
      </div>

      <fieldset className="group">
        <legend className="group__legend">¿Cómo quieres aparecer?</legend>
        <Choice
          name={`${prefix}-recognition`}
          checked={!details.isAnonymous}
          onChange={() => set('isAnonymous', false)}
          label="Con mi nombre"
          detail="Tu nombre y el monto aparecen en la lista de agradecimientos."
        />
        <Choice
          name={`${prefix}-recognition`}
          checked={details.isAnonymous}
          onChange={() => set('isAnonymous', true)}
          label="Anónimo"
          detail="Tu nombre no aparece en ninguna parte del sitio."
        />
      </fieldset>

      {!details.isAnonymous &&
        field(
          'publicName',
          'Nombre para la lista',
          (props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={details.publicName}
              onChange={(e) => set('publicName', e.target.value)}
            />
          ),
          'Se muestra tal como lo escribas, junto al monto.',
        )}

      {field(
        'donorEmail',
        'Correo electrónico',
        (props) => (
          <input
            {...props}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={details.donorEmail}
            onChange={(e) => set('donorEmail', e.target.value)}
          />
        ),
        'Para enviarte el recibo. Nunca se publica.',
      )}

      <label className="check">
        <input type="checkbox" checked={details.wantsInvoice} onChange={(e) => set('wantsInvoice', e.target.checked)} />
        <span>Necesito factura</span>
      </label>

      {details.wantsInvoice && (
        <div className="invoice">
          <fieldset className="group group--invoice">
            <legend className="group__legend">Datos para tu factura</legend>
            <p className="group__note">Proyecto académico: no se emite una factura fiscal real (CFDI).</p>

            <fieldset
              className="group group--inline"
              aria-describedby={errors['invoice.taxpayerType'] ? `${idOf('invoice.taxpayerType')}-error` : undefined}
            >
              <legend className="field__label">Donas como</legend>
              <Choice
                id={idOf('invoice.taxpayerType')}
                name={`${prefix}-taxpayer`}
                checked={details.invoice.taxpayerType === 'individual'}
                onChange={() => setInvoice('taxpayerType', 'individual')}
                label="Persona física"
              />
              <Choice
                name={`${prefix}-taxpayer`}
                checked={isCompany}
                onChange={() => setInvoice('taxpayerType', 'company')}
                label="Empresa"
              />
              {errors['invoice.taxpayerType'] && (
                <p id={`${idOf('invoice.taxpayerType')}-error`} className="field__error">
                  {errors['invoice.taxpayerType']}
                </p>
              )}
            </fieldset>

            {field(
              'invoice.fullName',
              isCompany ? 'Razón social' : 'Nombre completo',
              (props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete={isCompany ? 'organization' : 'name'}
                  value={details.invoice.fullName}
                  onChange={(e) => setInvoice('fullName', e.target.value)}
                />
              ),
              'Como aparece en tu constancia de situación fiscal.',
            )}

            {field(
              'invoice.rfc',
              'RFC',
              (props) => (
                <input
                  {...props}
                  type="text"
                  className="field__input field__input--code"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={13}
                  value={details.invoice.rfc}
                  onChange={(e) => setInvoice('rfc', e.target.value.toUpperCase())}
                />
              ),
              isCompany ? '12 caracteres.' : '13 caracteres para persona física, 12 para empresa.',
              true,
            )}

            {field(
              'invoice.postalCode',
              'Código postal fiscal',
              (props) => (
                <input
                  {...props}
                  type="text"
                  className="field__input field__input--code field__input--short"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={details.invoice.postalCode}
                  onChange={(e) => setInvoice('postalCode', e.target.value.replace(/\D/g, ''))}
                />
              ),
              '5 números.',
              true,
            )}

            {field('invoice.taxRegime', 'Régimen fiscal', (props) => (
              <select
                {...props}
                value={details.invoice.taxRegime}
                onChange={(e) => setInvoice('taxRegime', e.target.value)}
              >
                <option value="">Elige uno</option>
                {TAX_REGIMES.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} · {r.label}
                  </option>
                ))}
              </select>
            ))}

            {field('invoice.cfdiUse', 'Uso de la factura', (props) => (
              <select
                {...props}
                value={details.invoice.cfdiUse}
                onChange={(e) => setInvoice('cfdiUse', e.target.value)}
              >
                {CFDI_USES.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} · {u.label}
                  </option>
                ))}
              </select>
            ))}

            {field(
              'invoice.email',
              'Correo para la factura (opcional)',
              (props) => (
                <input
                  {...props}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={details.invoice.email}
                  onChange={(e) => setInvoice('email', e.target.value)}
                />
              ),
              'Si lo dejas vacío, la enviamos a tu correo de arriba.',
            )}
          </fieldset>
        </div>
      )}

      <div className="donation__card">
        <p className="field__label">Tarjeta</p>
        {cardField}
        <p className="field__hint">
          Pago de prueba: usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.
        </p>
      </div>

      <p className="donation__problem" role="alert">
        {problem}
      </p>

      <button type="submit" className="sign-button" disabled={busy}>
        {busy ? 'Procesando…' : `Pagar ${formatMoney(amount)}`}
      </button>
    </form>
  )
}

interface InputProps {
  id: string
  className: string
  'aria-invalid': boolean
  'aria-describedby'?: string
}

function Field({
  id,
  label,
  hint,
  error,
  input,
  half = false,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  input: (props: InputProps) => ReactNode
  /** Shares its row with the next half field when the form is wide enough. */
  half?: boolean
}) {
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className="field" data-invalid={error ? 'true' : undefined} data-half={half || undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {input({
        id,
        className: 'field__input',
        'aria-invalid': Boolean(error),
        'aria-describedby': described,
      })}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

function Choice({
  id,
  name,
  checked,
  onChange,
  label,
  detail,
}: {
  id?: string
  name: string
  checked: boolean
  onChange: () => void
  label: string
  detail?: string
}) {
  return (
    <label className="choice">
      <input id={id} type="radio" name={name} checked={checked} onChange={onChange} />
      <span className="choice__text">
        <span className="choice__label">{label}</span>
        {detail && <span className="choice__detail">{detail}</span>}
      </span>
    </label>
  )
}
