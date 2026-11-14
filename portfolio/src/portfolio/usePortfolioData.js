import { useEffect, useRef, useState } from 'react'
import { fetchPortfolio, fetchPortfolioViewCount, recordPortfolioView } from '../lib/supabase.js'

const portfolioCacheKey = 'portfolio-content-v1'

function readCachedPortfolio() {
  try {
    const cachedValue = window.sessionStorage.getItem(portfolioCacheKey)
    if (!cachedValue) return null

    const cachedPortfolio = JSON.parse(cachedValue)
    const hasExpectedShape = cachedPortfolio
      && cachedPortfolio.profile
      && cachedPortfolio.settings
      && Array.isArray(cachedPortfolio.skills)
      && Array.isArray(cachedPortfolio.education)
      && Array.isArray(cachedPortfolio.projects)
      && Array.isArray(cachedPortfolio.socials)

    return hasExpectedShape ? cachedPortfolio : null
  } catch (cacheError) {
    console.error('Could not read cached portfolio content:', cacheError)
    return null
  }
}

function cachePortfolio(portfolio) {
  try {
    window.sessionStorage.setItem(portfolioCacheKey, JSON.stringify(portfolio))
  } catch (cacheError) {
    console.error('Could not cache portfolio content:', cacheError)
  }
}

export default function usePortfolioData() {
  const [portfolio, setPortfolio] = useState(readCachedPortfolio)
  const hasCachedPortfolio = useRef(Boolean(portfolio))
  const [publicViewCount, setPublicViewCount] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchPortfolio()
      .then((data) => {
        if (active) {
          setPortfolio(data)
          setError('')
          hasCachedPortfolio.current = true
          cachePortfolio(data)
        }
      })
      .catch((loadError) => {
        if (!active) return
        if (!hasCachedPortfolio.current) {
          setError(loadError.message || 'Could not load portfolio content.')
          return
        }
        console.error('Could not refresh portfolio content; showing cached content:', loadError)
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
