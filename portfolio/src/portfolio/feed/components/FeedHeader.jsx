import { sitePath } from '../../../lib/sitePath.js'

export default function FeedHeader({ name }) {
  return (
    <header className="site-header !max-w-[980px] !pr-4">
      <a className="wordmark" href={sitePath()}>{name}</a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href={sitePath()}>Portfolio</a>
        <a className="feed-nav-link" href={sitePath('feed')} aria-current="page">Feed</a>
      </nav>
    </header>
  )
}
