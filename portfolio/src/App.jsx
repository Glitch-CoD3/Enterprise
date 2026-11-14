import Admin from './Admin.jsx'
import { isSiteRoute } from './lib/sitePath.js'
import PortfolioPage from './portfolio/PortfolioPage.jsx'
import FeedPage from './portfolio/FeedPage.jsx'

export default function App() {
  if (isSiteRoute(window.location.pathname, 'admin')) return <Admin />
  if (isSiteRoute(window.location.pathname, 'feed')) return <FeedPage />
  return <PortfolioPage />
}