import { useState } from 'react'

export default function SiteNavigation({ links }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-site-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="mobile-nav-icon" aria-hidden="true"><span /></span>
        <span>{isOpen ? 'Close' : 'Menu'}</span>
      </button>
      <nav
        className={`site-nav${isOpen ? ' is-open' : ''}`}
        id="primary-site-navigation"
        aria-label="Main navigation"
      >
        {links.map(({ label, href, className, current }) => (
          <a
            key={label}
            className={className}
            href={href}
            aria-current={current ? 'page' : undefined}
            onClick={() => setIsOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  )
}
