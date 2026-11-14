import { useEffect, useState } from 'react'
import {
  fetchAdminInquiries,
  replyToPortfolioInquiry,
  requireSupabase,
  supabase,
  supabaseSetupMessage,
} from '../lib/supabase.js'

export default function useAdminWorkspace() {
  const [session, setSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [content, setContent] = useState(null)
  const [accessState, setAccessState] = useState('checking')
  const [accessError, setAccessError] = useState('')
  const [analyticsError, setAnalyticsError] = useState('')
  const [inquiryError, setInquiryError] = useState('')
  const [notice, setNotice] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true)
      setAccessState('signedOut')
      setAuthError(supabaseSetupMessage)
      return undefined
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionReady(true)
      setAuthError('')
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthError(error.message)
      setSession(data.session)
      setSessionReady(true)
    }).catch((sessionError) => {
      if (active) {
        setAuthError(sessionError.message || 'Could not restore your sign-in session.')
        setSessionReady(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setAccessState('signedOut')
      setContent(null)
      return undefined
    }

    let active = true
    setAccessState('checking')
    setAccessError('')
    setAnalyticsError('')
    setInquiryError('')

    async function loadAdminContent() {
      try {
        const client = requireSupabase()
        const { data: membership, error: membershipError } = await client
          .from('portfolio_admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
        if (membershipError) throw membershipError
        if (!membership) {
          if (active) setAccessState('denied')
          return
        }

        const [profile, settings, projects, skills, education, socials, analytics] = await Promise.all([
          client.from('portfolio_profile').select('*').eq('id', 1).single(),
          client.from('portfolio_site_settings').select('*').eq('id', 1).single(),
          client.from('portfolio_projects').select('*').order('sort_order'),
          client.from('portfolio_skills').select('*').order('sort_order'),
          client.from('portfolio_education').select('*').order('sort_order'),
          client.from('portfolio_social_links').select('*').order('sort_order'),
          client.from('portfolio_analytics_daily').select('viewed_on,page_views').order('viewed_on'),
        ])
        const failedQuery = [profile, settings, projects, skills, education, socials].find((result) => result.error)
        if (failedQuery) throw failedQuery.error

        let inbox = { inquiries: [], messages: [] }
        let inboxError = ''
        try {
          inbox = await fetchAdminInquiries()
        } catch (loadInboxError) {
          inboxError = loadInboxError.message || 'Could not load visitor questions.'
        }

        if (active) {
          setContent({
            profile: profile.data,
            site: settings.data,
            projects: projects.data,
            skills: skills.data,
            education: education.data,
            socials: socials.data,
            analytics: analytics.data || [],
            ...inbox,
          })
          setAnalyticsError(analytics.error?.message || '')
          setInquiryError(inboxError)
          setAccessState('admin')
        }
      } catch (loadError) {
        if (active) {
          setAccessError(loadError.message || 'Could not load admin content.')
          setAccessState('error')
        }
      }
    }

    loadAdminContent()
    return () => { active = false }
  }, [session])

  async function signOut() {
    setSigningOut(true)
    setAuthError('')
    try {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw error
      setSession(null)
      setContent(null)
    } catch (signOutError) {
      setAuthError(signOutError.message || 'Could not sign out.')
    } finally {
      setSigningOut(false)
    }
  }

  async function refreshInquiries() {
    try {
      const inbox = await fetchAdminInquiries()
      setContent((previous) => previous ? { ...previous, ...inbox } : previous)
      setInquiryError('')
    } catch (loadError) {
      setInquiryError(loadError.message || 'Could not load visitor questions.')
    }
  }

  async function sendInquiryReply(inquiryId, body) {
    const messageId = await replyToPortfolioInquiry(inquiryId, body)
    setContent((previous) => ({
      ...previous,
      messages: [
        ...previous.messages,
        {
          id: messageId,
          inquiry_id: inquiryId,
          sender: 'admin',
          body: body.trim(),
          created_at: new Date().toISOString(),
        },
      ],
    }))
    setNotice('Reply sent. The visitor can see it from their private ticket.')
  }

  return {
    session,
    sessionReady,
    authError,
    setAuthError,
    content,
    setContent,
    accessState,
    accessError,
    analyticsError,
    inquiryError,
    notice,
    setNotice,
    signingOut,
    signOut,
    refreshInquiries,
    sendInquiryReply,
  }
}
