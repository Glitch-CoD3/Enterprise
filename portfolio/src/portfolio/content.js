export function getWhatsAppUrl(phone, location) {
  let number = String(phone || '').replace(/\D/g, '')
  if (!number) return ''
  if (number.startsWith('00')) {
    number = number.slice(2)
  } else if (number.startsWith('0') && /bangladesh/i.test(location)) {
    number = `880${number.slice(1)}`
  }
  return `https://wa.me/${number}`
}

export function getInquiryErrorMessage(error, fallback) {
  const message = error.message || fallback
  if (/schema cache|function .*does not exist|could not find the function/i.test(message)) {
    return `${message} Apply 20261114030000_portfolio_inquiries.sql in Supabase to enable questions.`
  }
  return message
}


export function parseInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*|!\[[^\]]*\]\(https?:\/\/[^)\s]+\))/g).map((part) => {
    const strongMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (strongMatch) return { type: 'strong', text: strongMatch[1] }

    const imageMatch = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/)
    if (imageMatch) return { type: 'image', alt: imageMatch[1], url: imageMatch[2] }

    return { type: 'text', text: part }
  })
}


export function getSkillImage(value) {
  const imageValue = String(value || '').trim()
  const markdownMatch = imageValue.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/)
  return {
    url: markdownMatch ? markdownMatch[2] : imageValue,
    alt: markdownMatch?.[1] || '',
  }
}


export function isShieldsBadge(url) {
  return /^https?:\/\/img\.shields\.io\//i.test(url)
}


export function groupSkillsByCategory(skills) {
  const groups = []
  for (const skill of skills) {
    let group = groups[groups.length - 1]
    if (!group || group.category !== skill.category) {
      group = { category: skill.category, skills: [] }
      groups.push(group)
    }
    group.skills.push(skill)
  }
  return groups
}


export function parseAboutContent(content) {
  const blocks = []
  let heading = ''
  let paragraph = []
  let listItems = []

  function flushParagraph() {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }

  function flushList() {
    if (listItems.length) blocks.push({ type: 'list', items: listItems })
    listItems = []
  }

  for (const rawLine of String(content || '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      if (!heading) {
        heading = headingMatch[2]
      } else {
        blocks.push({ type: 'heading', text: headingMatch[2] })
      }
      continue
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/)
    if (bulletMatch || /^\p{Extended_Pictographic}/u.test(line)) {
      flushParagraph()
      listItems.push(bulletMatch ? bulletMatch[1] : line)
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return { heading, blocks }
}
