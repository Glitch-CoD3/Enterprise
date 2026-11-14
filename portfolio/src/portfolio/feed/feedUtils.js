export const categories = [
  { id: 'all', label: 'All posts' },
  { id: 'learning', label: 'Daily learnings' },
  { id: 'article', label: 'Articles & blogs' },
  { id: 'clip', label: 'Short clips' },
]

export const categoryLabels = Object.fromEntries(
  categories.filter(({ id }) => id !== 'all').map(({ id, label }) => [id, label]),
)
categoryLabels.photo = 'Photo'

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']

export function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function getVideoEmbed(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    let videoId = ''

    if (['youtu.be', 'www.youtu.be'].includes(host)) {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || ''
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      videoId = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || ''
    }

    if (videoId && /^[\w-]{6,}$/.test(videoId)) {
      return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` }
    }
    if (['vimeo.com', 'www.vimeo.com'].includes(host)) {
      const vimeoId = parsed.pathname.match(/^\/(\d+)/)?.[1]
      if (vimeoId) return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeoId}` }
    }
    if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) return { kind: 'file', src: url }
    return { kind: 'link', src: url }
  } catch {
    return { kind: 'link', src: '' }
  }
}

export function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function initials(name) {
  return name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'J'
}
