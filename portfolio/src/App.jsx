import Admin from './Admin.jsx'
import { isSiteRoute } from './lib/sitePath.js'
import PortfolioPage from './portfolio/PortfolioPage.jsx'

export default function App() {
  return isSiteRoute(window.location.pathname, 'admin') ? <Admin /> : <PortfolioPage />
}