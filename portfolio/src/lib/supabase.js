import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const supabaseSetupMessage = 'Connect this app to Supabase by setting VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in portfolio/.env, then restart the dev server.'

const recordedViewKey = 'portfolio-view-recorded'

export function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseSetupMessage)
  }

  return supabase
}

export async function fetchPortfolio() {
  const client = requireSupabase()
  const [profile, settings, skills, education, projects, socials] = await Promise.all([
    client.from('portfolio_profile').select('*').eq('id', 1).single(),
    client.from('portfolio_site_settings').select('*').eq('id', 1).single(),
    client.from('portfolio_skills').select('*').order('sort_order'),
    client.from('portfolio_education').select('*').order('sort_order'),
    client.from('portfolio_projects').select('*').order('sort_order'),
    client.from('portfolio_social_links').select('*').order('sort_order'),
  ])

  const failedQuery = [profile, settings, skills, education, projects, socials].find((result) => result.error)
  if (failedQuery) {
    throw failedQuery.error
  }

  return {
    profile: profile.data,
    settings: settings.data,
    skills: skills.data,
    education: education.data,
    projects: projects.data,
    socials: socials.data,
  }
}

export async function recordPortfolioView() {
  const client = requireSupabase()
  if (sessionStorage.getItem(recordedViewKey)) return false

  sessionStorage.setItem(recordedViewKey, 'pending')
  const { error } = await client.rpc('record_portfolio_view')
  if (error) {
    sessionStorage.removeItem(recordedViewKey)
    throw error
  }

  sessionStorage.setItem(recordedViewKey, 'recorded')
  return true
}

export async function fetchPortfolioViewCount() {
  const { data, error } = await requireSupabase().rpc('get_portfolio_view_count')
  if (error) throw error
  return Number(data)
}

export async function submitPortfolioInquiry({ name, email, body, accessToken }) {
  const { data, error } = await requireSupabase().rpc('submit_portfolio_inquiry', {
    p_name: name,
    p_email: email,
    p_body: body,
    p_access_token: accessToken,
  })
  if (error) throw error
  return data
}

export async function fetchPortfolioInquiry(accessToken) {
  const { data, error } = await requireSupabase().rpc('get_portfolio_inquiry', {
    p_access_token: accessToken,
  })
  if (error) throw error
  return data
}

export async function fetchAdminInquiries() {
  const client = requireSupabase()
  const { data: inquiries, error: inquiryError } = await client
    .from('portfolio_inquiries')
    .select('id,name,email,created_at,expires_at')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (inquiryError) throw inquiryError

  if (!inquiries.length) return { inquiries, messages: [] }

  const { data: messages, error: messageError } = await client
    .from('portfolio_inquiry_messages')
    .select('id,inquiry_id,sender,body,created_at')
    .in('inquiry_id', inquiries.map(({ id }) => id))
    .order('created_at')
  if (messageError) throw messageError

  return { inquiries, messages }
}

export async function replyToPortfolioInquiry(inquiryId, body) {
  const { data, error } = await requireSupabase().rpc('reply_to_portfolio_inquiry', {
    p_inquiry_id: inquiryId,
    p_body: body,
  })
  if (error) throw error
  return data
}
