import { sitePath } from '../../../lib/sitePath.js'
import SiteNavigation from '../../../components/SiteNavigation.jsx'

export default function FeedHeader({ name }) {
  return (
    <header className="site-header !max-w-[980px] !pr-4">
      <a className="wordmark" href={sitePath()}>{name}</a>
      <SiteNavigation links={[
        { label: 'Portfolio', href: sitePath() },
        { label: 'Feed', href: sitePath('feed'), className: 'feed-nav-link', current: true },
      ]} />
    </header>
  )
}
