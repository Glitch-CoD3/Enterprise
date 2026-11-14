import { useEffect, useState } from 'react'
import { fetchPortfolio, fetchPortfolioViewCount, recordPortfolioView } from '../lib/supabase.js'

export default function usePortfolioData() {
  const [portfolio, setPortfolio] = useState(null)
  const [publicViewCount, setPublicViewCount] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchPortfolio()
      .then((data) => {
        if (active) setPortfolio(data)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load portfolio content.')
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function updateViewCount() {
      try {
        await recordPortfolioView()
      } catch (viewError) {
        if (active) console.error('Could not record portfolio page view:', viewError)
      }

      try {
        const viewCount = await fetchPortfolioViewCount()
        if (active) setPublicViewCount(viewCount)
      } catch (countError) {
        if (active) console.error('Could not load portfolio page view count:', countError)
      }
    }

    updateViewCount()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (portfolio?.settings?.site_title) {
      document.title = `${portfolio.settings.site_title} | Portfolio`
    }
    if (portfolio?.profile?.about) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', portfolio.profile.about)
    }
  }, [portfolio?.settings?.site_title, portfolio?.profile?.about])

  return { portfolio, publicViewCount, error }
}
