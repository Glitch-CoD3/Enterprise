import '../App.css'
import SiteNavigation from '../components/SiteNavigation.jsx'
import InlineMarkdown from './components/InlineMarkdown.jsx'
import SkillBadge from './components/SkillBadge.jsx'
import { getWhatsAppUrl, groupSkillsByCategory, parseAboutContent } from './content.js'
import { sitePath } from '../lib/sitePath.js'
import usePortfolioData from './usePortfolioData.js'
import usePortfolioInquiry from './usePortfolioInquiry.js'

const visitCountFormatter = new Intl.NumberFormat()
const compactVisitCountFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

function formatProfileVisits(count) {
  if (count < 1000) return visitCountFormatter.format(count)

  const thousands = count / 1000
  if (count < 1_000_000 && Math.round(thousands * 10) < 10_000) {
    return `${compactVisitCountFormatter.format(thousands)}k`
  }

  return `${compactVisitCountFormatter.format(count / 1_000_000)}M`
}

function PortfolioSite() {
  const { portfolio, publicViewCount, error } = usePortfolioData()
  const {
    ticketToken,
    inquiry,
    inquiryLoading,
    inquiryBusy,
    inquiryError,
    inquiryNotice,
    questionName,
    setQuestionName,
    questionEmail,
    setQuestionEmail,
    questionBody,
    setQuestionBody,
    ticketLookup,
    setTicketLookup,
    sendQuestion,
    copyTicket,
    openTicket,
    startNewQuestion,
  } = usePortfolioInquiry()

  if (error) {
    const migrationMissing = /schema cache|does not exist|not find the table/i.test(error)
    return (
      <main className="setup-screen">
        <div className="setup-card">
          <span className="eyebrow">Portfolio setup</span>
          <h1>{migrationMissing ? 'Set up your portfolio database' : 'Connect your portfolio database'}</h1>
          <p>{migrationMissing
            ? `The Supabase connection is working, but the CMS tables have not been created. Run supabase/migrations/20261114010000_portfolio_cms.sql in the Supabase SQL Editor, then refresh. Database error: ${error}`
            : error}</p>
          <a className="button button-primary" href={sitePath('admin')}>Open admin</a>
        </div>
      </main>
    )
  }

  if (!portfolio) {
    return <main className="loading-screen"><span className="loader" />Loading portfolio...</main>
  }

  const { profile, settings, skills, education, projects, socials } = portfolio
  const aboutContent = parseAboutContent(profile.about)
  const aboutHeading = aboutContent.heading || settings.about_heading
  const pageStyle = { '--accent': settings.accent_color || '#3158c8' }
  const whatsappUrl = getWhatsAppUrl(profile.phone || '', profile.location || '')
  const skillGroups = groupSkillsByCategory(skills)

  return (
    <main className="portfolio-page" style={pageStyle}>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Home">{settings.site_title || profile.full_name}</a>
        <SiteNavigation links={[
          { label: aboutHeading, href: '#about' },
          { label: settings.skills_heading, href: '#skills' },
          { label: settings.education_heading, href: '#experience' },
          { label: settings.projects_heading, href: '#work' },
          { label: 'Feed', href: sitePath('feed'), className: 'feed-nav-link' },
          { label: 'Ask a question', href: '#ask' },
        ]} />
        <a
          className="header-contact"
          href={whatsappUrl || `mailto:${profile.email}`}
          aria-label={whatsappUrl ? 'Start a WhatsApp conversation' : undefined}
          target={whatsappUrl ? '_blank' : undefined}
          rel={whatsappUrl ? 'noreferrer' : undefined}
        >
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className="portfolio-layout" id="home">
        <aside className="profile-panel">
          <div className="profile-image-wrap">
            {profile.avatar_url
              ? <img className="profile-image" src={profile.avatar_url} alt={profile.full_name} />
              : <div className="profile-image profile-placeholder">{profile.full_name?.slice(0, 1)}</div>}
            <span className="availability-dot" />
          </div>
          <p className="profile-kicker">{profile.availability || 'Available for opportunities'}</p>
          <h1>{profile.full_name}</h1>
          <p className="profile-role">{profile.role}</p>

          <div className="profile-divider" />
          <dl className="contact-details">
            {profile.email && <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>}
            {profile.phone && <div><dt>Phone</dt><dd><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></dd></div>}
            {profile.location && <div><dt>Based in</dt><dd>{profile.location}</dd></div>}
          </dl>
          {socials.length > 0 && (
            <div className="social-links">
              {socials.map((social) => (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label || social.platform}>
                  {social.label || social.platform}<span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
          {profile.resume_url && <a className="resume-link" href={profile.resume_url} target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a>}
          {publicViewCount !== null && (
            <div className="public-view-count" aria-label={`${new Intl.NumberFormat().format(publicViewCount)} profile visits`}>
              <span>Profile visits</span>
              <strong>{formatProfileVisits(publicViewCount)}</strong>
            </div>
          )}
        </aside>

        <div className="content-panel">
          <section className="hero-section">
            <span className="eyebrow"><span className="eyebrow-mark" /> {settings.tagline}</span>
            <h2>{settings.hero_title}<br /><span>{settings.hero_subtitle}</span></h2>
            <p>{profile.role}{profile.location ? ` · Based in ${profile.location}` : ''}</p>
            <a className="text-link" href="#work">Explore selected work <span aria-hidden="true">↓</span></a>
          </section>

          <section className="content-section" id="about">
            <div className="section-heading"><span>01</span><h2><InlineMarkdown>{aboutHeading}</InlineMarkdown></h2></div>
            {aboutContent.blocks.map((block, index) => {
              if (block.type === 'list') {
                return <ul className="about-list" key={`list-${index}`}>{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown>{item}</InlineMarkdown></li>)}</ul>
              }
              if (block.type === 'heading') {
                return <h3 className="about-subheading" key={`heading-${index}`}><InlineMarkdown>{block.text}</InlineMarkdown></h3>
              }
              return <p className="section-copy" key={`paragraph-${index}`}><InlineMarkdown>{block.text}</InlineMarkdown></p>
            })}
          </section>

          <section className="content-section" id="skills">
            <div className="section-heading"><span>02</span><h2>{settings.skills_heading}</h2></div>
            {skills.length ? (
              <div className="skill-groups">
                {skillGroups.map((group, groupIndex) => (
                  <div className="skill-list" key={`${group.category}-${groupIndex}`}>
                    {group.skills.map((skill) => <SkillBadge key={skill.id} skill={skill} />)}
                  </div>
                ))}
              </div>
            ) : <p className="empty-copy">Skills will be added soon.</p>}
          </section>

          <section className="content-section" id="experience">
            <div className="section-heading"><span>03</span><h2>{settings.education_heading}</h2></div>
            {education.length ? (
              <div className="education-list">
                {education.map((item) => (
                  <article className="education-item" key={item.id}>
                    <span className="education-period">{item.period}</span>
                    <div><h3>{item.qualification}</h3><p className="education-institution">{item.institution}</p><p>{item.description}</p></div>
                  </article>
                ))}
              </div>
            ) : <p className="empty-copy">Education details will be added soon.</p>}
          </section>

          <section className="content-section work-section" id="work">
            <div className="section-heading"><span>04</span><h2>{settings.projects_heading}</h2></div>
            {projects.length ? (
              <div className="project-grid">
                {projects.map((project) => (
                  <article className="project-card" key={project.id}>
                    {project.image_url
                      ? <img className="project-image" src={project.image_url} alt="" loading="lazy" />
                      : <div className="project-image project-image-placeholder" aria-hidden="true">Portfolio</div>}
                    <div className="project-meta"><span>{project.featured ? 'Featured project' : 'Project'}</span><span>{String(project.sort_order).padStart(2, '0')}</span></div>
                    <h3>{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <ul className="technology-list">{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
                    )}
                    {project.project_url && <a className="project-link" href={project.project_url} target="_blank" rel="noreferrer">View project <span aria-hidden="true">↗</span></a>}
                  </article>
                ))}
              </div>
            ) : <p className="empty-copy">Projects will be added soon.</p>}
          </section>

          <section className="content-section inquiry-section" id="ask">
            <div className="section-heading"><span>05</span><h2>Ask a question</h2></div>
            <p className="section-copy">Send a question and check back here for a reply. Conversations are private to your ticket and automatically deleted after 7 days.</p>
            <div className="inquiry-panel">
              {inquiryLoading && !inquiry ? (
                <p className="inquiry-status">Loading your private question ticket…</p>
              ) : inquiry ? (
                <div className="inquiry-thread">
                  <div className="inquiry-thread-heading">
                    <div><strong>Conversation</strong><span>Replies are checked automatically every 30 seconds.</span></div>
                    <small>Expires {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(inquiry.expires_at))}</small>
                  </div>
                  <div className="inquiry-messages" aria-live="polite">
                    {inquiry.messages.map((message) => (
                      <article className={`inquiry-message ${message.sender}`} key={message.id}>
                        <div className="inquiry-message-meta">
                          <strong>{message.sender === 'admin' ? profile.full_name : 'You'}</strong>
                          <time dateTime={message.created_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(message.created_at))}</time>
                        </div>
                        <p>{message.body}</p>
                      </article>
                    ))}
                  </div>
                  <div className="inquiry-ticket">
                    <div><span>Private ticket</span><code>{ticketToken}</code></div>
                    <button className="ticket-button" type="button" onClick={copyTicket}>Copy</button>
                    <button className="ticket-button" type="button" onClick={startNewQuestion}>Ask another</button>
                  </div>
                </div>
              ) : (
                <form className="inquiry-form" onSubmit={sendQuestion}>
                  {inquiryNotice && <p className="inquiry-status" role="status">{inquiryNotice}</p>}
                  {inquiryError && <p className="inquiry-error" role="alert">{inquiryError}</p>}
                  <div className="inquiry-fields">
                    <label>Name
                      <input type="text" autoComplete="name" maxLength={80} value={questionName} onChange={(event) => setQuestionName(event.target.value)} required />
                    </label>
                    <label>Email
                      <input type="email" autoComplete="email" maxLength={254} value={questionEmail} onChange={(event) => setQuestionEmail(event.target.value)} required />
                    </label>
                    <label className="inquiry-question">Your question
                      <textarea rows={5} maxLength={4000} value={questionBody} onChange={(event) => setQuestionBody(event.target.value)} required />
                    </label>
                  </div>
                  <div className="inquiry-lookup">
                    <label htmlFor="ticket-lookup">Already have a private ticket?</label>
                    <div>
                      <input id="ticket-lookup" type="text" autoComplete="off" maxLength={43} value={ticketLookup} onChange={(event) => setTicketLookup(event.target.value)} placeholder="Paste your 43-character ticket" />
                      <button className="ticket-button" type="button" onClick={openTicket} disabled={inquiryLoading}>Open ticket</button>
                    </div>
                  </div>
                  <div className="inquiry-form-footer">
                    <p>Your reply appears in this conversation; no email notification is sent. Save the private ticket to check from another browser.</p>
                    <button className="inquiry-submit" type="submit" disabled={inquiryBusy}>{inquiryBusy ? 'Sending…' : 'Send question'} <span aria-hidden="true">↗</span></button>
                  </div>
                </form>
              )}
              {inquiryError && inquiry && <p className="inquiry-error" role="alert">{inquiryError}</p>}
              {inquiryNotice && inquiry && <p className="inquiry-status" role="status">{inquiryNotice}</p>}
            </div>
          </section>

          <footer className="site-footer">
            <span>© {new Date().getFullYear()} {profile.full_name}</span>
            <a href="http://localhost:8080/store" target="_blank" rel="noopener noreferrer">
              Shop now<span aria-hidden="true">↗</span>
            </a>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default PortfolioSite
