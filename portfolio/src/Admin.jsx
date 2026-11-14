import { useMemo, useState } from 'react'
import './Admin.css'
import AdminOverview from './admin/components/AdminOverview.jsx'
import AdminLogin from './admin/components/AdminLogin.jsx'
import ContentEditor from './admin/components/ContentEditor.jsx'
import InquiryInbox from './admin/components/InquiryInbox.jsx'
import { collections, singleSections, summarizeViews, tabs } from './admin/config.js'
import useAdminWorkspace from './admin/useAdminWorkspace.js'
import { sitePath } from './lib/sitePath.js'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')
  const workspace = useAdminWorkspace()
  const {
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
  } = workspace
  const analytics = useMemo(() => summarizeViews(content?.analytics || []), [content?.analytics])

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
          <div className="login-actions"><button className="admin-button button-quiet" onClick={signOut} disabled={signingOut}>Sign out</button><a className="admin-back-link" href={sitePath()}>Back to portfolio</a></div>
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

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href={sitePath()}><span className="brand-mark">J</span><span>Portfolio<span className="brand-subtitle">CONTROL ROOM</span></span></a>
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
          <a href={sitePath()} className="view-site-link">↗ <span>View portfolio</span></a>
          <div className="admin-account"><span className="account-avatar">{session.user.email?.slice(0, 1).toUpperCase()}</span><div><strong>{session.user.email}</strong><span>Administrator</span></div></div>
          <button className="signout-button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span></button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <a className="admin-mobile-brand" href={sitePath()}>
            <span className="brand-mark">J</span>
            <span>Portfolio</span>
          </a>
          <div className="topbar-context">
            <span className="admin-eyebrow">Portfolio management</span>
            <p>Content is saved directly to your Supabase database.</p>
          </div>
          <div className="topbar-actions">
            <a className="admin-top-link" href={sitePath()} target="_blank" rel="noreferrer">
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
            <AdminOverview
              content={content}
              analytics={analytics}
              analyticsError={analyticsError}
              onManageProjects={() => setActiveTab('projects')}
            />
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
              <ContentEditor key={activeTab} activeTab={activeTab} content={content} setContent={setContent} onNotice={setNotice} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
