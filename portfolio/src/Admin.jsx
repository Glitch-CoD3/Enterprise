import { useEffect, useMemo, useState } from 'react'
import './Admin.css'
import {
  fetchAdminInquiries,
  replyToPortfolioInquiry,
  requireSupabase,
  supabase,
  supabaseSetupMessage,
} from './lib/supabase.js'

const collections = {
  projects: {
    title: 'Projects',
    table: 'portfolio_projects',
    fields: [
      { key: 'title', label: 'Project title', required: true },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'image_url', label: 'Project image', upload: true },
      { key: 'technologies', label: 'Technologies', multiline: true, hint: 'Separate each technology with a comma.' },
      { key: 'project_url', label: 'Project URL', type: 'url' },
      { key: 'featured', label: 'Featured project', type: 'checkbox' },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'visible', label: 'Visible on portfolio', type: 'checkbox' },
    ],
  },
  skills: {
    title: 'Skills & tools',
    table: 'portfolio_skills',
    fields: [
      { key: 'name', label: 'Technology or skill', required: true },
      { key: 'category', label: 'Category', hint: 'For example: Development, DevOps, or Databases.' },
      { key: 'icon_url', label: 'Icon or badge URL', hint: 'Paste an image URL or Markdown image such as ![C](https://img.shields.io/badge/...). Shields.io badges display at full size.' },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'visible', label: 'Visible on portfolio', type: 'checkbox' },
    ],
  },
  education: {
    title: 'Education',
    table: 'portfolio_education',
    fields: [
      { key: 'period', label: 'Period' },
      { key: 'qualification', label: 'Qualification', required: true },
      { key: 'institution', label: 'Institution' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'visible', label: 'Visible on portfolio', type: 'checkbox' },
    ],
  },
  socials: {
    title: 'Social links',
    table: 'portfolio_social_links',
    fields: [
      { key: 'platform', label: 'Platform', required: true },
      { key: 'label', label: 'Link label' },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'visible', label: 'Visible on portfolio', type: 'checkbox' },
    ],
  },
}

const singleSections = {
  profile: {
    title: 'Profile',
    table: 'portfolio_profile',
    fields: [
      { key: 'full_name', label: 'Full name', required: true },
      { key: 'role', label: 'Professional title' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone / WhatsApp', hint: 'Use an international number with country code (for example, +880…). This number powers the public “Let’s talk” WhatsApp button.' },
      { key: 'location', label: 'Location' },
      { key: 'avatar_url', label: 'Profile image', upload: true },
      { key: 'about', label: 'About you', multiline: true, hint: 'GitHub-style Markdown works: use ## for a heading, **text** for bold, and * or - for bullet points.' },
      { key: 'availability', label: 'Availability status' },
      { key: 'resume_url', label: 'Résumé URL', type: 'url' },
    ],
  },
  site: {
    title: 'Site appearance',
    table: 'portfolio_site_settings',
    fields: [
      { key: 'site_title', label: 'Site title', required: true },
      { key: 'tagline', label: 'Tagline' },
      { key: 'hero_title', label: 'Hero title' },
      { key: 'hero_subtitle', label: 'Hero subtitle' },
      { key: 'about_heading', label: 'About section heading' },
      { key: 'skills_heading', label: 'Skills section heading' },
      { key: 'education_heading', label: 'Education section heading' },
      { key: 'projects_heading', label: 'Projects section heading' },
      { key: 'accent_color', label: 'Accent color', type: 'color' },
    ],
  },
}

const tabs = [
  ['overview', 'Overview'],
  ['inquiries', 'Inquiries'],
  ['profile', 'Profile'],
  ['site', 'Site appearance'],
  ['projects', 'Projects'],
  ['skills', 'Skills & tools'],
  ['education', 'Education'],
  ['socials', 'Social links'],
]

function emptyForm(fields) {
  return Object.fromEntries(fields.map(({ key, type }) => [
    key,
    type === 'checkbox' ? key === 'visible' : type === 'number' ? 0 : '',
  ]))
}

function toFormValues(row, fields) {
  const values = { ...emptyForm(fields), ...row }
  if (Array.isArray(values.technologies)) values.technologies = values.technologies.join(', ')
  return values
}

function summarizeViews(rows) {
  const viewsByDay = new Map(rows.map((row) => [row.viewed_on, Number(row.page_views)]))
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - (6 - index))
    const dateKey = date.toISOString().slice(0, 10)

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(date),
      count: viewsByDay.get(dateKey) || 0,
    }
  })

  return {
    total: rows.reduce((total, row) => total + Number(row.page_views), 0),
    today: viewsByDay.get(todayKey) || 0,
    lastSevenDays: days.reduce((total, day) => total + day.count, 0),
    days,
  }
}

