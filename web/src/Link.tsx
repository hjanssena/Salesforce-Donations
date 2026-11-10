import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from './router'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** An ordinary link that moves inside the app. New-tab clicks keep working. */
export function Link({ href, onClick, ...rest }: LinkProps) {
  function follow(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={follow} {...rest} />
}
