import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Bill from './Bill'

describe('Bill', () => {
  it('pastes the photo in a 16:9 frame', () => {
    const { container } = render(<Bill src="https://example.com/a.jpg" />)
    const img = container.querySelector('figure.bill img')
    expect(img?.getAttribute('width')).toBe('1600')
    expect(img?.getAttribute('height')).toBe('900')
  })

  it('takes the bill off the wall when the photo fails to load', () => {
    const { container } = render(<Bill src="https://example.com/missing.png" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('figure')).toBeNull()
  })

  it('tries again when the campaign brings a new photo', () => {
    const { container, rerender } = render(<Bill src="https://example.com/missing.png" />)
    fireEvent.error(container.querySelector('img')!)
    rerender(<Bill src="https://example.com/b.jpg" />)
    expect(container.querySelector('figure')).not.toBeNull()
  })

  it('shows nothing without a photo', () => {
    const { container } = render(<Bill src={null} />)
    expect(container.firstChild).toBeNull()
  })
})
