export const collections = {
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

export const singleSections = {
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

export const tabs = [
  ['overview', 'Overview'],
  ['inquiries', 'Inquiries'],
  ['profile', 'Profile'],
  ['site', 'Site appearance'],
  ['projects', 'Projects'],
  ['skills', 'Skills & tools'],
  ['education', 'Education'],
  ['socials', 'Social links'],
]

export function emptyForm(fields) {
  return Object.fromEntries(fields.map(({ key, type }) => [
    key,
    type === 'checkbox' ? key === 'visible' : type === 'number' ? 0 : '',
  ]))
}

export function toFormValues(row, fields) {
  const values = { ...emptyForm(fields), ...row }
  if (Array.isArray(values.technologies)) values.technologies = values.technologies.join(', ')
  return values
}

export function summarizeViews(rows) {
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