function AdminLogin({ onSignedIn, error, onError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    onError('')
    try {
      const { error: signInError } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      onSignedIn()
    } catch (loginError) {
      onError(loginError.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href="/">← Back to portfolio</a>
      <form className="login-card" onSubmit={submit}>
        <span className="admin-eyebrow">Portfolio control room</span>
        <h1>Welcome back.</h1>
        <p>Sign in with your portfolio administrator account.</p>
        {error && <div className="admin-alert alert-error" role="alert">{error}</div>}
        <label className="admin-field">Email address
          <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="admin-field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="admin-button button-accent login-submit" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

function FieldInput({ field, value, onChange, onUpload, uploading }) {
  if (field.type === 'checkbox') {
    return (
      <label className="admin-checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.key, event.target.checked)} />
        <span>{field.label}</span>
      </label>
    )
  }

  return (
    <label className={`admin-field ${field.multiline || field.upload ? 'field-wide' : ''}`}>
      {field.label}
      {field.upload ? (
        <div className="upload-field">
          {value && <img className="upload-preview" src={value} alt="Current upload preview" />}
          <input type="text" inputMode="url" value={value || ''} onChange={(event) => onChange(field.key, event.target.value)} placeholder="Paste an image URL or upload a file" />
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onUpload(field.key, event.target.files?.[0])} />
          {uploading && <span className="field-hint">Uploading image…</span>}
        </div>
      ) : field.multiline ? (
        <textarea rows={4} value={value ?? ''} onChange={(event) => onChange(field.key, event.target.value)} required={field.required} />
      ) : field.type === 'color' ? (
        <div className="color-field"><input type="color" value={value || '#3158c8'} onChange={(event) => onChange(field.key, event.target.value)} /><span>{value}</span></div>
      ) : (
        <input type={field.type || 'text'} value={value ?? ''} onChange={(event) => onChange(field.key, event.target.value)} required={field.required} />
      )}
      {field.hint && <span className="field-hint">{field.hint}</span>}
    </label>
  )
}

function AdminEditor({ activeTab, content, setContent, onNotice }) {
  const config = collections[activeTab] || singleSections[activeTab]
  const isCollection = Boolean(collections[activeTab])
  const initialRecord = isCollection ? content[activeTab][0] : content[activeTab]
  const [selectedId, setSelectedId] = useState(() => isCollection ? initialRecord?.id ?? null : null)
  const [form, setForm] = useState(() => initialRecord
    ? toFormValues(initialRecord, config.fields)
    : emptyForm(config.fields))
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const rows = useMemo(() => isCollection ? content[activeTab] : [], [content, activeTab, isCollection])

  const selectedLabel = useMemo(() => {
    const row = rows.find((item) => item.id === selectedId)
    return row?.title || row?.name || row?.qualification || row?.platform || ''
  }, [rows, selectedId])

  function startNew() {
    setSelectedId(null)
    setForm(emptyForm(config.fields))
    setError('')
  }

  function selectRecord(row) {
    setSelectedId(row.id)
    setForm(toFormValues(row, config.fields))
    setError('')
  }

  function discardChanges() {
    const selectedRecord = rows.find((row) => row.id === selectedId)
    if (selectedRecord) {
      selectRecord(selectedRecord)
      return
    }

    startNew()
  }

  function changeField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function uploadImage(fieldKey, file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
      if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.')
      const client = requireSupabase()
      const { data: { user } } = await client.auth.getUser()
      if (!user) throw new Error('Your session expired. Sign in again to upload an image.')
      const safeName = file.name.replace(/[^\w.-]+/g, '-')
      const path = `${user.id}/${Date.now()}-${safeName}`
      const { error: uploadError } = await client.storage.from('portfolio-media').upload(path, file, { contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = client.storage.from('portfolio-media').getPublicUrl(path)
      changeField(fieldKey, data.publicUrl)
      onNotice('Image uploaded. Save changes to publish it.')
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    onNotice('')
    try {
      const payload = { ...form }
      if (Object.hasOwn(payload, 'technologies')) {
        payload.technologies = payload.technologies.split(',').map((technology) => technology.trim()).filter(Boolean)
      }
      if (Object.hasOwn(payload, 'sort_order')) payload.sort_order = Number(payload.sort_order) || 0

      const client = requireSupabase()
      let query = client.from(config.table)
      if (isCollection) {
        query = selectedId
          ? query.update(payload).eq('id', selectedId)
          : query.insert(payload)
      } else {
        query = query.update(payload).eq('id', 1)
      }
      const { data, error: saveError } = await query.select().single()
      if (saveError) throw saveError

      if (isCollection) {
        setContent((previous) => ({
          ...previous,
          [activeTab]: selectedId
            ? previous[activeTab].map((row) => row.id === selectedId ? data : row)
            : [...previous[activeTab], data].sort((a, b) => a.sort_order - b.sort_order),
        }))
        setSelectedId(data.id)
      } else {
        setContent((previous) => ({ ...previous, [activeTab]: data }))
        setForm(toFormValues(data, config.fields))
      }
      onNotice(`${config.title} saved successfully.`)
    } catch (saveError) {
      setError(saveError.message || `Could not save ${config.title.toLowerCase()}.`)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!selectedId || !window.confirm(`Delete "${selectedLabel}"? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    onNotice('')
    try {
      const { error: deleteError } = await requireSupabase().from(config.table).delete().eq('id', selectedId)
      if (deleteError) throw deleteError
      setContent((previous) => ({ ...previous, [activeTab]: previous[activeTab].filter((row) => row.id !== selectedId) }))
      startNew()
      onNotice(`${config.title.slice(0, -1)} deleted.`)
    } catch (deleteError) {
      setError(deleteError.message || `Could not delete ${config.title.toLowerCase()}.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-layout">
      {isCollection && (
        <aside className="record-list">
          <div className="record-list-heading">
            <div><span className="admin-eyebrow">Content library</span><h2>{config.title}</h2></div>
            <button type="button" className="admin-button button-quiet" onClick={startNew}>+ New</button>
          </div>
          <div className="record-items">
            {rows.map((row) => {
              const label = row.title || row.name || row.qualification || row.platform
              return (
                <button type="button" className={`record-item ${selectedId === row.id ? 'record-item-active' : ''}`} key={row.id} onClick={() => selectRecord(row)}>
                  {row.image_url
                    ? <img className="record-thumbnail" src={row.image_url} alt="" />
                    : <span className="record-mark">{label.slice(0, 1)}</span>}
                  <span className="record-item-copy">
                    <span className="record-item-title">{label}</span>
                    <small>{row.visible === false ? 'Hidden' : 'Published'}</small>
                  </span>
                </button>
              )
            })}
            {!rows.length && <p className="record-empty">No entries yet. Add your first one.</p>}
          </div>
        </aside>
      )}

      <form className="editor-form" onSubmit={save}>
        <div className="editor-form-heading">
          <div><span className="admin-eyebrow">{isCollection ? selectedId ? 'Edit entry' : 'New entry' : 'Single record'}</span><h2>{isCollection ? selectedLabel || `New ${config.title.slice(0, -1).toLowerCase()}` : config.title}</h2></div>
          {selectedId && <button className="admin-button button-danger" type="button" onClick={remove} disabled={busy}>Delete</button>}
        </div>
        {error && <div className="admin-alert alert-error" role="alert">{error}</div>}
        <div className="editor-fields">
          {config.fields.map((field) => (
            <FieldInput key={field.key} field={field} value={form[field.key]} onChange={changeField} onUpload={uploadImage} uploading={uploading} />
          ))}
        </div>
        <div className="editor-actions">
          <button className="admin-button button-accent" type="submit" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button>
          {isCollection && <button className="admin-button button-quiet" type="button" onClick={discardChanges}>{selectedId ? 'Discard changes' : 'Clear form'}</button>}
        </div>
      </form>
    </div>
  )
}

function InquiryInbox({ inquiries, messages, error, onRefresh, onReply }) {
  const [selectedId, setSelectedId] = useState(() => inquiries[0]?.id ?? null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const selectedInquiry = inquiries.find((inquiry) => inquiry.id === selectedId)
  const selectedMessages = messages.filter((message) => message.inquiry_id === selectedId)

  useEffect(() => {
    if (!inquiries.some((inquiry) => inquiry.id === selectedId)) {
      setSelectedId(inquiries[0]?.id ?? null)
      setReply('')
    }
  }, [inquiries, selectedId])

  async function sendReply(event) {
    event.preventDefault()
    if (!selectedInquiry) return
    setBusy(true)
    setLocalError('')
    try {
      await onReply(selectedInquiry.id, reply)
      setReply('')
    } catch (replyError) {
      setLocalError(replyError.message || 'Could not send your reply.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-layout inquiry-admin-layout">
      <aside className="record-list">
        <div className="record-list-heading">
          <div><span className="admin-eyebrow">Visitor messages</span><h2>Inbox · {inquiries.length}</h2></div>
          <button type="button" className="admin-button button-quiet" onClick={onRefresh}>Refresh</button>
        </div>
        {error ? (
          <p className="record-empty">Inbox unavailable. Apply the portfolio inquiries migration, then refresh. {error}</p>
        ) : (
          <div className="record-items">
            {inquiries.map((inquiry) => (
              <button
                type="button"
                className={`record-item ${selectedId === inquiry.id ? 'record-item-active' : ''}`}
                key={inquiry.id}
                onClick={() => { setSelectedId(inquiry.id); setReply(''); setLocalError('') }}
              >
                <span className="record-mark">{inquiry.name.slice(0, 1).toUpperCase()}</span>
                <span className="record-item-copy">
                  <span className="record-item-title">{inquiry.name}</span>
                  <small>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(inquiry.created_at))}</small>
                </span>
              </button>
            ))}
            {!inquiries.length && <p className="record-empty">No active questions. New messages will appear here.</p>}
          </div>
        )}
      </aside>

      <section className="editor-form inquiry-admin-form">
        <div className="editor-form-heading">
          <div><span className="admin-eyebrow">Private conversation</span><h2>{selectedInquiry?.name || 'Select a question'}</h2></div>
        </div>
        {error ? (
          <div className="admin-alert alert-error" role="alert">Apply <code>20261114030000_portfolio_inquiries.sql</code> in Supabase to enable the inbox. {error}</div>
        ) : selectedInquiry ? (
          <>
            <div className="inquiry-admin-contact">
              <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
              <span>Auto-deletes {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedInquiry.expires_at))}</span>
            </div>
            {localError && <div className="admin-alert alert-error" role="alert">{localError}</div>}
            <div className="inquiry-admin-messages">
              {selectedMessages.map((message) => (
                <article className={`inquiry-admin-message ${message.sender}`} key={message.id}>
                  <div><strong>{message.sender === 'admin' ? 'You' : selectedInquiry.name}</strong><time dateTime={message.created_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(message.created_at))}</time></div>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>
            <form onSubmit={sendReply}>
              <label className="admin-field">Reply
                <textarea rows={4} maxLength={4000} value={reply} onChange={(event) => setReply(event.target.value)} required />
              </label>
              <div className="editor-actions">
                <button className="admin-button button-accent" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reply'}</button>
              </div>
              <p className="field-hint">The visitor can see your reply from their private ticket on the portfolio. No email notification is sent.</p>
            </form>
          </>
        ) : !error ? (
          <p className="record-empty">Choose an active question to read and reply.</p>
        ) : null}
      </section>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
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

  if (!sessionReady || accessState === 'checking') {
    return <main className="admin-loading"><span className="loader" />Loading admin workspace…</main>
  }

  if (!session) {
    return <AdminLogin onSignedIn={() => setAuthError('')} error={authError} onError={setAuthError} />
  }

  if (accessState === 'denied') {
    return (
      <main className="admin-login-page">
        <div className="login-card">
          <span className="admin-eyebrow">Access restricted</span>
          <h1>Admin access required.</h1>
          <p>This account is not enrolled as a portfolio administrator. Add its user ID to <code>public.portfolio_admins</code> in Supabase.</p>
          {authError && <div className="admin-alert alert-error" role="alert">{authError}</div>}
          <div className="login-actions"><button className="admin-button button-quiet" onClick={signOut} disabled={signingOut}>Sign out</button><a className="admin-back-link" href="/">Back to portfolio</a></div>
        </div>
      </main>
    )
  }

  if (accessState === 'error') {
    return (
      <main className="admin-login-page">
        <div className="login-card">
          <span className="admin-eyebrow">Admin workspace</span><h1>Could not load your workspace.</h1>
          <div className="admin-alert alert-error" role="alert">{accessError}</div>
          <button className="admin-button button-quiet" onClick={signOut}>Sign out</button>
        </div>
      </main>
    )
  }

  if (!content) {
    return <main className="admin-loading"><span className="loader" />Loading admin content…</main>
  }

  const counts = [
    { label: 'Projects', total: content.projects.length, visible: content.projects.filter((row) => row.visible).length },
    { label: 'Skills & tools', total: content.skills.length, visible: content.skills.filter((row) => row.visible).length },
    { label: 'Education entries', total: content.education.length, visible: content.education.filter((row) => row.visible).length },
    { label: 'Social links', total: content.socials.length, visible: content.socials.filter((row) => row.visible).length },
  ]
  const analytics = summarizeViews(content.analytics)
  const maxDailyViews = Math.max(1, ...analytics.days.map((day) => day.count))

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/"><span className="brand-mark">J</span><span>Portfolio<span className="brand-subtitle">CONTROL ROOM</span></span></a>
        <div className="admin-nav-label">Workspace</div>
        <nav className="admin-nav" aria-label="Admin sections">
          {tabs.map(([key, label]) => (
            <button className={activeTab === key ? 'admin-nav-active' : ''} key={key} onClick={() => { setActiveTab(key); setNotice('') }}>
              <span className="nav-indicator" />{label}
              {key === 'projects' && <span className="nav-count">{content?.projects.length}</span>}
              {key === 'inquiries' && <span className="nav-count">{content?.inquiries?.length || 0}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" className="view-site-link">↗ <span>View portfolio</span></a>
          <div className="admin-account"><span className="account-avatar">{session.user.email?.slice(0, 1).toUpperCase()}</span><div><strong>{session.user.email}</strong><span>Administrator</span></div></div>
          <button className="signout-button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span></button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <a className="admin-mobile-brand" href="/">
            <span className="brand-mark">J</span>
            <span>Portfolio</span>
          </a>
          <div className="topbar-context">
            <span className="admin-eyebrow">Portfolio management</span>
            <p>Content is saved directly to your Supabase database.</p>
          </div>
          <div className="topbar-actions">
            <a className="admin-top-link" href="/" target="_blank" rel="noreferrer">
              <span className="desktop-link-label">View live site</span>
              <span className="mobile-link-label">Preview</span> ↗
            </a>
            <button className="mobile-signout" onClick={signOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </header>
        <div className="admin-workspace">
          {authError && <div className="admin-alert alert-error" role="alert">{authError}</div>}
          {notice && <div className="admin-alert alert-success" role="status">{notice}</div>}
          {activeTab === 'overview' ? (
            <div className="overview-page">
              <span className="admin-eyebrow">Your workspace</span>
              <h1>Good work starts<br />with a clear story.</h1>
              <p className="overview-copy">Keep your portfolio current. Update your introduction, add recent projects, and control what visitors see.</p>
              <section className="analytics-panel" aria-labelledby="analytics-title">
                <div className="analytics-heading">
                  <div><span className="admin-eyebrow">Privacy-first traffic</span><h2 id="analytics-title">Profile page views</h2></div>
                  <span className="analytics-note">No personal data collected</span>
                </div>
                {analyticsError ? (
                  <div className="admin-alert alert-error" role="alert">
                    Analytics is not ready: {analyticsError}. Apply the `20261114020000_profile_analytics.sql` migration and refresh.
                  </div>
                ) : (
                  <>
                    <div className="analytics-summary">
                      <div className="analytics-total"><span>All time</span><strong>{analytics.total}</strong><small>Page views</small></div>
                      <div className="analytics-period"><span>Today</span><strong>{analytics.today}</strong></div>
                      <div className="analytics-period"><span>Last 7 days</span><strong>{analytics.lastSevenDays}</strong></div>
                    </div>
                    <div className="visits-chart" aria-label="Profile page views over the last seven days">
                      {analytics.days.map((day) => {
                        const barHeight = day.count ? Math.max((day.count / maxDailyViews) * 100, 8) : 0
                        return (
                          <div className="visit-day" key={day.date}>
                            <span className="visit-count">{day.count}</span>
                            <div className="visit-bar-track"><span style={{ height: `${barHeight}%` }} /></div>
                            <span className="visit-label">{day.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </section>
              <div className="overview-stats">{counts.map(({ label, total, visible }) => <div className="stat-card" key={label}><span>{label}</span><strong>{total}</strong><small>{visible} visible on site</small></div>)}</div>
              <div className="quick-actions"><div><span className="admin-eyebrow">Quick start</span><h2>Make your next update.</h2><p>Your edits appear on the public portfolio as soon as they are saved.</p></div><button className="admin-button button-accent" onClick={() => setActiveTab('projects')}>Manage projects ↗</button></div>
            </div>
          ) : activeTab === 'inquiries' ? (
            <div className="section-editor">
              <div className="section-title"><div><span className="admin-eyebrow">Visitor conversations</span><h1>Inquiries</h1></div></div>
              <InquiryInbox
                inquiries={content.inquiries || []}
                messages={content.messages || []}
                error={inquiryError}
                onRefresh={refreshInquiries}
                onReply={sendInquiryReply}
              />
            </div>
          ) : content && (
            <div className="section-editor">
              <div className="section-title"><div><span className="admin-eyebrow">Manage content</span><h1>{(collections[activeTab] || singleSections[activeTab]).title}</h1></div></div>
              <AdminEditor key={activeTab} activeTab={activeTab} content={content} setContent={setContent} onNotice={setNotice} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
