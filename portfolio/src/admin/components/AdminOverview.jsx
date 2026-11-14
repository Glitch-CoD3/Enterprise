export default function AdminOverview({ content, analytics, analyticsError, onManageProjects }) {
  const counts = [
    { label: 'Projects', total: content.projects.length, visible: content.projects.filter((row) => row.visible).length },
    { label: 'Skills & tools', total: content.skills.length, visible: content.skills.filter((row) => row.visible).length },
    { label: 'Education entries', total: content.education.length, visible: content.education.filter((row) => row.visible).length },
    { label: 'Social links', total: content.socials.length, visible: content.socials.filter((row) => row.visible).length },
  ]
  const maxDailyViews = Math.max(1, ...analytics.days.map((day) => day.count))

  return (
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
      <div className="quick-actions">
        <div><span className="admin-eyebrow">Quick start</span><h2>Make your next update.</h2><p>Your edits appear on the public portfolio as soon as they are saved.</p></div>
        <button className="admin-button button-accent" onClick={onManageProjects}>Manage projects ↗</button>
      </div>
    </div>
  )
}
